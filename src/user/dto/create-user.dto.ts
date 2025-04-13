import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { Role } from "entities/role.entity";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    first_name: string; // Polje koje je obavezno

    @IsString()
    @IsNotEmpty()
    last_name: string; // Polje koje je obavezno

    @IsString()
    @IsNotEmpty()
    username: string; // Polje koje je obavezno

    @IsEmail()
    @IsNotEmpty()
    email: string; // Polje koje je obavezno

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    })
    password: string; 

    @IsString()
    @IsNotEmpty()
    config_password: string ;


}
