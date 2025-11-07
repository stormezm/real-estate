import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  // Serve static files from uploads directory (for distribution statements)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.12.199:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Custom-Query-Key',
      'X-Custom-message',
      'Cookie',
      'Refresh-Token',
      'Access-Control-Allow-Origin',
    ],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
