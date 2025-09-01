import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  // simple log:
  console.log(`🚀 API ready on http://localhost:${port}/api`);
}
bootstrap();
