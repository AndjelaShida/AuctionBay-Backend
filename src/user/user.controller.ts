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
    UseGuards} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "@nestjs/passport";



@Controller('users')
export class UserController {
    constructor(private readonly UserService: UserService) {}

      //KREIRANJE KORISNIKA
      @Post('signup')
      async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.UserService.create(createUserDto);
      }
       //DOHVATI SVE KORISNIKE
    @Get()
    async findAll():Promise<User[]> {
        return this.UserService.findAll();
    }
        //DOHVATI PO ID-ju 
        @Get(':id')
        async findOne(@Param('id') id:number): Promise<User | null> {
            return this.UserService.findOne(id) ;
        }
        //AŽURIRAJ KORISNIKA 
        @Put('me/update-password')
        @UseGuards(AuthGuard('jwt'))
        async update(@Param('id') id:number, updateUserDto: UpdateUserDto): Promise<User> {
            return this.UserService.update(id, updateUserDto);
        }

        //DOHVATANJE TRENUTKOG KORISNIKA
        @Get('me')
        @UseGuards(AuthGuard('jwt'))
        async getMe(@Req() req): Promise<User> {
            return this.UserService.getMe(req.user.id) ;
        }
         
        //AZURIRAJ LOZINKU(za trenutnog korisnika)
            @Put('me/update-password')
            @UseGuards(AuthGuard('jwt'))
            async updatePassword(@Req() req, @Body() newPasswordDto: { password: string}) {
                return this.UserService.updatePassword(req.user.id, newPasswordDto.password)
            }
            
    
        //BRISANJE KORISNIKA 
         @Delete(':id')
         async remove(@Param()id:number):Promise<void> {
            await this.UserService.remove(id);
         }
}




