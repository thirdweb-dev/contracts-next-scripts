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
import { keccak256 } from "thirdweb/utils";
import { MerkleTree } from "@thirdweb-dev/merkletree";

import ERC721CORE_ABI from "../../abi/ERC721Core.json" assert { type: "json" };

function getAllowlistMerkleProof(recipient) {
  const ALLOWLIST_ADDRESSES = ["0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372"]; // REPLACE WITH ALLOWLIST ADDRESSES
  console.log("Creating snapshot proof...");

  const hashedLeafs = ALLOWLIST_ADDRESSES.map((l) => keccak256(l));

  const tree = new MerkleTree(hashedLeafs, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  const proof = tree.getHexProof(keccak256(recipient));

  return proof;
}

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
  abi: ERC721CORE_ABI,
});

const mintRequest = {
  minter: account.address, // REPLACE WITH ALLOWLISTED RECIPIENT ADDRESS
  token: TARGET_TOKEN_CORE_ADDRESS,
  tokenId: 0,
  quantity: 1, // REPLACE WITH QUANTITY
  pricePerToken: 0,
  currency: "0x0000000000000000000000000000000000000000",
  allowlistProof: getAllowlistMerkleProof(account.address),
  signature: "0x",
  sigValidityStartTimestamp: 0,
  sigValidityEndTimestamp: 0,
  sigUid: "0x0000000000000000000000000000000000000000000000000000000000000000",
  auxData: "0x",
};
const tx = prepareContractCall({
  contract,
  method: "mint",
  params: [mintRequest],
});

const result = await sendTransaction({
  transaction: tx,
  account: account,
});

const receipt = await waitForReceipt(result);

console.log("Minting a token:", receipt.transactionHash);
