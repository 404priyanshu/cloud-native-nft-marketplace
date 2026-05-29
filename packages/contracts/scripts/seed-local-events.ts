import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { network } from "hardhat";
import { parseEther } from "viem";

type DeployedAddresses = {
  "BlockForgeMarketplaceModule#BlockForgeMarketplace": `0x${string}`;
  "BlockForgeMarketplaceModule#BlockForgeNFT": `0x${string}`;
};

const deploymentPath = resolve(
  "ignition",
  "deployments",
  "chain-31337",
  "deployed_addresses.json",
);

const deployed = JSON.parse(
  await readFile(deploymentPath, "utf8"),
) as DeployedAddresses;

const { viem } = await network.create({
  chainType: "l1",
  network: "localhost",
});

const [owner, seller, buyer] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();

const nft = await viem.getContractAt(
  "BlockForgeNFT",
  deployed["BlockForgeMarketplaceModule#BlockForgeNFT"],
);
const marketplace = await viem.getContractAt(
  "BlockForgeMarketplace",
  deployed["BlockForgeMarketplaceModule#BlockForgeMarketplace"],
);

console.log("Owner:", owner.account.address);
console.log("Seller:", seller.account.address);
console.log("Buyer:", buyer.account.address);
console.log("NFT:", nft.address);
console.log("Marketplace:", marketplace.address);

type DemoMetadata = {
  description: string;
  image: string;
  name: string;
};

function tokenMetadataUri(metadata: DemoMetadata) {
  return `data:application/json;base64,${Buffer.from(
    JSON.stringify(metadata),
  ).toString("base64")}`;
}

const demoTokens = [
  {
    description:
      "An emerald green swirling plasma orb suspended in a sleek chrome sci-fi chamber, hyper-detailed mechanical details, futuristic 3D render.",
    image: "/images/mockup_nft_3.jpg",
    name: "Aether Catalyst #01",
  },
  {
    description:
      "A cosmic purple and magenta holographic shield with glowing neon circuit patterns, sci-fi energy shield, futuristic blockchain artifact.",
    image: "/images/mockup_nft_2.jpg",
    name: "Nebula Shield #02",
  },
  {
    description:
      "A high-tech glowing blue holographic crystal floating in a dark sci-fi background, premium digital asset design, extremely high details.",
    image: "/images/mockup_nft_1.jpg",
    name: "Crystal Core #03",
  },
] satisfies DemoMetadata[];

const firstMint = await nft.write.mintNFT([tokenMetadataUri(demoTokens[0])], {
  account: seller.account,
});
await publicClient.waitForTransactionReceipt({ hash: firstMint });

const secondMint = await nft.write.mintNFT([tokenMetadataUri(demoTokens[1])], {
  account: seller.account,
});
await publicClient.waitForTransactionReceipt({ hash: secondMint });

const thirdMint = await nft.write.mintNFT([tokenMetadataUri(demoTokens[2])], {
  account: seller.account,
});
await publicClient.waitForTransactionReceipt({ hash: thirdMint });

for (const tokenId of [1n, 2n, 3n]) {
  const approveTx = await nft.write.approve([marketplace.address, tokenId], {
    account: seller.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
}

const soldPrice = parseEther("1");
const cancelledPrice = parseEther("2");
const activePrice = parseEther("3");

const soldList = await marketplace.write.listNFT(
  [nft.address, 1n, soldPrice],
  { account: seller.account },
);
await publicClient.waitForTransactionReceipt({ hash: soldList });

const cancelledList = await marketplace.write.listNFT(
  [nft.address, 2n, cancelledPrice],
  { account: seller.account },
);
await publicClient.waitForTransactionReceipt({ hash: cancelledList });

const activeList = await marketplace.write.listNFT(
  [nft.address, 3n, activePrice],
  { account: seller.account },
);
await publicClient.waitForTransactionReceipt({ hash: activeList });

const buyTx = await marketplace.write.buyNFT([1n], {
  account: buyer.account,
  value: soldPrice,
});
await publicClient.waitForTransactionReceipt({ hash: buyTx });

const cancelTx = await marketplace.write.cancelListing([2n], {
  account: seller.account,
});
await publicClient.waitForTransactionReceipt({ hash: cancelTx });

console.log("Seeded local marketplace events:");
console.log("- token 1 listed and sold");
console.log("- token 2 listed and cancelled");
console.log("- token 3 listed and active");
