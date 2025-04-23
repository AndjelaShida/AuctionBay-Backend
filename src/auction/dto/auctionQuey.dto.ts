import { IsDecimal, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AuctionQueryDto { //dto koji sadrzi sve u jednom: Paginate,Filter i Search za Auction, odnosno radi sa svim upitima(query)
        @IsOptional()
        @IsString()
        name: string;
        
        @IsOptional()
        @IsString()
        description: string;
    
        @IsOptional()
        @IsNumber()
        startingPrice: number;
        
    
        @IsOptional()
        @IsDecimal()
        currentPrice?: number;
        
        @IsOptional()
        @IsNumber()
        userId?: number;
        
        @IsOptional()
        @IsNumber()
        bidderId?: number;

        @IsOptional()
        @IsInt()
        @Min(1)
        page: number ;
        
        @IsOptional()
        @IsInt()
        @Min(1)
        limit: number;
}