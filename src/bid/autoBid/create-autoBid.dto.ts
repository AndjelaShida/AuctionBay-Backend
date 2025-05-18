import { IsNumber, IsString } from "class-validator";

export class AutoBidDto {


    @IsNumber()
    auctionId: number ;

    @IsNumber()
    maxAmount: number ;

}