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
const TARGET_HOOK_ADDRESS = "0x593A423e6d3b3Ed526fbB282E0b2819F4C12Dba1"; // REPLACE WITH HOOK ADDRESS

const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});

const wallet = privateKeyAccount({
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
  account: wallet,
});

const receipt = await waitForReceipt(result);

console.log("Install hook:", receipt.transactionHash);
