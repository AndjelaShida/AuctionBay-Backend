import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalErrorHandler } from 'common/global-error-handler';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });

    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    app.useGlobalFilters(new GlobalErrorHandler());

    const config = new DocumentBuilder()
      .setTitle('AuctionBay API')
      .setDescription('API documentation for AuctionBay')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const PORT = process.env.PORT ?? 5000;

    await app.listen(PORT);

    Logger.log(`App is listening on: ${await app.getUrl()}`, 'Bootstrap');
  } catch (error) {
    Logger.error(
      'Error during application startup:',
      error instanceof Error ? error.message : String(error),
      'Bootstrap',
    );
    process.exit(1);
  }
}

bootstrap();
