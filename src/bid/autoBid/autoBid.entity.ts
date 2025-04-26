import { IsNumber } from "class-validator";
import { Auction } from "entities/auction.entity";
import { User } from "entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AutoBidEntity {
    @PrimaryGeneratedColumn()
    id: number ;

    @IsNumber()
    maxAmount: number ;

    @ManyToOne(() => Auction)  //moze biti vise Autobidova 
    auction: Auction ;

    @ManyToOne(() => User) //veza izmedju entiteta, vise AutoBid zapisa moze biti povezano sa jednim Userom
    user: User ;

    @CreateDateColumn()
    createdAt: Date 

}