/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityEntity } from './persistencies/opportunity.entity';
import { OpportunityRepository } from './persistencies/opportunity.repository';
import { OpportunityService } from './usecase/opportunity.service';
import { OpportunitiesController } from './controller/opportunities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpportunityEntity])],
  controllers: [OpportunitiesController],
  providers: [OpportunityService, OpportunityRepository],
  exports: [OpportunityService, OpportunityRepository],
})
export class OpportunitiesModule {}

