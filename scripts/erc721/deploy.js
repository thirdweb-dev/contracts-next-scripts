import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";
import { ethers } from "ethers";

config();

// Run: `node scripts/erc721/deploy.js`

const CLONE_FACTORY_ADDRESS = "0x276681b249D043dfd3e833fA2862B797dA2BF68E";

async function deployProxy(sdkInstance) {
  // PARAMS
  const implementation = "0x05bA337AC23E1bdb70aDA414aeA75260bCe6a71d";
  const admin = "0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372";

  const iface = new ethers.utils.Interface([
    {
      type: "function",
      name: "initialize",
      inputs: [
        {
          name: "_defaultAdmin",
          type: "address",
          internalType: "address",
        },
        { name: "_name", type: "string", internalType: "string" },
        { name: "_symbol", type: "string", internalType: "string" },
        { name: "_uri", type: "string", internalType: "string" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ]);
  const initializeData = iface.encodeFunctionData("initialize", [
    admin,
    "Thirdweb",
    "TWB",
    "",
  ]);
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
