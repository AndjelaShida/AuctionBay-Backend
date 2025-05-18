import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { User } from 'entities/user.entity';
import { Auction } from 'entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { RoleEnum } from 'role/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Bid } from 'entities/bid.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'email/email.service';

@Injectable()
export class AuctionCoreService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,

    private readonly emailService: EmailService,
  ) {}

  //KREIRANJE AUKCIJE
  async create(
    createAuctionDto: CreateAuctionDto,
    currentUser: User,
  ): Promise<Auction> {
    const now = new Date();
    const hours = createAuctionDto.durationHours ?? 0;
    const minutes = createAuctionDto.durationMinutes ?? 0;

    if (hours === 0 && minutes === 0) {
      throw new BadRequestException('Auction duration must be greater then 0');
    }

    const endTime = new Date(
      now.getTime() + (hours * 60 + minutes) * 60 * 1000,
    );

    const newAuction = this.auctionRepository.create({
      ...createAuctionDto,
      user: currentUser,
      currentPrice: createAuctionDto.startingPrice,
      endTime,
      isClosed: false,
    });
    return this.auctionRepository.save(newAuction);
  }

  // DOHVATANJE SVIH AUKCIJA
  async findAll(): Promise<Auction[]> {
    return this.auctionRepository.find();
  }

  // DOHVATANJE PO ID-ju
  async findOne(id: number): Promise<Auction | null> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
    return auction;
  }

  // AŽURIRANJE AUKCIJE
  async update(
    id: number,
    updateAuctionDto: UpdateAuctionDto,
    currentUser: User,
  ): Promise<Auction> {
    const updatedAuction = await this.auctionRepository.findOne({
      where: { id },
      select: ['user'],
    });
    if (!updatedAuction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    //provera da li korisnik ima pravo da azurira aukciju
    if (
      !(
        currentUser.role.name === RoleEnum.ADMIN ||
        updatedAuction.user.id === currentUser.id
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to update or delete this auction',
      );
    }
    //azuriraj aukciju sa novim podacima
    Object.assign(updatedAuction, updateAuctionDto);
    return this.auctionRepository.save(updatedAuction);
  }

  // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)
  async updateOwnAuction(
    id: number,
    updateAuctionDto: UpdateAuctionDto,
    currentUser: User,
  ): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
    if (auction.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own auctions');
    }
    Object.assign(auction, updateAuctionDto);
    return this.auctionRepository.save(auction);
  }

  // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
  async createForUser(
    currentUser: User,
    updateAuctionDto: UpdateAuctionDto,
  ): Promise<Auction> {
    const newAuction = this.auctionRepository.create({
      ...updateAuctionDto,
      user: currentUser,
    });
    return this.auctionRepository.save(newAuction);
  }

  //PRODAVAC VIDI ISTORIJU PONUDA NA SVOJOJ AUKCIJI(me/auction/:id/bid)
  async getBidsForOwnAuction(
    auctionId: number,
    currentUser: User,
  ): Promise<Bid[]> {
    //trazim aukciju
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['user', 'bids', 'bids.user'],
    });
    //ako aukcija ne postoji -bacam greksu
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }
    //provera da li je vlasnik aukcije isto kao current user
    if (auction.user.id !== currentUser.id) {
      throw new ForbiddenException(
        'This is not your auction and you cant see bids on this auction.',
      );
    }
    return auction.bids;
  }

  //AUTOMATSKO ZATVARANJE AUKCIJE+slanje emaila pobedniku i gubitniku M
  @Cron(CronExpression.EVERY_30_SECONDS)
  async closeExpiredAuction() {
    const currentDate = new Date();

    const expiredAuctions = await this.auctionRepository.find({
      where: {
        endTime: LessThan(currentDate), //trazimo aukcije ciji je endTime manji od trenutnog vremena(sto znaci da su aukcije istekle)
        isClosed: false, //i isClosed:false, znaci da aukcija jos nije istekla, znaci trebamo je zatvoriti
      },
      relations: ['user', 'bids', 'bids.user'], //ovde se trazi da se ucitaju povezani podaci za user(vlasnika auckije),
      //bids8(ponude aukciji) i bids.user(korisnici koji su dali ponude)
    });

    for (const auction of expiredAuctions) {
      //for petlja iretira kroz sve aukcije koje su istekle i koje nisu zatvorene, za svaku aukciju se izvrsava kod unutar petlje
      auction.isClosed = true; //zatvaramo aukciju tako sto posatavljamo na true.Ovo oznacava da je aukcija zatvorena.

      //simuliramo slanje emaila korisniku cija aukcija je istekla
      await this.safeSendEmail(
        auction.user.email, //email adresa vlasnika aukcije
        'The auction has expired.', //subject emaila
        `Your Auction "${auction.name}" has expired. Thank you for using our service.`, //telo emaila
      );

      //nalazenje pobednicke ponude
      const winningBid = auction.bids.reduce(
        (
          max: Bid | null,
          bid: Bid, //Ovde koristimo metodu reduce() da pronadjemo pobednicku ponudu (ponudu sa najvećom vrednoscu).
        ) => (bid.amount > (max?.amount ?? 0) ? bid : max),
        null,
      );

      //saljemo email pobedniku
      if (winningBid) {
        await this.safeSendEmail(
          winningBid.user.email,
          `Congratulations! You won the auction "${auction.name}"`,
          `You have won the auction with your bid of ${winningBid.amount}.`,
        );

        //pronalazimo sve gubitnike
        const losers = auction.bids
          .map((b) => b.user) //pravimo niz korisnika koji su dali ponude na aukciji
          .filter((u) => u.id !== winningBid.user.id); //filtriramo korisnike koji nisu pobedili(tako sto iskljucujemo korisnika koji je dao pobednicku ponudu)

        const uniqueLoser = Array.from(
          new Map(losers.map((u) => [u.id, u])).values(),
        ); //uklanjamo duplikate(ako postoje slucajno)

        await Promise.all(
          uniqueLoser.map((loser: User) =>
            this.safeSendEmail(
              loser.email,
              `Auction result for "${auction.name}"`,
              `Thank you for your participation. Unfortunately, you did not win this auction.`,
            ),
          ), //slanje emaila paralelno svima(pobednicima i gubitnicima )
        );
      }

      await this.auctionRepository.save(auction); //cuvamo stanje aukcije
    }
  }

  //safeSendEmail funckija-funkcija za hvatanje gresaka kod slanja emaila pobedniku i gubitnicima
  private async safeSendEmail(to: string, subject: string, message: string) {
    try {
      await this.emailService.sendEmail(to, subject, message);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error('Email sendig failed');
    }
  }

  // BRISANJE AUKCIJE
  async remove(id: number, currentUser: User): Promise<void> {
    // Pronađi aukciju
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    // Provera da li je korisnik admin ili vlasnik aukcije
    if (
      !(
        currentUser.role.name == RoleEnum.ADMIN ||
        auction.user.id == currentUser.id
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this auction',
      );
    }

    //brisanje aukcije ako je sve ok
    await this.auctionRepository.delete(id);
  }
}
