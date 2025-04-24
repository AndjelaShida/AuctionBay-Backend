import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "entities/base.entity";
import { User } from "./user.entity";
import { Bid } from "./bid.entity";
import { Item } from "./item.entity";
import { Image } from "./image.entity";
import { timestamp } from "rxjs";

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

    @Column({ type: 'timestamp'})
    endTime: Date ;

    @Column({ default: false})
    isClosed: boolean;


    @ManyToOne(() => User, (user) => user.auction, { lazy: true}) //lazi znaci da ce se user ucitati samo kad direktno pristupis auction.user
    user: User ;

    @OneToMany(() => Bid, (bid) => bid.auction)
    bids: Bid [] ;

    @ManyToMany(() => Item, (item) => item.auction)
    @JoinTable()
    items: Item [] ;

    @ManyToOne(() => User, { lazy: true}) 
    bidder: User; 

    @OneToMany(() => Image, (image) => image.auction)
    images: Image [] ;
}

