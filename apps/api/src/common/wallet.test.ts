import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { BadRequestException } from "@nestjs/common";

import { normalizeWalletAddress } from "./wallet.js";

describe("normalizeWalletAddress", () => {
  it("normalizes valid EVM addresses to lowercase checksum-independent form", () => {
    assert.equal(
      normalizeWalletAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
      "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    );
  });

  it("rejects invalid wallet addresses", () => {
    assert.throws(() => normalizeWalletAddress("not-a-wallet"), {
      constructor: BadRequestException,
    });
  });
});
