import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Auction } from "entities/auction.entity";
import { Item } from "entities/item.entity";


export class CreateImageDto {

    @IsString()
    path: string ;

    @IsString()
    filename: string ;

    @IsString()
    mimetype: string ;

    @IsNotEmpty()
    @IsInt()
    userId : number ;

    @IsOptional()
    auction? : Auction ;

    @IsOptional()
    item? : Item ;



}