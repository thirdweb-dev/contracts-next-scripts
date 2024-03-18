import { PRIVATE_KEY, SECRET_KEY } from "./config.js";
import {
  createThirdwebClient,
  prepareContractCall,
  getContract,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyAccount } from "thirdweb/wallets";
import { arbitrumSepolia } from "thirdweb/chains";

import HOOKINSTALLER_ABI from "../abi/HookInstaller.json" assert { type: "json" };

const TARGET_TOKEN_CORE_ADDRESS = "0xF3cD296A5a120FC8043E0e24C0e7857C24c29143"; // REPLACE WITH YOUR TOKEN ADDRESS
const TARGET_HOOK_ADDRESS = "0x6f9336831ca70314A1939Ee9cb86dac05bD33a75"; // REPLACE WITH HOOK ADDRESS

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
  abi: HOOKINSTALLER_ABI,
});

const tx = prepareContractCall({
  contract,
  method: "installHook",
  params: [
    {
      hook: TARGET_HOOK_ADDRESS,
      initCallValue: 0,
      initCalldata: "0x",
    },
  ],
});

const result = await sendTransaction({
  transaction: tx,
  account: account,
});

const receipt = await waitForReceipt(result);

console.log("Install hook:", receipt.transactionHash);
