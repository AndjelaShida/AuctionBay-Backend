// Modul koji se brine o konfiguraciji moje aplikacije.
import { Module } from "@nestjs/common";
import { ConfigModule  } from "@nestjs/config";
import { configValidationShema } from "./config-validation-shema";

@Module ({
    imports: [
        ConfigModule.forRoot({
            isGlobal:true, // Čini konfiguraciju dostupnom u celoj aplikaciji
            envFilePath:['env'], // Putanja do .env fajla sa konfiguracijama
            validationSchema : configValidationShema, // Povezuješ šemu za validaciju sa .env fajlom
        }),

    ],

    exports: [ConfigModule], // Exportuješ ConfigModule ako želiš da bude dostupan i drugim modulima
})

export class ConfigModuleCustom {} // Tvoj custom modul za konfiguraciju