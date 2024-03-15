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

const SET_DEFAULT_ROYALTY_INFO_ABI = {
  type: "function",
  name: "setDefaultRoyaltyInfo",
  inputs: [
    {
      name: "_royaltyRecipient",
      type: "address",
      internalType: "address",
    },
    { name: "_royaltyBps", type: "uint256", internalType: "uint256" },
  ],
  outputs: [],
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
  const recipient = "0x..."; // REPLACE WITH YOUR ROYALTY RECIPIENT
  const bps = 100; // REPLACE WITH DESIRED FEE; 10_000 == 100%

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
  });

  const setDefaultRoyaltyInfoTransaction = prepareContractCall({
    contract: coreContract,
    method: SET_DEFAULT_ROYALTY_INFO_ABI,
    args: [
      {
        recipient,
        bps,
      },
    ],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    setDefaultRoyaltyInfoTransaction,
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
