import { Injectable } from '@nestjs/common';


@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string, message: string): void {
    console.log(`Simulirani email poslat na ${to}`);
    console.log(`Predmet: ${subject}`);
    console.log(`Poruka: ${message}`);
  }

  async sendAuctionLoserEmail(
    email: string,
    auctionName: string,
  ): Promise<void> {
    await this.sendEmail(
      email,
      `Auction result for "${auctionName}"`,
      `Thank you for your participation. Unfortunately, you did not win this auction.`,
    );
  }
}
