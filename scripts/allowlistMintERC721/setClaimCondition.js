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

const SET_CLAIM_CONDITION_ABI = {
  type: "function",
  name: "setClaimCondition",
  inputs: [
    {
      name: "_claimCondition",
      type: "tuple",
      internalType: "struct AllowlistMintHookERC721.ClaimCondition",
      components: [
        { name: "price", type: "uint256", internalType: "uint256" },
        {
          name: "availableSupply",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "allowlistMerkleRoot",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
    },
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

function getAllowlistMerkleRoot() {
  console.log("Creating snapshot...");

  const hashedLeafs = ALLOWLIST_ADDRESSES.map((l) =>
    ethers.utils.solidityKeccak256(["address"], [l])
  );

  const tree = new MerkleTree(hashedLeafs, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  const merkleRoot = ethers.utils.defaultAbiCoder.encode(
    ["bytes32"],
    [tree.getHexRoot()]
  );

  return merkleRoot;
}

async function main() {
  // CLAIM CONDITION
  const price = "1000000000000000"; // 0,001 ether
  const availableSupply = 100;
  const allowlistMerkleRoot = getAllowlistMerkleRoot();

  // SETUP TRANSACTION
  const coreContract = getContract({
    client,
    address: TARGET_TOKEN_ADDRESS,
    chainId: CHAIN_ID,
  });

  const setClaimConditionTransaction = prepareContractCall({
    contract: coreContract,
    method: SET_CLAIM_CONDITION_ABI,
    args: [{ price, availableSupply, allowlistMerkleRoot }],
  });

  // SEND TRANSACTION
  const transactionResult = await sendTransaction({
    setClaimConditionTransaction,
    wallet,
  });

  const receipt = await waitForReceipt(transactionResult);
  console.log("Set claim condition tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
