import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
  const app = await NestFactory.create(AppModule);
 
  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT);

  Logger.log(`App is listening on: ${await app.getUrl()}`, 'Bootstrap') ;
  } catch (error) {
    Logger.error('Error during application startup:', error.message, 'Bootstrap') ;
    process.exit(1);
  };
}

bootstrap();
