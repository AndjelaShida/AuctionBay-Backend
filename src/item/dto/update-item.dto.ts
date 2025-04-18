import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateItemDto {

    @IsString()
    @IsOptional()
    name: string ;

    @IsString()
    @IsOptional()
    description: string ;

    @IsString()
    @IsOptional()
    imageUrl: string ;

    @IsNumber()
    @IsOptional()
    startingPrice: number ;

}