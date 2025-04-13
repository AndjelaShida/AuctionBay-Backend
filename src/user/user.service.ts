//service je odgovoran za obradu podataka, komunikacijom sa bazom i implementacijom pravila aplikacije
// vracanje gresaka
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { hashPassword } from "utilis/bcrypt";
import { Role } from "entities/role.entity";
import { CurrentUser } from "decorators/current-user.decorator";

@Injectable() 
    export class UserService {
        constructor(
            @InjectRepository(User)
            private readonly userRepository: Repository<User>,

            private readonly RoleRepository: Repository<Role>,
    ) {}

//KREIRANJE KORISNIKA
      async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            //hashovanje lozinke
            const hashedPassword = await hashPassword(createUserDto.password); //tacka posle createUserDto.password-se koristi da pristupi svojstvu password(ili koje je vec  svojstvo, RegisterUserDto je klasa, a email je svojstvo (property) te klase.
            // Dakle, kada napišeš createUserDto.password, to znači da pristupaš vrednosti password svojstva objekta ili klase createUserDto.. posle tacke)
            createUserDto.password = hashedPassword;
            
            const user = this.userRepository.create(createUserDto);
            return await this.userRepository.save(user);
        }catch(error) {
            throw new InternalServerErrorException('Error creating user') ;
        }
      }
//DOHVATI SVE KORISNIKE
    async findAll():Promise<User[]>{
        return this.userRepository.find();
    }

//DOHVATI PO ID-ju 
    async findOne(id: number): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            return user; 
        }

//DOHVATI PO EMAILU
        async findOneByEmail(email:string):Promise<User | null> {
            return this.userRepository.findOne({where: {email}}) ;
        }

//DOHVATI PO USERNAME-u
async findOneByUsername(username:string):Promise<User | null> {
    return this.userRepository.findOne({ where: {username}});

}
        
//AŽURIRAJ KORISNIKA 
    async update(
        id:number, 
        updateUserDto: UpdateUserDto, 
        currentUser: User 
    ):Promise<User> {
    //prvo pronadji prema ID-ju
        const updatedUser = await this.userRepository.findOne({ where: {id}}) ;
        //ako korisnik nije pronadjen vratu null ili baci gresku
        if(!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        //ako korisnik nije admin, mozda da azurira samo svoj profil
        if(currentUser.role.name !== 'ADMIN' && currentUser.id !== id) {
            throw new UnauthorizedException('You are not authorized to update this user');
        }
        //azuriraj podatke o korisniku
        Object.assign(updatedUser, updateUserDto);
        return this.userRepository.save(updatedUser);
    }

//DOHVATANJE TRENUTKOG KORISNIKA
    async getMe(id:number):Promise<User> {
        const user = await this.userRepository.findOne({where: {id}}) ;
        if(!user) {
            throw new NotFoundException('User is not found');
        }
        return user ;
    }

//AZURIRAJ LOZINKU
    async updatePassword(
        id:number, 
        newPassword:string
    ): Promise<{message: string}> {
        const user = await this.userRepository.findOne({where: {id}});
        if(!user) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        user.password = await hashPassword(newPassword);
        await this.userRepository.save(user);
        return { message: "Password updated successfully" } ;
    }
//BRISANJE KORISNIKA 
    async remove(
        id:number,
         currentUser: User
        ): Promise<void> {
        //pronadji korisnika prema id-ju i ako nije pronadjen baci gresku
        const result = await this.userRepository.delete(id);
         //svaki korisnik moze da obrise samo sebe, a admin moze da obrise bilo koga
         if(currentUser.role.name !== 'ADMIN' && currentUser.id !== id) {
            throw new UnauthorizedException('You are not authorized to delete this user')
         }
        //ako rezultat brisanja nije uspesan baci gresku
        if(result.affected === 0 ) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }


    } 



