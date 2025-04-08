import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ValidateUserDto {
   @IsEmail()
   @IsNotEmpty()
   email: string ;

   @IsString()
   @IsNotEmpty()
   password: string ;
    
}