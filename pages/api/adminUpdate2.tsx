import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {
  const reqBody = JSON.parse(req.body);
  const buf = reqBody.userMetadata;
  const tokenMint = reqBody.mint;

  const keypair = anchor.web3.Keypair.fromSecretKey(
    bs58.decode(process.env.USERNAME_ENCRYPT)
  );

  const endpoint =
    "https://thrumming-tiniest-pine.solana-mainnet.quiknode.pro/bee247148bdf50d5f6b5ac05ee178804ace40067/";
  const connection = new anchor.web3.Connection(endpoint);

  const rules = "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9";

  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(keypair));

  const nftOrSft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(tokenMint),
  });

  let authorizationDetails = null;

  if (rules) {
    authorizationDetails = {
      authorizationType: 1,
      option: new PublicKey(rules),
    };
  }

  await metaplex.nfts().update({
    nftOrSft,
    uri: buf,
    authorizationDetails: authorizationDetails
  });

  res
    .status(200)
    .json({ result: "success" });
}
