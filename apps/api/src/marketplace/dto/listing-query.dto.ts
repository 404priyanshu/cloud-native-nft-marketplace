import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export const listingStatuses = ["ACTIVE", "SOLD", "CANCELLED"] as const;
export type ListingStatusQuery = (typeof listingStatuses)[number];

export class ListingQueryDto {
  @ApiPropertyOptional({ enum: listingStatuses })
  @IsOptional()
  @IsIn(listingStatuses)
  status?: ListingStatusQuery;
}
