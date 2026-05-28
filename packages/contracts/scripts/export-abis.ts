import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type HardhatArtifact = {
  contractName?: unknown;
  abi?: unknown;
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(packageRoot, "exports", "abis");

const contracts = [
  {
    name: "BlockForgeNFT",
    artifactPath: join(
      packageRoot,
      "artifacts",
      "contracts",
      "BlockForgeNFT.sol",
      "BlockForgeNFT.json",
    ),
  },
  {
    name: "BlockForgeMarketplace",
    artifactPath: join(
      packageRoot,
      "artifacts",
      "contracts",
      "BlockForgeMarketplace.sol",
      "BlockForgeMarketplace.json",
    ),
  },
] as const;

await mkdir(outputDir, { recursive: true });

for (const contract of contracts) {
  const artifact = JSON.parse(
    await readFile(contract.artifactPath, "utf8"),
  ) as HardhatArtifact;

  if (artifact.contractName !== contract.name || !Array.isArray(artifact.abi)) {
    throw new Error(`Invalid artifact for ${contract.name}`);
  }

  const outputPath = join(outputDir, `${contract.name}.json`);

  await writeFile(outputPath, `${JSON.stringify(artifact.abi, null, 2)}\n`);

  console.log(`Exported ${contract.name} ABI to ${outputPath}`);
}
