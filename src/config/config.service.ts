//Servis koji omogućava pristup vrednostima konfiguracije.

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Ova funkcija omogućava pristup vrednostima iz .env fajla, uz primenu validacije pomoću Joi šeme
@Injectable() // Ovaj dekorator označava da je klasa servis, što znači da može biti ubačena (injected) u druge komponente
export class ConfigServiceCustom {
  constructor(private configService: ConfigService) {} // Injectovanje ConfigService u naš servis, kako bi se koristio za pristup konfiguraciji
  get(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      //ako vrednost ne postoji
      throw new Error(`Configuration key ${key} not found`);
    }
    return value;
  }

  // Metoda za proveru i dobijanje vrednosti baze podataka (DB)
  getDbHost(): string {
    return this.get('DB_HOST'); //this.get() se često koristi za dobijanje vrednosti iz konfiguracije
  }

  getDbPort(): number {
    return Number(this.get('DB_PORT')); //Number(this.get-se koristi jer je PORT number, u slucaju greske izbacice NaN, cime cemo mozda lakse naci gresku u kodu
  }

  getDbName(): string {
    return this.get('DB_NAME');
  }

  getDbUser(): string {
    return this.get('DB_USERNAME');
  }

  getDbPassword(): string {
    return String(this.get('DB_PASSWORD'));
  }
}

//U NestJS, kao i u mnogim JavaScript/TypeScript projektima, this.get() se često koristi za dobijanje vrednosti iz konfiguracije, okruženja (environment) ili nekog drugog izvora podataka. Razlika u korišćenju Number() i ne korišćenju bilo kakve konverzije zavisi od tipa podatka koji se očekuje i vrste vrednosti koju vraća this.get().
//this.get('DB_PORT') vraća vrednost koja je najverovatnije string (jer podaci koji se učitavaju iz okruženja, kao što je .env fajl, obično dolaze kao stringovi).
//Budući da port (kao i mnoge druge numeričke vrednosti u konfiguracijama) treba biti broj, koristi se Number() funkcija da bi se konvertovao string u broj. Ovo omogućava da se broj ispravno koristi, na primer, za povezivanje sa bazom podataka ili za postavljanje servera, jer port mora biti broj.
//Number() je siguran način da se izvrši ta konverzija. Ako vrednost nije validan broj, Number() će vratiti NaN, što može biti korisno za detekciju grešaka.
//return this.get('DB_HOST'):

//Za vrednosti koje se odnose na tekstualne informacije (kao što su host imena ili URL-ovi), nema potrebe za konverzijom. this.get('DB_HOST') vraća string koji se direktno koristi kao host adresa za konekciju sa bazom podataka ili drugim servisima.
//U ovom slučaju, vrednost koju dobijate je već u ispravnom formatu (string), pa nema potrebe za dodatnim konvertovanjem.
