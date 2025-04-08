import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    login: string ;

    @IsString()
    @IsNotEmpty()
    password: string ;
}