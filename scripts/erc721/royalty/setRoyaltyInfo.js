import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";

config();

// Mints a token to an allowlisted address.
// Run: `node scripts/erc721/royalty/setRoyaltyInfo.js`

const TARGET_HOOK_ADDRESS = "0x2eD5Abc5Ee2da6aCA33c2459d0331fB840771fd6"; // ROYALTY HOOK ADDRESS
const TARGET_TOKEN_ADDRESS = "0xa286645A6f51BE81f430517d435C22792f9CB9B7"; // REPLACE WITH YOUR TOKEN ADDRESS

async function setRoyaltyInfo(sdkInstance) {
  console.log("Setting royalty info...");

  // ROYALTY PARAMS
  const royaltyRecipient = "0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372";
  const royaltyBps = 100; // 10_000 == 100%

  // SET
  const contract = await sdkInstance.getContract(TARGET_HOOK_ADDRESS);
  const tx = await contract.call("setDefaultRoyaltyInfo", [
    TARGET_TOKEN_ADDRESS,
    royaltyRecipient,
    royaltyBps,
  ]);

  console.log("\nSet royalty info tx:", tx.receipt.transactionHash);
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

  await setRoyaltyInfo(sdk);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
