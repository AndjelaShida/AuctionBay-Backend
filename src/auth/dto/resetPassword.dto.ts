import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class resetPasswordDto {

    @IsEmail()
    @IsNotEmpty()
    email: string ;

    @IsString()
    @IsNotEmpty()
    newPassword: string ;

}