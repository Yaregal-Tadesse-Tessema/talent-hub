/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { ApplicationEntity } from '../persistences/application.entity';
@Injectable()
export class ApplicationService extends CommonCrudService<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super(applicationRepository);
  }

//   async createApplication(command: CreateJobPostingCommand) {
//     const jobRequirementCommand: CreateJobRequirementCommand = {
//       educationLevel: command.educationLevel,
//       experienceLevel: command.experienceLevel,
//       fieldOfStudy: command.fieldOfStudy,
//       gpa: command.gpa,
//     };
//     const jobRequirementEntity = CreateJobRequirementCommand.fromDto(
//       jobRequirementCommand,
//     );
//     const jobRequirementResult =
//       await this.jobRequirementService.create(jobRequirementEntity);
//     command.requirementId = jobRequirementResult.id;

//     const jobPostingEntity = CreateJobPostingCommand.fromDto(command);
//     return await this.jobPostingRepository.save(jobPostingEntity);
//   }
}
