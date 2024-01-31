import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";

config();

// Mints a token to an allowlisted address.
// Run: `node scripts/erc721/metadata/lazyMint.js`

const TARGET_HOOK_ADDRESS = "0xe9835BeA658343E5D56E5039b14A35c38Fc6De36"; // LAZYMINT METADATA HOOK ADDRESS
const TARGET_TOKEN_ADDRESS = "0xa286645A6f51BE81f430517d435C22792f9CB9B7"; // REPLACE WITH YOUR TOKEN ADDRESS

async function lazyMint(sdkInstance) {
  console.log("Lazy minting tokens...");

  // ROYALTY PARAMS
  const baseURI = "ipfs://QmSkXUpbwThMTzGg3e4kbGP8cKAa12vu8L3mLxywcmXyb4/";
  const quantity = 3;

  // SET
  const contract = await sdkInstance.getContract(TARGET_HOOK_ADDRESS);
  const tx = await contract.call("lazyMint", [
    TARGET_TOKEN_ADDRESS,
    quantity,
    baseURI,
    "0x",
  ]);

  console.log("\nLazy mint tx:", tx.receipt.transactionHash);
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

  await lazyMint(sdk);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
