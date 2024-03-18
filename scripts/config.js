import { config } from "dotenv";

config();

const PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!PRIVATE_KEY || !SECRET_KEY) {
  throw new Error(
    "Please set the TEST_WALLET_PRIVATE_KEY and THIRDWEB_SECRET_KEY env vars."
  );
}

export { PRIVATE_KEY, SECRET_KEY };
