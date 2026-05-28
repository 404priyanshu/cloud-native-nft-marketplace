import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service.js";
import { NonceRequestDto, NonceResponseDto } from "./dto/nonce.dto.js";
import { VerifyRequestDto, VerifyResponseDto } from "./dto/verify.dto.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post("nonce")
  @ApiOkResponse({ type: NonceResponseDto })
  createNonce(@Body() body: NonceRequestDto) {
    return this.authService.createNonce(body.walletAddress);
  }

  @Post("verify")
  @ApiOkResponse({ type: VerifyResponseDto })
  verify(@Body() body: VerifyRequestDto) {
    return this.authService.verify(body.walletAddress, body.signature);
  }
}
