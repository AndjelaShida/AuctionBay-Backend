import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { Module } from "@nestjs/common";
import { Notification } from "./notification.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})

export class NotificationModule {}