import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Express } from 'express';
import { AppModule } from './app.module.js';

let cachedServer: Express;

export function configureApp(app: INestApplication): void {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://help-desk-client-6dsnv1ebo.veilen1s-projects.vercel.app',
    'https://helpdeskclient-6dsnv1ebo.veilen1s-projects.vercel.app',
  ];

  // Configurar CORS explícitamente con las opciones necesarias
  app.enableCors({
    origin: (origin: string | boolean, callback: (err: Error | null, success?: boolean) => void): void => {
      // Permitir requests sin origin (como Postman o mobile apps)
      if (!origin) return callback(null, true);
      // Verificar si el origin está en la lista permitida (cast a string para indexOf)
      if (typeof origin === 'string' && allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
  });

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

  const swaggerVersion = '5.9.0';
  const customOptions = {
    customSiteTitle: 'HelpDesk API Docs',
    customJs: [
      `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${swaggerVersion}/swagger-ui-bundle.js`,
      `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${swaggerVersion}/swagger-ui-standalone-preset.js`,
    ],
    customCssUrl: [
      `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${swaggerVersion}/swagger-ui.css`,
    ],
  };

  SwaggerModule.setup('docs', app, document, customOptions);
  SwaggerModule.setup('api/docs', app, document, customOptions);
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