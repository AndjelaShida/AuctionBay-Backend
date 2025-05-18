import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from 'entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CurrentUser } from 'decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //auth/register
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  //auth/login
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.login(loginUserDto);
  }

  //auth/reset-password
  @Post('resetPassword')
  async resetPassword(
    @Body() resetPasswordDto: { email: string; newPassword: string },
    @CurrentUser() currentUser: User,
  ): Promise<{ access_token: string }> {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
      currentUser,
    );
  }

  //auth/validate-user
  @Post('validateUser')
  async validateUser(
    @Body() validateUserDto: { email: string; password: string },
  ): Promise<User> {
    return this.authService.validateUser(
      validateUserDto.email,
      validateUserDto.password,
    );
  }
}
