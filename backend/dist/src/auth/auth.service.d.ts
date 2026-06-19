import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimeUsers;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private hashPassword;
    private verifyPassword;
    signToken(payload: {
        id: string;
        name: string;
        email: string;
        role: string;
    }): string;
    verifyToken(token: string): any;
    register(data: any): Promise<{
        user: {
            id: string;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    login(data: any): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    validateUserToken(payload: any): Promise<any>;
}
