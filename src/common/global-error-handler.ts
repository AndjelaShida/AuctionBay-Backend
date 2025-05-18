import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // dekorator koji govori da klasa hvata sve greske(jer je prazan -ne filtrira po tipu greske)
export class GlobalErrorHandler implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); //dohvatanje http response i request objekta iz kontrksta
    const request = ctx.getRequest<Request>(); //Response i Request tipovi dolaze iz Express framework-a

    const status =
      exception instanceof HttpException //proverava da li je greska instanca HttpException(tj da li je standardna HTTP greska)
        ? exception.getStatus() //ako jeste, uzima njen HTTP status
        : HttpStatus.INTERNAL_SERVER_ERROR; //ako nije, postavlja status na 500 Internal Server Error

    const message = //izvlaci poruku greske
      exception instanceof HttpException
        ? exception.getResponse() //ako je HttpException, poziva getResposne da dobije detalje greske
        : 'Internal server error'; //ako nije, salje genericku poruku Internal server error

    console.error('Global error caught:', exception); //loguje gresku u konzoli

    response.status(status).json({
      //salje http odgovor klijentu sa statusom koji smo dobili
      //telo odgovora ->
      statusCode: status, //HTTP status greske
      timestamp: new Date().toISOString(), //vreme kad se greska desila
      path: request.url, //url na kom se greska dogodila
      error: message, //poruka greske ili detalji
    });
  }
}
