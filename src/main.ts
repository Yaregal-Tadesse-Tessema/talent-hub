/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { GlobalExceptionFilter } from './libs/Common/filters/error-handling';
import { JwtAuthGuard } from './modules/auth/jwt.auth.guard';
import { Telegraf } from 'telegraf';
import { TelegramBotService } from './modules/telegram/usecase/telegram-bot.service';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);
  const botService = app.get(TelegramBotService);
  await botService.onModuleInit();
  
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'none',
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'Ethio Talent Hub',
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
  app.enableCors({
    origin: '*',
  });
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_WEBHOOK_DOMAIN) {
    const telegrafBot = app.get(Telegraf); // from nestjs-telegraf
    await telegrafBot.telegram.setWebhook(
      `${process.env.TELEGRAM_WEBHOOK_DOMAIN}/telegraf/webhook`,
    );
  }
  SwaggerModule.setup('/api', app, document, customOptions);
  await app.listen(3010, () => console.log(`app listening at port :3010 `));
}
bootstrap();
