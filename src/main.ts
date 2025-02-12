/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'none',
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'IFHCRS',
  };
  const config = new DocumentBuilder()
  .addSecurity('basic', {
    type: 'http',
    scheme: 'basic',
  })
  .addBearerAuth()
  .setTitle('TH APIs')
  .setDescription('LM API Documentation')
  .setVersion('1.0')
  .setContact(
    'Elit Talent Plc',
    'http://talentHub.com/',
    'info@talentHub.com',
  )
  .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('/api', app, document, customOptions);
  await app.listen(3010,()=>console.log(`app listening at port :3010 `));
}
bootstrap();
