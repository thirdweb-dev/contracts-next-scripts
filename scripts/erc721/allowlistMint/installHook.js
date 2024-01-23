import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";

config();

// Run: `node scripts/erc721/allowlistMint/installHook.js`

const TARGET_TOKEN_ADDRESS = "0x97694C602c283DE8f40B8f2679ED5E730806297a";
const TARGET_HOOK_ADDRESS = "0x9Ef026c82F6491eBA4EAC14378a3FEd397C9F282";

const INSTALL = 1;

async function installOrUninstallHook(sdkInstance, toInstall) {
  const contract = await sdkInstance.getContract(TARGET_TOKEN_ADDRESS);
  const fn = toInstall === INSTALL ? "installHook" : "uninstallHook";

  const tx = await contract.call(fn, [TARGET_HOOK_ADDRESS]);
  console.log("\nInstall / Uninstall hook tx:", tx.receipt.transactionHash);
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

  await installOrUninstallHook(sdk, INSTALL);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
