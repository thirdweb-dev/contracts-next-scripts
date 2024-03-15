import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyWallet } from "thirdweb/wallets";
import { config } from "dotenv";

import HookInstallerABI from "../abi/HookInstaller.json";

config();

// Constants
const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID

const TARGET_TOKEN_ADDRESS = "0x..."; // REPLACE WITH YOUR TOKEN ADDRESS
const TARGET_HOOK_ADDRESS = "0x..."; // REPLACE WITH HOOK ADDRESS

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
  // SETUP INSTALL TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
    abi: HookInstallerABI,
  });

  const installTransaction = prepareContractCall({
    contract: coreContract,
    method: "installHook",
    args: [
      {
        hook: TARGET_HOOK_ADDRESS,
        initCallValue: 0,
        initCallData: "0x",
      },
    ],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    installTransaction,
    wallet,
  });
  const receipt = await waitForReceipt(transactionResult);
  console.log("Install hook tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
