import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): string {
    return 'Welcome to AuctionBay API!' ;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-error')
testError() {
  throw new Error('Something went wrong!');
}
}
