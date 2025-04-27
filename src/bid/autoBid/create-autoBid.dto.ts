import { IsNumber, IsString } from "class-validator";
import { User } from "entities/user.entity";

export class AutoBidDto {


    @IsNumber()
    auctionId: number ;

    @IsNumber()
    maxAmount: number ;

}