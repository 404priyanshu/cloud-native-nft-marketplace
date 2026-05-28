import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther, zeroAddress } from "viem";

const { viem, networkHelpers } = await network.create();

describe("BlockForge Marketplace", function () {
  async function deployMarketplaceFixture() {
    const [owner, seller, buyer, stranger] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    const nft = await viem.deployContract("BlockForgeNFT");
    const marketplace = await viem.deployContract("BlockForgeMarketplace");

    const tokenURI = "ipfs://blockforge-token-1";

    await nft.write.mintNFT([tokenURI], {
      account: seller.account,
    });

    const tokenId = 1n;
    const price = parseEther("1");

    return {
      owner,
      seller,
      buyer,
      stranger,
      publicClient,
      nft,
      marketplace,
      tokenId,
      tokenURI,
      price,
    };
  }

  it("should mint an NFT to the seller", async function () {
    const { nft, seller, tokenId, tokenURI } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    const ownerOfToken = await nft.read.ownerOf([tokenId]);
    const storedTokenURI = await nft.read.tokenURI([tokenId]);

    assert.equal(
      (ownerOfToken as string).toLowerCase(),
      seller.account.address.toLowerCase(),
    );
    assert.equal(storedTokenURI, tokenURI);
  });

  it("should list an NFT and transfer it to marketplace escrow", async function () {
    const { nft, marketplace, seller, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await viem.assertions.emitWithArgs(
      marketplace.write.listNFT([nft.address, tokenId, price], {
        account: seller.account,
      }),
      marketplace,
      "NFTListed",
      [1n, seller.account.address, nft.address, tokenId, price],
    );

    const newOwner = await nft.read.ownerOf([tokenId]);

    assert.equal(
      (newOwner as string).toLowerCase(),
      marketplace.address.toLowerCase(),
    );
  });

  it("should not allow non-owner to list NFT", async function () {
    const { nft, marketplace, stranger, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.listNFT([nft.address, tokenId, price], {
        account: stranger.account,
      });
    }, /NotTokenOwner/);
  });

  it("should not allow listing with zero price", async function () {
    const { nft, marketplace, seller, tokenId } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await assert.rejects(async () => {
      await marketplace.write.listNFT([nft.address, tokenId, 0n], {
        account: seller.account,
      });
    }, /PriceMustBeAboveZero/);
  });

  it("should not allow listing from an invalid NFT contract", async function () {
    const { marketplace, seller, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.listNFT([zeroAddress, tokenId, price], {
        account: seller.account,
      });
    }, /InvalidNFTContract/);
  });

  it("should allow buyer to buy listed NFT", async function () {
    const { nft, marketplace, seller, buyer, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await viem.assertions.emitWithArgs(
      marketplace.write.buyNFT([1n], {
        account: buyer.account,
        value: price,
      }),
      marketplace,
      "NFTSold",
      [1n, buyer.account.address, seller.account.address, nft.address, tokenId, price],
    );

    const newOwner = await nft.read.ownerOf([tokenId]);

    assert.equal(
      (newOwner as string).toLowerCase(),
      buyer.account.address.toLowerCase(),
    );
  });

  it("should reject incorrect payment amount", async function () {
    const { nft, marketplace, seller, buyer, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await assert.rejects(async () => {
      await marketplace.write.buyNFT([1n], {
        account: buyer.account,
        value: parseEther("0.5"),
      });
    }, /IncorrectPayment/);
  });

  it("should reject buying a listing that does not exist", async function () {
    const { marketplace, buyer, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.buyNFT([999n], {
        account: buyer.account,
        value: price,
      });
    }, /ListingDoesNotExist/);
  });

  it("should reject buying a cancelled listing", async function () {
    const { nft, marketplace, seller, buyer, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await viem.assertions.emitWithArgs(
      marketplace.write.cancelListing([1n], {
        account: seller.account,
      }),
      marketplace,
      "ListingCancelled",
      [1n, seller.account.address, nft.address, tokenId],
    );

    await assert.rejects(async () => {
      await marketplace.write.buyNFT([1n], {
        account: buyer.account,
        value: price,
      });
    }, /ListingNotActive/);
  });

  it("should reject buying a sold listing", async function () {
    const { nft, marketplace, seller, buyer, stranger, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await marketplace.write.buyNFT([1n], {
      account: buyer.account,
      value: price,
    });

    await assert.rejects(async () => {
      await marketplace.write.buyNFT([1n], {
        account: stranger.account,
        value: price,
      });
    }, /ListingNotActive/);
  });

  it("should pay seller and marketplace owner correctly", async function () {
    const { nft, marketplace, seller, buyer, owner, publicClient, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    const sellerBalanceBefore = await publicClient.getBalance({
      address: seller.account.address,
    });

    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner.account.address,
    });

    await marketplace.write.buyNFT([1n], {
      account: buyer.account,
      value: price,
    });

    const sellerBalanceAfter = await publicClient.getBalance({
      address: seller.account.address,
    });

    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner.account.address,
    });

    const platformFee = (price * 250n) / 10_000n;
    const sellerAmount = price - platformFee;

    assert.equal(sellerBalanceAfter - sellerBalanceBefore, sellerAmount);
    assert.equal(ownerBalanceAfter - ownerBalanceBefore, platformFee);
  });

  it("should allow seller to cancel active listing", async function () {
    const { nft, marketplace, seller, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await marketplace.write.cancelListing([1n], {
      account: seller.account,
    });

    const ownerAfterCancel = await nft.read.ownerOf([tokenId]);

    assert.equal(
      (ownerAfterCancel as string).toLowerCase(),
      seller.account.address.toLowerCase(),
    );
  });

  it("should not allow stranger to cancel listing", async function () {
    const { nft, marketplace, seller, stranger, tokenId, price } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await nft.write.approve([marketplace.address, tokenId], {
      account: seller.account,
    });

    await marketplace.write.listNFT([nft.address, tokenId, price], {
      account: seller.account,
    });

    await assert.rejects(async () => {
      await marketplace.write.cancelListing([1n], {
        account: stranger.account,
      });
    }, /NotListingSeller/);
  });

  it("should reject cancelling a listing that does not exist", async function () {
    const { marketplace, seller } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.cancelListing([999n], {
        account: seller.account,
      });
    }, /ListingDoesNotExist/);
  });

  it("should allow owner to update platform fee", async function () {
    const { marketplace, owner } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await viem.assertions.emitWithArgs(
      marketplace.write.updatePlatformFee([500n], {
        account: owner.account,
      }),
      marketplace,
      "PlatformFeeUpdated",
      [250n, 500n],
    );

    const platformFeeBps = await marketplace.read.platformFeeBps();

    assert.equal(platformFeeBps, 500n);
  });

  it("should not allow non-owner to update platform fee", async function () {
    const { marketplace, stranger } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.updatePlatformFee([500n], {
        account: stranger.account,
      });
    }, /OwnableUnauthorizedAccount/);
  });

  it("should reject platform fees above 10 percent", async function () {
    const { marketplace, owner } =
      await networkHelpers.loadFixture(deployMarketplaceFixture);

    await assert.rejects(async () => {
      await marketplace.write.updatePlatformFee([1001n], {
        account: owner.account,
      });
    }, /PlatformFeeTooHigh/);
  });
});
