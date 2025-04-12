import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "entities/base.entity";
import { User } from "./user.entity";
import { Bid } from "./bid.entity";
import { Item } from "./item.entity";
import { Image } from "./image.entitiy";

@Entity()
export class Auction extends BaseEntity {


    @Column()
    name: string; //naziv aukcije

    @Column('text')
    description: string; //opis aukcije

    @Column('decimal')
    startingPrice: number ; //pocetna cena aukcije

    @Column('decimal')
    currentPrice: number ; //trenutna cena aukcije(najveca ponuda)

    @ManyToOne(() => User, (user) => user.auction)
    user: User ;

    @OneToMany(() => Bid, (bid) => bid.auction)
    bids: Bid [] ;

    @ManyToOne(() => Item, (item) => item.auction)
    items: Item[] ;

    @ManyToOne(() => User) 
    bidder: User; 

    @OneToMany(() => Image, (image) => image.auction)
    image: Image ;
}

