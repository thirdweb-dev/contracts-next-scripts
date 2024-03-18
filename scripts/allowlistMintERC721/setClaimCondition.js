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

function getAllowlistMerkleRoot() {
  const ALLOWLIST_ADDRESSES = ["0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372"]; // REPLACE WITH ALLOWLIST ADDRESSES
  console.log("Creating snapshot...");

  const hashedLeafs = ALLOWLIST_ADDRESSES.map((l) => keccak256(l));

  const tree = new MerkleTree(hashedLeafs, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  return tree.getHexRoot();
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
});

const tx = prepareContractCall({
  contract,
  method: {
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
  },
  params: [
    {
      price: 0,
      availableSupply: 100,
      allowlistMerkleRoot: getAllowlistMerkleRoot(),
    },
  ],
});

const result = await sendTransaction({
  transaction: tx,
  account: account,
});

const receipt = await waitForReceipt(result);

console.log("Set claim conditions:", receipt.transactionHash);
