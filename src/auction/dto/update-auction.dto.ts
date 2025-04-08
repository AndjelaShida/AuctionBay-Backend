import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAuctionDto{

 @IsString()
 @IsOptional()  
 name: string ;

 @IsString()
 @IsOptional()  
 description: string;

 @IsNumber() //ukljucuje i decimalne
 @IsOptional()  
 price: number ;

 @IsString()
 @IsOptional()  
 imageUrl: string ;



}