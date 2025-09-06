/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AfroMessageService } from "./afro-message.service";
import { SendMessageDto, VerifyOtpDto } from "./dto";

@Controller('afro-messages')
@ApiTags('afro-messages')
export class AfroMEssageController {
  constructor(private readonly afroMessageService: AfroMessageService) {}
  @Post('send-message')
  async createJobPosting(@Body() command: SendMessageDto) {
    const result = await this.afroMessageService.sendMessage(command.message,command.phoneNumber);
    return result;
  }
  @Post('send-otp')
  async sendOtp(@Body() command: SendMessageDto) {
    const result = await this.afroMessageService.sendOtp(command.phoneNumber);
    return result;
  }
  
  @Post('verify-otp')
  async verifyOtp(@Body() command: VerifyOtpDto) {
    const result = await this.afroMessageService.verifyOtp(command);
    return result;
  }
}