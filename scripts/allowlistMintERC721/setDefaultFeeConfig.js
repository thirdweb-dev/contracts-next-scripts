import { PRIVATE_KEY, SECRET_KEY } from "../config.js";
import {
  createThirdwebClient,
  prepareContractCall,
  getContract,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyAccount } from "thirdweb/wallets";
import { arbitrumSepolia } from "thirdweb/chains";

const TARGET_TOKEN_CORE_ADDRESS = "0xF3cD296A5a120FC8043E0e24C0e7857C24c29143"; // REPLACE WITH YOUR TOKEN ADDRESS

const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});

const account = privateKeyAccount({
  client,
  privateKey: PRIVATE_KEY,
});

const contract = getContract({
  client,
  address: TARGET_TOKEN_CORE_ADDRESS,
  chain: arbitrumSepolia,
});

const tx = prepareContractCall({
  contract,
  method: {
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
  params: [
    {
      primarySaleRecipient: account.address,
      platformFeeRecipient: account.address,
      platformFeeBps: 1000,
    },
  ],
});

const result = await sendTransaction({
  transaction: tx,
  account: account,
});

const receipt = await waitForReceipt(result);

console.log("Set Fee config:", receipt.transactionHash);
