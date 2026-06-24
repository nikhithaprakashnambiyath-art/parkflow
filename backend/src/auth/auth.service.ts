import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

const JWT_SECRET =
  process.env.JWT_SECRET || 'smartpark-super-secret-key-change-in-production';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Password helpers ─────────────────────────────────────────────────────

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    try {
      const [salt, hash] = stored.split(':');
      const verify = crypto
        .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
        .toString('hex');
      return hash === verify;
    } catch {
      return false;
    }
  }

  // ── JWT helpers ───────────────────────────────────────────────────────────

  signToken(payload: {
    id: string;
    name: string;
    email: string;
    role: string;
  }): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      }),
    ).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  verifyToken(token: string): any {
    try {
      const [header, body, signature] = token.split('.');
      const expected = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
      if (signature !== expected) return null;

      const payload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      );
      if (payload.exp && Date.now() / 1000 > payload.exp) return null;
      return payload;
    } catch {
      return null;
    }
  }

  // ── Auth actions ──────────────────────────────────────────────────────────

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const { name, email, password, role } = data;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = this.hashPassword(password);
    const resolvedRole = (role as any) || 'CUSTOMER';

    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword, role: resolvedRole },
    });

    // Welcome notification (best-effort)
    await this.prisma.notification
      .create({
        data: {
          userId: user.id,
          type: 'WELCOME',
          message: `Welcome to ParkFlow AI, ${name}! Your account is ready.`,
        },
      })
      .catch(() => {});

    this.logger.log(`New user registered: ${email} (${resolvedRole})`);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: this.signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !this.verifyPassword(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: this.signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const { name, email } = data;

    if (email) {
      const existing = await this.prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Email already in use by another account');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(email && { email }) },
    });

    return { id: updated.id, name: updated.name, email: updated.email, role: updated.role, createdAt: updated.createdAt };
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const { currentPassword, newPassword } = data;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (!this.verifyPassword(currentPassword, user.password)) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: this.hashPassword(newPassword) },
    });

    return { message: 'Password updated successfully' };
  }

  async validateUserToken(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
