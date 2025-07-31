import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Plantilla APi')
      .setDescription(
        'api rest documentation, using NestJs, Swagger, TypeOrm, PostgreSQL, MongoDB',
      )
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    // -json para acceder al json de swagger
    SwaggerModule.setup('/', app, documentFactory);

    await app.listen(envs.port);
    logger.log(`listening in ${envs.port}`);
  } catch (err) {
    logger.error(err);
  }
}

bootstrap();
