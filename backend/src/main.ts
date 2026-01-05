// Charger les polyfills pour pdf-parse avant tout
import './common/polyfills/pdf-polyfills';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activation de la validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Activation de CORS pour le frontend Angular
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend démarré sur le port ${process.env.PORT ?? 3000}`);
}
bootstrap();
