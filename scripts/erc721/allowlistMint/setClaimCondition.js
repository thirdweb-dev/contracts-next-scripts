import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { MerkleTree } from "@thirdweb-dev/merkletree";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { config } from "dotenv";

config();

// Sets the claim condition for a token.
// Run: `node scripts/erc721/allowlistMint/setClaimCondition.js`

const TARGET_HOOK_ADDRESS = "0xd2D7CD9F389bE8d6170df8e1B0908A78074da4BF"; // ALLOWLIST MINT HOOK ADDRESS
const TARGET_TOKEN_ADDRESS = "0xa286645A6f51BE81f430517d435C22792f9CB9B7"; // REPLACE WITH YOUR TOKEN ADDRESS
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
  const price = "1000000000000000"; // 0,001 ether
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
