import { IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class CreateBidDto {

    @IsNumber()
    @IsNotEmpty()
    amount: number ;

    @IsNumber()
    @IsNotEmpty()
    auctionId: number ;

    @IsNumber()
    @IsOptional()
    userId: number;
}