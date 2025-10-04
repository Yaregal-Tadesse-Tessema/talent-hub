import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AppliedThroughEnums, EmploymentTypeEnums, WorkTypeEnums } from "src/modules/job-posting/constants";

export class CreateAdminJobPostingCommand {
    id: string;
    @ApiProperty()
    @IsNotEmpty()
    tenantName: string;
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
    jobTitle: string;
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

}

export class AdminJobApplicationCommand {
    @ApiProperty()
    @IsNotEmpty()
    jobPostId: string;
    @ApiProperty()
    html?: string;
}