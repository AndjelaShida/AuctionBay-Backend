import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Item } from "./item.entity";
import { Auction } from "./auction.entity";
import { User } from "./user.entity";

@Entity()
export class Image {
    @Column()
    id: number ;

    @Column()
    filename: string ;

    @Column()
    path: string ;

    @Column()
    mimetype: string;

//item
@ManyToOne(() => Item, (item) => item.image)
item: Item ;

//auction
@ManyToOne(() => Auction, (auction) => auction.image)
auction: Auction ;

//user
@ManyToOne(() => User, (user) => user.image)
user: User ;
    
}