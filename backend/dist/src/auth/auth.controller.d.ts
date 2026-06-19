import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        user: {
            id: string;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    login(body: any): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    me(req: any): Promise<any>;
}
