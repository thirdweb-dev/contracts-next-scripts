import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";

config();

// Installs or Uninstalls a hook in a token core contract.
// Run: `node scripts/erc721/allowlistMint/installHook.js`

const TARGET_TOKEN_ADDRESS = "0xa286645A6f51BE81f430517d435C22792f9CB9B7"; // REPLACE WITH YOUR TOKEN ADDRESS
const TARGET_HOOK_ADDRESS = "0xe9835BeA658343E5D56E5039b14A35c38Fc6De36"; // ALLOWLIST MINT HOOK ADDRESS

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
