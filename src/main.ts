import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './server.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`HelpDesk API running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}
await bootstrap();
