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

config();

// Constants

const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID
const ADMIN = "0x..."; // REPLACE WITH YOUR ADDRESS

const CORE_IMPL_ADDRESS = "0x..."; // REPLACE WITH CORE IMPLEMENTATION ADDRESS
const CLONE_FACTORY_ADDRESS = "0x..."; // REPLACE WITH CLONE FACTORY ADDRESS

const INITIALIZE_ABI = [
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_initCall",
        type: "tuple",
        internalType: "struct IInitCall.InitCall",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "value", type: "uint256", internalType: "uint256" },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "_hooks", type: "address[]", internalType: "address[]" },
      {
        name: "_defaultAdmin",
        type: "address",
        internalType: "address",
      },
      { name: "_name", type: "string", internalType: "string" },
      { name: "_symbol", type: "string", internalType: "string" },
      { name: "_contractURI", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

/// Setup thirdweb client and wallet.

const PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!PRIVATE_KEY || !SECRET_KEY) {
  throw new Error(
    "Please set the TEST_WALLET_PRIVATE_KEY and THIRDWEB_SECRET_KEY env vars."
  );
}

const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});
const wallet = privateKeyWallet({ client, privateKey: PRIVATE_KEY });

async function main() {
  // DEPLOY PARAMS
  const implementation = CORE_IMPL_ADDRESS;

  const iface = new ethers.utils.Interface(INITIALIZE_ABI);
  const initializeData = iface.encodeFunctionData("initialize", [
    { target: ethers.constants.AddressZero, value: 0, data: "0x" },
    [],
    ADMIN,
    "Hooks Token",
    "HNC",
    "",
  ]);
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [ADMIN, 0])
  );

  // SETUP DEPLOY TX
  const cloneFactory = getContract({
    client,
    address: CLONE_FACTORY_ADDRESS,
    chainId: CHAIN_ID,
  });

  const deployTransaction = prepareContractCall({
    contract: cloneFactory,
    method:
      "function deployProxyByImplementation(address _implementation, bytes memory _data, bytes32 _salt)",
    params: [implementation, initializeData, salt],
  });

  // DEPLOY
  const transactionResult = await sendTransaction({
    deployTransaction,
    wallet,
  });
  const receipt = await waitForReceipt(transactionResult);

  console.log("Deploy proxy tx:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
