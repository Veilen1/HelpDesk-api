import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Express } from 'express';
import { AppModule } from './app.module.js';

let cachedServer: Express;

export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HelpDesk API')
    .setDescription(
      'API REST para gestión de tickets de soporte con roles, comentarios y trazabilidad',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api/docs', app, document);
}

export async function createNestServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    configureApp(app);
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}
