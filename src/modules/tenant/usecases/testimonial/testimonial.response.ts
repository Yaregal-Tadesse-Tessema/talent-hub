/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreateTestimonialsCommand } from "./testimonial.command";
import { TestimonialsEntity } from "../../persistencies/testimonials.entity";

export class TestimonialsResponse extends CreateTestimonialsCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(entity: TestimonialsEntity): TestimonialsResponse {
    const response = new TestimonialsResponse();
    response.id = entity?.id;
    response.tenantId = entity.tenantId;
    response.lookupId = entity.lookupId;
    response.testimonial = entity.testimonial;
    return response;
  }
}
