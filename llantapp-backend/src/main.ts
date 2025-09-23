import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SRP (seguridad): cabeceras seguras.
  app.use(helmet());

  // Habilitar cookies (refresh token httpOnly).
  app.use(cookieParser());

  // Validaciones globales (DRY): evita duplicar validaciones por endpoint.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // CORS estricto (KISS): solo el frontend.
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
