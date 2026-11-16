import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Express } from 'express';
import { AppModule } from './app.module.js';

let cachedServer: Express;

export function configureApp(app: INestApplication): void {
  // Orígenes permitidos. Se puede ampliar con la variable CORS_ORIGINS
  // (lista separada por comas) sin recompilar.
  const envOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'https://helpdeskclient.vercel.app',
    'https://help-desk-api-inky.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    ...envOrigins,
  ];

  // Previews de Vercel de ESTOS proyectos (p. ej. helpdeskclient-abc123.vercel.app)
  const allowedVercelPrefixes = ['helpdeskclient', 'help-desk-api-inky'];

  const isAllowedOrigin = (origin: string): boolean => {
    if (allowedOrigins.includes(origin)) return true;
    try {
      const url = new URL(origin);
      return (
        url.protocol === 'https:' &&
        url.hostname.endsWith('.vercel.app') &&
        allowedVercelPrefixes.some((prefix) => url.hostname.startsWith(prefix))
      );
    } catch {
      return false;
    }
  };

  // CORS manejado por el paquete `cors` de Nest. Responde los preflight
  // (OPTIONS) con 204 y los headers correctos; no genera redirecciones.
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      // Requests sin Origin (Postman, curl, apps móviles)
      if (!origin) return callback(null, true);
      callback(null, isAllowedOrigin(origin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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