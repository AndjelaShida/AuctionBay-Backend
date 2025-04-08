import { IsNumber, IsString } from "class-validator";

export class CreateItemDto {

    @IsString()
    name: string ;

    @IsString()
    description: string ;

    @IsString()
    imageUrl: string ;

    @IsNumber()
    startingPrice: number ;

}