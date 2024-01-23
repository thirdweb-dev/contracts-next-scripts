import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { MerkleTree } from "@thirdweb-dev/merkletree";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { config } from "dotenv";

config();

// Run: `node erc721/allowlistMint/setClaimCondition.js`

const TARGET_HOOK_ADDRESS = "0x9Ef026c82F6491eBA4EAC14378a3FEd397C9F282";
const TARGET_TOKEN_ADDRESS = "0x97694C602c283DE8f40B8f2679ED5E730806297a";
const ALLOWLIST_ADDRESSES = ["0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372"];

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

async function setClaimCondition(sdkInstance) {
  console.log("Setting claim condition...");

  // CLAIM CONDITION
  const price = "10000000000000000"; // 0,01 ether
  const availableSupply = 100;
  const allowlistMerkleRoot = getAllowlistMerkleRoot(); // EDIT: `ALLOWLIST_ADDRESSES`

  // SET
  const contract = await sdkInstance.getContract(TARGET_HOOK_ADDRESS);
  const tx = await contract.call("setClaimCondition", [
    TARGET_TOKEN_ADDRESS,
    {
      price,
      availableSupply,
      allowlistMerkleRoot,
    },
  ]);

  console.log("\nSet claim condition tx:", tx.receipt.transactionHash);
}

async function main() {
  const PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY;
  const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

  if (!PRIVATE_KEY || !SECRET_KEY) {
    throw new Error(
      "Please set the TEST_WALLET_PRIVATE_KEY and THIRDWEB_SECRET_KEY env vars."
    );
  }

  const chain = "goerli";
  const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY, chain, {
    secretKey: SECRET_KEY,
  });

  await setClaimCondition(sdk);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
