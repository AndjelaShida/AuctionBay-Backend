//ovaj fajl sadrzi definiciju DTO klase za kreiranje aukcija. 
// //Ova klasa treba da sadrzi samo podatke, koji su potrebni za kreiranje i azuriranje aukacije.
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAuctionDto {

 @IsString()
 name: string ;

 @IsString()
 description: string;

 @IsNumber() //ukljucuje i decimalne
 startingPrice: number ;

 @IsOptional()
 @IsNumber()
 userId?: number ;

 @IsOptional()
 @IsNumber()
 durationHours: number ;

 @IsOptional()
 @IsNumber()
 durationMinutes?: number ;
}

// @IsString() //ozncava da je string
 //@IsOptional() //ozncava da je polje opciono
 //title?:string ; //? označava da je ovo polje moze biti neprisutno, ali ako bude prisutno mora da bude string



 