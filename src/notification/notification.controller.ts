import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'decorators/current-user.decorator';
import { User } from 'entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
) {}

  @Get()
  async getUserNotification(@CurrentUser() user: User) {
    return this.notificationService.getUserNotification(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: number) {
    await this.notificationService.markAsRead(+id);
    return { message: 'Notification marked as read ' };
  }
}
