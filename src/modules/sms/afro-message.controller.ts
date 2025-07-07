/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AfroMessageService } from "./afro-message.service";
import { SendMessageDto } from "./dto";

@Controller('afro-messages')
@ApiTags('afro-messages')
export class AfroMEssageController {
  constructor(private readonly afroMessageService: AfroMessageService) {}
  @Post('create-job-posting')
  async createJobPosting(@Body() command: SendMessageDto) {
    const result = await this.afroMessageService.sendMessage(command.message,command.phoneNumber);
    return result;
  }
}