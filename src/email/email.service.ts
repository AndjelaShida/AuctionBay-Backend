import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
    sendEmail(to: string, subject: string, message: string): void {
        console.log(`Simulirani email poslat na ${to}`);
        console.log(`Predmet: ${subject}`);
        console.log(`Poruka: ${message}`);
    }
}