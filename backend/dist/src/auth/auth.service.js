"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'smartpark-super-secret-key-12345';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    logger = new common_1.Logger(AuthService_1.name);
    isDbAvailable = true;
    runtimeUsers = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.prisma.user.count();
            this.logger.log('Prisma DB connection is active for Auth.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Auth: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
        }
    }
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
    verifyPassword(password, stored) {
        try {
            const [salt, hash] = stored.split(':');
            const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            return hash === verifyHash;
        }
        catch {
            return false;
        }
    }
    signToken(payload) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify({
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        })).toString('base64url');
        const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
        return `${header}.${body}.${signature}`;
    }
    verifyToken(token) {
        try {
            const [header, body, signature] = token.split('.');
            const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
            if (signature !== expectedSignature)
                return null;
            const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    async register(data) {
        const { name, email, password, role } = data;
        if (!name || !email || !password) {
            throw new common_1.BadRequestException('Name, email, and password are required');
        }
        const hashedPassword = this.hashPassword(password);
        const resolvedRole = role || 'CUSTOMER';
        if (this.isDbAvailable) {
            try {
                const existing = await this.prisma.user.findUnique({ where: { email } });
                if (existing) {
                    throw new common_1.BadRequestException('User with this email already exists');
                }
                const user = await this.prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: resolvedRole,
                    },
                });
                await this.prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'WELCOME',
                        message: `Welcome to SmartPark, ${name}! Your account has been successfully created.`,
                    },
                }).catch(() => { });
                return {
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
                };
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                this.logger.error(`Failed to register in DB: ${err.message}. Falling back.`);
            }
        }
        const existing = this.runtimeUsers.find(u => u.email === email);
        if (existing) {
            throw new common_1.BadRequestException('User with this email already exists');
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
    async login(data) {
        const { email, password } = data;
        if (!email || !password) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        if (this.isDbAvailable) {
            try {
                const user = await this.prisma.user.findUnique({ where: { email } });
                if (!user || !this.verifyPassword(password, user.password)) {
                    throw new common_1.UnauthorizedException('Invalid email or password');
                }
                return {
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
                };
            }
            catch (err) {
                if (err instanceof common_1.UnauthorizedException || err instanceof common_1.BadRequestException)
                    throw err;
                this.logger.error(`Failed to login via DB: ${err.message}. Falling back.`);
            }
        }
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
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token: this.signToken({ id: user.id, name: user.name, email: user.email, role: user.role }),
        };
    }
    async validateUserToken(payload) {
        if (this.isDbAvailable) {
            try {
                const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
                if (user) {
                    return { id: user.id, name: user.name, email: user.email, role: user.role };
                }
            }
            catch { }
        }
        const user = this.runtimeUsers.find(u => u.id === payload.id);
        if (user) {
            return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return payload;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map