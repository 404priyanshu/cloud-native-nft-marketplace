import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlockForgeMarketplaceModule", (m) => {
  const nft = m.contract("BlockForgeNFT");
  const marketplace = m.contract("BlockForgeMarketplace");

  return { nft, marketplace };
});
