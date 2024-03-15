import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyWallet } from "thirdweb/wallets";
import { config } from "dotenv";

config();

// Constants
const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID

const TARGET_TOKEN_ADDRESS = "0x..."; // REPLACE WITH YOUR TOKEN ADDRESS

const LAZY_MINT_ABI = {
  type: "function",
  name: "lazyMint",
  inputs: [
    { name: "_amount", type: "uint256", internalType: "uint256" },
    {
      name: "_baseURIForTokens",
      type: "string",
      internalType: "string",
    },
    { name: "_data", type: "bytes", internalType: "bytes" },
  ],
  outputs: [{ name: "batchId", type: "uint256", internalType: "uint256" }],
  stateMutability: "nonpayable",
};
/// Setup thirdweb client and wallet.

if (!PRIVATE_KEY || !SECRET_KEY) {
  throw new Error(
    "Please set the TEST_WALLET_PRIVATE_KEY and THIRDWEB_SECRET_KEY env vars."
  );
}

const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});
const wallet = privateKeyWallet({ client, privateKey: PRIVATE_KEY });

async function main() {
  // METADATA PARAMS
  const baseURI = "ipfs://QmSkXUpbwThMTzGg3e4kbGP8cKAa12vu8L3mLxywcmXyb4/";
  const quantity = 3;
  const data = "0x";

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
  });

  const lazyMintTransaction = prepareContractCall({
    contract: coreContract,
    method: LAZY_MINT_ABI,
    args: [quantity, baseURI, data],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    lazyMintTransaction,
    wallet,
  });

  const receipt = await waitForReceipt(transactionResult);
  console.log("Lazy mint tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
