//entitetski fajlovi sluze za definisanje modela podataka koji se koriste u bazi podataka, tj predstavljaju strukturu podataka
//koja se cuva u bazi.
import { Column , Entity, OneToMany} from "typeorm";
import { BaseEntity } from 'entities/base.entity';  
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { Role } from "role/role.enum";


@Entity() //Entity() se koristi za označavanje klase kao entiteta u TypeORM-u.
export class User extends BaseEntity { 

    @Column()
    first_name: string; 

    @Column()
    last_name: string; 
    
    @Column ({ unique: true, nullable:false }) // //@Column jer ce biti obicna kolona, ({ unique: true }) označava da je vrednost ove kolone jedinstvena u bazi, tj. ne može biti duplicirana.
    username: string ;

    @Column({ unique: true })
    email: string ;

    @Column({ nullable: false })
    password: string; 

    @Column({type:'enum', enum: Role, default: Role.BUYER})
    role: Role ;


    @OneToMany(() => Auction, (auction) => auction.user)  //oznacava da 1 korisnik moze imati vise aukcija
    auction: Auction [] ;

    @OneToMany(() => Bid, (bid) => bid.user)
    bids: Bid [];

    @OneToMany(() => Item, (item) => item.user)
    items: Item[] ;




}