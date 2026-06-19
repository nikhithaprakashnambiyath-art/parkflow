import { Injectable, OnModuleInit, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'smartpark-super-secret-key-12345';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private isDbAvailable = true;

  // In-memory user fallback
  private runtimeUsers: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.user.count();
      this.logger.log('Prisma DB connection is active for Auth.');
    } catch (error) {
      this.logger.warn(`Prisma DB connection failed for Auth: ${error.message}. Using in-memory fallback.`);
      this.isDbAvailable = false;
    }
  }

  // Password hashing helpers
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    try {
      const [salt, hash] = stored.split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch {
      return false;
    }
  }

  // JWT signing
  signToken(payload: { id: string; name: string; email: string; role: string }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  // JWT verification
  verifyToken(token: string): any {
    try {
      const [header, body, signature] = token.split('.');
      const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
      if (signature !== expectedSignature) return null;
      
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  async register(data: any) {
    const { name, email, password, role } = data;
    if (!name || !email || !password) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const hashedPassword = this.hashPassword(password);
    const resolvedRole = role || 'CUSTOMER';

    if (this.isDbAvailable) {
      try {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
          throw new BadRequestException('User with this email already exists');
        }

        const user = await this.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: resolvedRole,
          },
        });

        // Auto-create notification
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'WELCOME',
            message: `Welcome to SmartPark, ${name}! Your account has been successfully created.`,
          },
        }).catch(() => {});

        return {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
        };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(`Failed to register in DB: ${err.message}. Falling back.`);
      }
    }

    // Fallback mode
    const existing = this.runtimeUsers.find(u => u.email === email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = {
      id: `mock-user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: resolvedRole,
      createdAt: new Date(),
    };
    this.runtimeUsers.push(newUser);

    return {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: this.signToken({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }),
    };
  }

  async login(data: any) {
    const { email, password } = data;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (this.isDbAvailable) {
      try {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !this.verifyPassword(password, user.password)) {
          throw new UnauthorizedException('Invalid email or password');
        }

        return {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
        };
      } catch (err: any) {
        if (err instanceof UnauthorizedException || err instanceof BadRequestException) throw err;
        this.logger.error(`Failed to login via DB: ${err.message}. Falling back.`);
      }
    }

    // Fallback mode
    // Seed some initial users for testing if list is empty
    if (this.runtimeUsers.length === 0) {
      this.runtimeUsers.push({
        id: 'mock-user-customer',
        name: 'Alex Mercer',
        email: 'alex@example.com',
        password: this.hashPassword('password123'),
        role: 'CUSTOMER',
        createdAt: new Date(),
      });
      this.runtimeUsers.push({
        id: 'mock-user-admin',
        name: 'Admin Boss',
        email: 'admin@example.com',
        password: this.hashPassword('admin123'),
        role: 'ADMIN',
        createdAt: new Date(),
      });
    }

    const user = this.runtimeUsers.find(u => u.email === email);
    if (!user || !this.verifyPassword(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
    };
  }

  async validateUserToken(payload: any) {
    if (this.isDbAvailable) {
      try {
        const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
        if (user) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
      } catch {}
    }
    const user = this.runtimeUsers.find(u => u.id === payload.id);
    if (user) {
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    // If the mock payload is valid, trust it
    return payload;
  }
}
