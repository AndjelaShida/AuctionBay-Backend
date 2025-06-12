import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})

export class NotificationModule {}