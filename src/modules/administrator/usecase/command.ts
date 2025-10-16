import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AppliedThroughEnums, EmploymentTypeEnums, PaymentTypeEnums, WorkTypeEnums } from "src/modules/job-posting/constants";

export class CreateAdminJobPostingCommand {
    id: string;
    @ApiProperty()
    @IsNotEmpty()
    tenantName: string;
    @ApiProperty()
    companyName: string;
    @ApiProperty()
    @IsNotEmpty()
    tenantAddress: string;
    @ApiProperty()
    tenantPhone: string;
    @ApiProperty()
    jobType: EmploymentTypeEnums;
    @ApiProperty()
    worktype: WorkTypeEnums;
    @ApiProperty()
    @IsNotEmpty()
    title: string;
    @ApiProperty()
    experienceLevel: string;
    @ApiProperty()
    jobRequirement: string[];
    @ApiProperty()
    responsibilities: string[];
    @ApiProperty()
    howToApply: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    skills: string[];
    @ApiProperty()
    description: string;
    @ApiProperty()
    position: string;
    @ApiProperty()
    industry: string;
    @ApiProperty()
    deadline: Date;
    @ApiProperty()
    gender: string;
    @ApiProperty()
    numberOfPosition: number;
    @ApiProperty()
    requiredYearOfExperience: number;
    @ApiProperty()
    appliedThrough: AppliedThroughEnums;
    @ApiProperty()
    postedDate: Date;
    @ApiProperty()
    salary: string;
    @ApiProperty()
    minimumGPA: number;
    @ApiProperty()
    benefits: string[];
    @ApiProperty()
    fieldOfStudy: string;
    @ApiProperty()
    educationLevel: string;
    @ApiProperty()
    paymentType: PaymentTypeEnums;
    @ApiProperty()
    jobPostRequirement: string[];
    @ApiProperty()
    positionNumbers: number;
    @ApiProperty()
    requiredattachements: string[];
    @ApiProperty()
    isFeatured: boolean;
    @ApiProperty()
    hasAiFilter: boolean;
    @ApiProperty()
    hasNormalFilter: boolean;
    @ApiProperty()
    isAdminCreated: boolean;
    @ApiProperty()
    city: string;
    @ApiProperty()
    location: string;
    @ApiProperty()
    applicationURL: string;
}

export class AdminJobApplicationCommand {
    @ApiProperty()
    @IsNotEmpty()
    jobPostId: string;
    @ApiProperty()
    html?: string;
    @ApiProperty()
    @IsNotEmpty()
    userId: string;
}