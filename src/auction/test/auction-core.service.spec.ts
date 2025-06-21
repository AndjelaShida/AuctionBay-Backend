import { Test, TestingModule } from '@nestjs/testing';
import { AuctionCoreService } from '../auction-core.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Auction } from '../../entities/auction.entity';
import { User } from 'entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuctionCoreService', () => {
  let service: AuctionCoreService;
  let auctionRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };


  beforeEach(async () => {//pravimo lazni auctionRepository-simuliramo dva metoda koje koristi servis
    auctionRepository = {
      create: jest.fn(), //pravi novi entitet na osnovu DTO-a
      save: jest.fn(), //snima entitet u bazu(ovde samo simulira)
    };

    //kreiramo test modul koji koristi pravi servis ali mockovani repozitorijum
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionCoreService,
        {
          provide: getRepositoryToken(Auction),
          useValue: auctionRepository,
        },
      ],
    }).compile();
     //vadimo instgancu servisa koji testiramo, da mozemo pozvati njegove metode
    service = module.get<AuctionCoreService>(AuctionCoreService);
  });

  it('should throw BadRequestException if duration is 0h and 0min', async () => {
    const dto = {
      name: 'Test',
      description: 'Desc',
      startingPrice: 100,
      durationHours: 0,
      durationMinutes: 0,
    }; //kreiramo lazni dto sa 0h i 0min, sto bi trebalo da izazove gresku

    const user = {} as User;

    await expect(service.create(dto, user)).rejects.toThrow(BadRequestException);
  });

  it('should correctly calculate endTime and save auction', async () => {
    const now = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => now as any);//zamrzavamo vreme u testu, time mozemo da previdimo endTime

    const dto = {
      name: 'Test Auction', 
      description: 'Test Desc',
      startingPrice: 100,
      durationHours: 1,
      durationMinutes: 30,
    };//priprema ispravnog dto-a

    //pravimo laznog korisnika koji kreira aukciju
    const user = {
      id: 1,
      first_name: 'Mock',
      last_name: 'User',
      username: 'mockuser',
      email: 'mock@example.com',
      password: 'hashedpassword',
    } as User;

    // Ručno racunamo ocekivano endTime, na osnovu trajanja iz DTO-a.
    const expectedEndTime = new Date(
      now.getTime() + (1 * 60 + 30) * 60 * 1000,
    );

    const mockAuction = { id: 1, ...dto, endTime: expectedEndTime };

    //kazemo jest-u, ako se pozove create ili save, da nam vrati mockAuction obj
    auctionRepository.create.mockReturnValue(mockAuction);
    auctionRepository.save.mockResolvedValue(mockAuction);

    //pozivamo pravu metodu servisa sa laznim podacima
    const result = await service.create(dto, user);

    //proveravamo da je create pozvan sa ocekivanim vrednostima
    expect(auctionRepository.create).toHaveBeenCalledWith({
      ...dto,
      user,
      currentPrice: dto.startingPrice,
      endTime: expectedEndTime,
      isClosed: false,
    });

    //proveravamo da je save pozvan tacno s onim sto je create vratio
    expect(auctionRepository.save).toHaveBeenCalledWith(mockAuction);
    expect(result).toEqual(mockAuction);
  });
});
