//Modul je tu da organizuje servise i kontrolere koji pripadaju istom domenu (u ovom slučaju "User").

import {  Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "user/user.service";
import { User } from "entities/user.entity";
import { UserController } from "user/user.controller";

@Module ({
    imports: [TypeOrmModule.forFeature([User])], //Registrujemo entitet User u TypeOrm
    controllers: [UserController], //Dodajemo kontrolor za rute korisnikaus
    providers: [UserService], //dodajemo servise
    exports:[UserService], // Omogućavamo da se servis koristi i u drugim modulima
})

export class UserModule {}

