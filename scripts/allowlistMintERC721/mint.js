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

import { MerkleTree } from "@thirdweb-dev/merkletree";
import keccak256 from "keccak256";

import ERC721CoreABI from "../abi/ERC721Core.json";

config();

// Constants
const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID

const TARGET_TOKEN_ADDRESS = "0x..."; // REPLACE WITH YOUR TOKEN ADDRESS
const ALLOWLIST_ADDRESSES = ["0x..."]; // REPLACE WITH ALLOWLIST ADDRESSES

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

function getAllowlistMerkleProof(recipient) {
  console.log("Creating snapshot proof...");

  const hashedLeafs = ALLOWLIST_ADDRESSES.map((l) =>
    ethers.utils.solidityKeccak256(["address"], [l])
  );

  const tree = new MerkleTree(hashedLeafs, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  const proof = tree.getHexProof(
    ethers.utils.solidityKeccak256(["address"], [recipient])
  );

  return proof;
}

async function main() {
  // MINT PARAMS
  // We fill the relevant fields our hook expects (minter, quantity, allowlistProof) and leave the rest empty.
  const mintRequest = {
    minter: "0x...", // REPLACE WITH ALLOWLISTED RECIPIENT ADDRESS
    token: TARGET_TOKEN_ADDRESS,
    tokenId: 0,
    quantity: 1, // REPLACE WITH QUANTITY
    pricePerToken: 0,
    currency: ethers.constants.AddressZero,
    allowlistProof: getAllowlistMerkleProof(),
    signature: "0x",
    sigValidityStartTimestamp: 0,
    sigValidityEndTimestamp: 0,
    sigUid: ethers.utils.formatBytes32String(""),
    auxData: "0x",
  };

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
    abi: ERC721CoreABI,
  });

  const mintTransaction = prepareContractCall({
    contract: coreContract,
    method: "mint",
    args: [mintRequest],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    mintTransaction,
    wallet,
  });

  const receipt = await waitForReceipt(transactionResult);
  console.log("Mint tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
