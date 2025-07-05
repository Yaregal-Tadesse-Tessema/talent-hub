/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  EmploymentTypeEnums,
  JobIndustryEnums,
  JobPostingStatusEnums,
  PaymentTypeEnums,
  WorkTypeEnums,
} from '../../constants';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { ApplicationResponse } from 'src/modules/application/usecase/application.response';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { SavedJobsResponse } from './saved-jobs.response';
import { PreScreeningQuestionResponse } from './pre-screening-question/pre-screening-question.response';
import { UserFavoriteJobEntity } from '../persistencies/user-favorite-job.entity';
export class JobPostingResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  position: string;
  @ApiProperty({ default: JobIndustryEnums.INFORMATION_TECHNOLOGY })
  industry: string;

  @ApiProperty()
  type: WorkTypeEnums;
  @ApiProperty({ example: 'Addis Abeba' })
  city: string;
  @ApiProperty({ example: 'Bole Road, Addis Ababa, Ethiopia' })
  location: string;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salaryRange: any;
  @ApiProperty()
  organizationId: string;
  @ApiProperty()
  deadline: Date;
  @ApiProperty()
  skill: string[];
  @ApiProperty()
  benefits: string[];
  @ApiProperty()
  responsibilities: string[];
  @ApiProperty()
  status: JobPostingStatusEnums;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  minimumGPA: number;
  @ApiProperty()
  companyName: string;
  @ApiProperty()
  companyLogo: FileDto;
  @ApiProperty()
  postedDate: Date;
  @ApiProperty()
  applicationURL: string;
  @ApiProperty()
  experienceLevel: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  educationLevel: string;
  @ApiProperty()
  howToApply: string;
  @ApiProperty()
  onHoldDate: Date;
  @ApiProperty()
  applicationCount: number;
  @ApiProperty()
  jobPostRequirement: string[];
  currentUser?: any;
  @ApiProperty({ type: () => [ApplicationResponse] })
  applications: ApplicationResponse[];
  @ApiProperty()
  favoriteJobs: UserFavoriteJobEntity[];
  @ApiProperty({ type: () => [SavedJobsResponse] })
  savedUsers: SavedJobsResponse[];
  @ApiProperty({ type: () => [PreScreeningQuestionResponse] })
  preScreeningQuestions: PreScreeningQuestionResponse[];
  @ApiProperty()
  isSaved: boolean;
  @ApiProperty()
  isApplied: boolean;
  @ApiProperty()
  isFavorite: boolean;
  @ApiProperty()
  positionNumbers: number;
  @ApiProperty()
  paymentType: PaymentTypeEnums;
  @ApiProperty()
  tenantId: string;
  @ApiProperty()
  isFeatured: boolean;
  @ApiProperty()
  hasAiFilter: boolean;
  @ApiProperty()
  hasNormalFilter: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  static toResponse(entity: JobPostingEntity): JobPostingResponse {
    const response = new JobPostingResponse();
    if (!entity) {
      return null;
    }
    response.id = entity.id;
    response.title = entity.title;
    response.description = entity.description;
    response.position = entity.position;
    response.industry = entity.industry;
    response.type = entity.type;
    response.city = entity.city;
    response.location = entity.location;
    response.employmentType = entity.employmentType;
    response.salaryRange = entity.salaryRange;
    response.organizationId = entity.organizationId;
    response.deadline = entity.deadline;
    response.skill = entity.skill;
    response.benefits = entity.benefits;
    response.responsibilities = entity.responsibilities;
    response.status = entity.status;
    response.gender = entity.gender;
    response.minimumGPA = entity.minimumGPA;
    response.companyName = entity.companyName;
    response.companyLogo = entity.companyLogo;
    response.postedDate = entity.postedDate;
    response.applicationURL = entity.applicationURL;
    response.experienceLevel = entity.experienceLevel;
    response.fieldOfStudy = entity.fieldOfStudy;
    response.educationLevel = entity.educationLevel;
    response.howToApply = entity.howToApply;
    response.onHoldDate = entity.onHoldDate;
    response.jobPostRequirement = entity.jobPostRequirement;
    response.applicationCount = entity.applicationCount;
    response.positionNumbers = entity.positionNumbers;
    response.paymentType = entity.paymentType;
    response.tenantId = entity.tenantId;
    response.isFeatured = entity.isFeatured;
    response.favoriteJobs = entity.favoriteJobs;
    response.hasAiFilter = entity.hasAiFilter;
    response.hasNormalFilter = entity.hasNormalFilter;

    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    if (entity?.applications && entity?.applications?.length > 0) {
      response.applications = entity.applications.map((item) =>
        ApplicationResponse.toResponse(item),
      );
    }
    if (entity?.savedUsers?.length > 0) {
      response.savedUsers = entity.savedUsers.map((item) =>
        SavedJobsResponse.toResponse(item),
      );
    }
    if (entity?.preScreeningQuestions?.length > 0) {
      response.preScreeningQuestions = entity.preScreeningQuestions.map(
        (item) => PreScreeningQuestionResponse.toResponse(item),
      );
    }
    // if (entity?.preScreeningQuestions?.length > 0) {
    //   response.preScreeningQuestions = entity.preScreeningQuestions.map(
    //     (item) => PreScreeningQuestionResponse.toResponse(item),
    //   );
    // }
    // if (entity?.favoriteJobs?.length > 0) {
    //   response.favoriteJobs = entity.favoriteJobs.map((item) =>
    //     UserFavoriteJobResponse.toResponse(item),
    //   );
    // }
    return response;
  }
}
