/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentSubscriptionEntity } from './entities/payment-subscription.entity';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { ChapaService } from './services/chapa.service';
import { TelebirrService } from './services/telebirr.service';
import { BankOfAbyssiniaService } from './services/bank-of-abyssinia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, PaymentSubscriptionEntity]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, ChapaService, TelebirrService, BankOfAbyssiniaService],
  exports: [PaymentService, ChapaService, TelebirrService, BankOfAbyssiniaService],
})
export class PaymentModule {}
