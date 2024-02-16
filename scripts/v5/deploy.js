import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { privateKeyWallet } from "thirdweb/wallets";
import { config } from "dotenv";
import { ethers } from "ethers";
import ERC721_CORE_ABI from "../../abi/ERC721Core.json" assert { type: "json" };

config();

// Constants

const CHAIN_ID = 5; // REPLACE WITH YOUR CHAIN ID
const ADMIN = "0x..."; // REPLACE WITH YOUR ADDRESS

const ERC_721_CORE_IMPL_ADDRESS = "0x..."; // REPLACE WITH ERC-721 CORE IMPLEMENTATION ADDRESS
const CLONE_FACTORY_ADDRESS = "0x..."; // REPLACE WITH CLONE FACTORY ADDRESS

const ERC_721_CORE_INTERFACE = new ethers.utils.Interface(ERC721_CORE_ABI);

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
  const implementation = ERC_721_CORE_IMPL_ADDRESS;
  const initializeData = ERC_721_CORE_INTERFACE.encodeFunctionData(
    "initialize",
    [
      { target: ethers.constants.AddressZero, value: 0, data: "0x" },
      [],
      ADMIN,
      "Hooks NFT Collection",
      "HNC",
      "",
    ]
  );
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
    contract,
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
