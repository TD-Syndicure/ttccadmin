// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { bundlrStorage, keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import Arweave from "arweave";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {

  const connection = new Connection(
    "https://solana-mainnet.g.alchemy.com/v2/UlhtaPGnQKjcVprRqZU8XlrA3fK4g_Oy",
    { commitment: "processed", confirmTransactionInitialTimeout: 60000 }
  );

  const reqBody = JSON.parse(req.body);
  const metadata = reqBody.metadata
  const uri = reqBody.uri

  //setting up metaplex
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.TRAITS_STORE_ENCRYPT!));
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage());

  const mintNFTResponse = metaplex.nfts().create({
    name: metadata.name,
    symbol: metadata.symbol,
    uri: uri,
    sellerFeeBasisPoints: metadata.seller_fee_basis_points,
    collection: new PublicKey("4TTf6hMf6NPsQFUfwNT957WgCC8pDpSGWxUycf3aivCP"),
    collectionAuthority: keypair,
  });

  const doneNFT = await mintNFTResponse.run()

  if (doneNFT) {
    res.json({ mint: doneNFT?.mintAddress?.toBase58() });
  } else {
    res.json({ mint: "failed"})
  }
}
