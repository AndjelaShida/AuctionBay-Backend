//AuthService je servis koji se koristi za upravljanje autentifikacijom i autorizacijom korisnika u aplikaciji.

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
import * as bcrypt from 'bcrypt' ;
import { RegisterUserDto } from "./dto/register-user.dto";
import { hashPassword } from "utilis/bcrypt";
import { LoginUserDto } from "./dto/login-user.dto";
import { CurrentUser } from "decorators/current-user.decorator";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}
//REGISTRACIJA
async register(RegisterUserDto: RegisterUserDto): Promise<User> {
    // Provera da li postoji korisnik sa istim email-om
    const existingUserByEmail = await this.userService.findOneByEmail(RegisterUserDto.email);
    if (existingUserByEmail) {
        throw new NotFoundException('Email is already registered');
    }

    // Provera da li postoji korisnik sa istim korisničkim imenom
    const existingUserByUsername = await this.userService.findOneByUsername(RegisterUserDto.username);
    if (existingUserByUsername) {
        throw new NotFoundException('Username is already registered');
    }

    // Kreiranje korisnika u UserService gde se lozinka već hashuje
    return this.userService.create(RegisterUserDto); // Ovaj deo sada koristi RegisterUserDto
}

//PRIJAVA KORISNIKA
   async login(loginUserDto: LoginUserDto): Promise<{access_token: string}> {
     // Provera da li korisnik postoji(prema email ili username)
     const user = await this.userService.findOneByUsername(loginUserDto.login) ;
     if(!user) {
        throw new UnauthorizedException('Invalid credentials');
     }
     //provera lozinke
     const compareHashPassword = await bcrypt.compare(loginUserDto.password, user.password) ;
     if(!compareHashPassword) {
        throw new UnauthorizedException('Invalid credentials');
        
     }
     //generisanje jwt tokena
     const payload = {username: user.username, email:user.email, sub: user.id} ;
     const accesToken = this.jwtService.sign(payload);

     //vracanje tokena
     return {access_token: accesToken} ;

   }
//RESETOVANJE LOZINKE
    async resetPassword(email: string, newPassword: string, currentUser: User): Promise<{access_token: string}> {
        const user = await this.userService.findOneByEmail(email);
        if(!user) {
            throw new UnauthorizedException('User is not found');
        }
        user.password = await hashPassword(newPassword) ;
        await this.userService.update(user.id, user, currentUser);

        return {access_token:'Password updated successfully'}      
    }

//VALIDAICIJA KORISNIKA
    async validateUser(email: string, password: string): Promise<User> {
        console.log('Validating user...'); 

        const user = await this.userService.findOneByEmail(email); 

        if (!user) { 
            throw new NotFoundException('User not found'); 
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); 
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        console.log('User is valid'); 
        return user;
    }
}

    






    
    
