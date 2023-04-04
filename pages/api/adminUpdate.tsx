import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
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
    "https://divine-aged-glitter.solana-mainnet.quiknode.pro/f592aec8c88056067246bcd39a76ea2074955fb3/";
  const connection = new anchor.web3.Connection(endpoint);

  const rules = "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9";

  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(keypair));

  const nftOrSft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(tokenMint),
  });

  console.log("Upgrade Page Token Mint", tokenMint);

  await metaplex.nfts().update({
    nftOrSft,
    uri: buf,
    authorizationDetails: rules
      ? {
          rules: new PublicKey(rules),
        }
      : null,
  });

  console.log("Upgrade Page URI Update", buf);

  res.status(200).json({ result: "success" });
}
