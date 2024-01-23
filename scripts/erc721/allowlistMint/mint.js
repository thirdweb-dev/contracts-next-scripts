import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { MerkleTree } from "@thirdweb-dev/merkletree";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { config } from "dotenv";

config();

// Run: `node scripts/erc721/allowlistMint/mint.js`

const ALLOWLIST_ADDRESSES = ["0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372"];
const TARGET_TOKEN_ADDRESS = "0x97694C602c283DE8f40B8f2679ED5E730806297a";

async function mintToken(sdkInstance) {
  console.log("Minting tokens...");

  // MINT PARAMS
  const to = "0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372";
  const quantity = 1;
  const encodedArgs = getAllowlistMerkleProof();

  // MINT CALL
  const contract = await sdkInstance.getContract(TARGET_TOKEN_ADDRESS);
  const call = (
    await contract.prepare("mint", [to, quantity, encodedArgs])
  ).setValue(ethers.utils.parseEther("0.01"));
  const tx = await call.send();

  console.log("\nMint tx:", tx.hash);
}

function getAllowlistMerkleProof() {
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
    ethers.utils.solidityKeccak256(["address"], [ALLOWLIST_ADDRESSES[0]])
  );

  const proof = ethers.utils.defaultAbiCoder.encode(
    ["bytes32[]"],
    [expectedProof]
  );

  return proof;
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

  await mintToken(sdk);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
