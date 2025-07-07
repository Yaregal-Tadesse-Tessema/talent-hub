export class SendMessageDto {
  message: string;
  phoneNumber: string;
}
export class SendOtpDto {
  phoneNumber: string;
}
export class VerifyOtpDto {
  phoneNumber: string;
  otpCode: string;
  verificationId: string;
}
export class SendBulkMessageDto {
  message: string;
  phoneNumbers: string[];
}
