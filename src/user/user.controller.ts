//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
////Svaka metoda unutar UserController treba da poziva odgovarajući metod iz UserService klase,
// koja je odgovorna za poslovnu logiku i rad sa bazom podataka.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { CurrentUser } from 'decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  //KREIRANJE KORISNIKA
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
  //DOHVATI SVE KORISNIKE
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
  //DOHVATI PO ID-ju
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }
  //AŽURIRAJ KORISNIKA
  @Put('me/update-profile')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.userService.update(currentUser.id, updateUserDto, currentUser);
  }

  //DOHVATANJE TRENUTKOG KORISNIKA
  @Get('me')
  async getMe(@Req() req): Promise<User> {
    return this.userService.getMe(req.user.id);
  }

  //AZURIRAJ LOZINKU(za trenutnog korisnika)
  @Put('me/update-password')
  async updatePassword(
    @Req() req,
    @Body() newPasswordDto: { password: string },
  ) {
    return this.userService.updatePassword(
      req.user.id,
      newPasswordDto.password,
    );
  }

  //BRISANJE KORISNIKA
  @Delete('me')
  async remove(@CurrentUser() currentUser: User): Promise<void> {
    await this.userService.remove(currentUser.id, currentUser);
  }
}
