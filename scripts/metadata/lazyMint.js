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
  method:
    "function lazyMint(uint256 _amount, string calldata _baseURIForTokens, bytes calldata _data)",
  params: [10, "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/", "0x"],
});

const result = await sendTransaction({
  transaction: tx,
  account: account,
});

const receipt = await waitForReceipt(result);

console.log("Lazy minted tokens:", receipt.transactionHash);
