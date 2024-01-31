import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";
import { ethers } from "ethers";

import ERC721_CORE_ABI from "../../abi/ERC721Core.json" assert { type: "json" };

config();

// Uses a clone factory contract to deploy a minimal clone proxy contract for an ERC-721 Core implementation.

// CHAIN: Goerli

// Run: `node scripts/erc721/deploy.js`

const CLONE_FACTORY_ADDRESS = "0x276681b249D043dfd3e833fA2862B797dA2BF68E";
const ERC_721_CORE_INTERFACE = new ethers.utils.Interface(ERC721_CORE_ABI);

async function deployProxy(sdkInstance) {
  const admin = "0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372"; // REPLACE WITH YOUR ADDRESS

  // PARAMS
  const implementation = "0x7720573Fe31a2f2fe523E24CC4904d0040947FA5";
  const initializeData = ERC_721_CORE_INTERFACE.encodeFunctionData(
    "initialize",
    [
      { target: ethers.constants.AddressZero, value: 0, data: "0x" },
      [],
      admin,
      "Hooks NFT Collection",
      "HNC",
      "",
    ]
  );
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [admin, 1])
  );

  // DEPLOY
  const factory = await sdkInstance.getContract(CLONE_FACTORY_ADDRESS);

  const tx = await factory.call("deployProxyByImplementation", [
    implementation,
    initializeData,
    salt,
  ]);

  console.log("\nDeploy proxy tx:", tx.receipt.transactionHash);
}

async function main() {
  const PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY;
  const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

  if (!PRIVATE_KEY || !SECRET_KEY) {
    throw new Error(
      "Please set the TEST_WALLET_PRIVATE_KEY and THIRDWEB_SECRET_KEY env vars."
    );
  }

  const chain = "goerli";
  const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY, chain, {
    secretKey: SECRET_KEY,
  });

  await deployProxy(sdk);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
