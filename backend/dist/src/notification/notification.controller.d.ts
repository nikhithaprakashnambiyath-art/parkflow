import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any): Promise<any[]>;
    markAsRead(req: any, id: string): Promise<any>;
}
