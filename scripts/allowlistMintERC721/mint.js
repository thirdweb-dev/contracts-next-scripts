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

  const expectedProof = tree.getHexProof(
    ethers.utils.solidityKeccak256(["address"], [recipient])
  );

  const proof = ethers.utils.defaultAbiCoder.encode(
    ["bytes32[]"],
    [expectedProof]
  );

  return proof;
}

async function main() {
  // MINT PARAMS
  const to = "0x..."; // REPLACE WITH ALLOWLISTED RECIPIENT ADDRESS
  const quantity = 1;
  const encodedArgs = getAllowlistMerkleProof();

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
  });

  const mintTransaction = prepareContractCall({
    contract: coreContract,
    method: {
      type: "function",
      name: "mint",
      inputs: [
        { name: "_to", type: "address", internalType: "address" },
        { name: "_quantity", type: "uint256", internalType: "uint256" },
        {
          name: "_encodedBeforeMintArgs",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    args: [to, quantity, encodedArgs],
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
