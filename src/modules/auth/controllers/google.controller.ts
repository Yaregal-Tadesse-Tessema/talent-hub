/* eslint-disable prettier/prettier */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthService } from '../services/google.service';
import { ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '../allow-anonymous.decorator';

@Controller('google-auth')
@ApiTags('google-Auth')
@AllowAnonymous()
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  // Redirect user to Google login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates the Google OAuth2 login flow
  }

  // Google will redirect here after login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user is set by GoogleStrategy.validate
    await this.googleAuthService.googUserSignUp(req.user, res);
    return res.redirect(
      'http://talent-hub.org/login?status=alreadyActivated',
    );
  }
}
