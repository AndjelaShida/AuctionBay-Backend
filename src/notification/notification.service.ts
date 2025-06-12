import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";
import { Notification } from "./notification.entitiy";


@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}
    
    async createNotification(message: string, user: User): Promise<Notification> {
        const notification = this.notificationRepository.create({
            message,
            user,
        });
        return this.notificationRepository.save(notification);
    }
    
    async getUserNotification(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where : { user: { id: userId} },
            order : { createdAt: 'DESC'},
        });
    }

    async markAsRead(id:number): Promise<void> {
        const notification = await this.notificationRepository.findOne({
             where : { id } 
            });
            if(!notification)
                throw new NotFoundException('Notification not found');
            notification.isRead = true ;
            await this.notificationRepository.save(notification);
    }

}