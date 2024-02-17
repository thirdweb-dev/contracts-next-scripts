import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyWallet } from "thirdweb/wallets";
import { ethers } from "ethers";
import { config } from "dotenv";

config();

// Constants
const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID

const TARGET_TOKEN_ADDRESS = "0x..."; // REPLACE WITH YOUR TOKEN ADDRESS

const BEFORE_MINT_HOOK_FLAG = 2;

const SET_DEFAULT_FEE_CONFIG_ABI = [
  {
    type: "function",
    name: "setDefaultFeeConfig",
    inputs: [
      {
        name: "_config",
        type: "tuple",
        internalType: "struct IFeeConfig.FeeConfig",
        components: [
          {
            name: "primarySaleRecipient",
            type: "address",
            internalType: "address",
          },
          {
            name: "platformFeeRecipient",
            type: "address",
            internalType: "address",
          },
          {
            name: "platformFeeBps",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

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
  // FEE CONFIG PARAMS
  const primarySaleRecipient = "0x..."; // REPLACE WITH YOUR ADDRESS
  const platformFeeRecipient = "0x..."; // REPLACE WITH YOUR ADDRESS
  const platformFeeBps = 100; // REPLACE WITH DESIRED FEE; 10_000 == 100%

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
  });

  const encodedSetDefaultFeeConfigCall = new ethers.utils.Interface(
    SET_DEFAULT_FEE_CONFIG_ABI
  ).encodeFunctionData("setDefaultFeeConfig", [
    {
      primarySaleRecipient,
      platformFeeRecipient,
      platformFeeBps,
    },
  ]);

  const setDefaultFeeConfigTransaction = prepareContractCall({
    contract: coreContract,
    method: {
      type: "function",
      name: "hookFunctionWrite",
      inputs: [
        { name: "_hookFlag", type: "uint256", internalType: "uint256" },
        { name: "_value", type: "uint256", internalType: "uint256" },
        { name: "_data", type: "bytes", internalType: "bytes" },
      ],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "payable",
    },
    args: [BEFORE_MINT_HOOK_FLAG, 0, encodedSetDefaultFeeConfigCall],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    setDefaultFeeConfigTransaction,
    wallet,
  });

  const receipt = await waitForReceipt(transactionResult);
  console.log("Set default fee config tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
