import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { UsersService } from "./users.service.js";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  @Get(":walletAddress")
  @ApiOkResponse({ description: "User profile by wallet address." })
  getUser(@Param("walletAddress") walletAddress: string) {
    return this.usersService.getUser(walletAddress);
  }

  @Get(":walletAddress/nfts")
  @ApiOkResponse({ description: "Indexed NFTs owned by a wallet address." })
  listUserNfts(@Param("walletAddress") walletAddress: string) {
    return this.usersService.listUserNfts(walletAddress);
  }

  @Get(":walletAddress/listings")
  @ApiOkResponse({ description: "Indexed listings created by a wallet address." })
  listUserListings(@Param("walletAddress") walletAddress: string) {
    return this.usersService.listUserListings(walletAddress);
  }
}
