import { IsNumber, IsOptional } from "class-validator";


export class UpdateBidDto {

        @IsNumber()
        @IsOptional()
        amount: number ;
    
        @IsNumber()
        @IsOptional()
        auctionId: number ;
    
        @IsNumber()
        @IsOptional()
        userId: number;

}