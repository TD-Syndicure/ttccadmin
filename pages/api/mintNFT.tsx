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
    "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
    { commitment: "processed", confirmTransactionInitialTimeout: 60000 }
  );

  const reqBody = JSON.parse(req.body);
  const metadata = reqBody.metadata
  const uri = reqBody.uri

  //setting up metaplex
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.TRAITS_ENCRYPT!));
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage());

  const mintNFTResponse = metaplex.nfts().create({
    name: metadata.name,
    symbol: metadata.symbol,
    uri: uri,
    sellerFeeBasisPoints: metadata.seller_fee_basis_points,
    collection: new PublicKey("FsZhojkEDJkn77G5GqmH799LRWQMgk5oxaG2r1G8vHWU"),
    collectionAuthority: keypair,
  });

  const doneNFT = await mintNFTResponse.run()

  if (doneNFT) {
    res.json({ mint: doneNFT?.mintAddress?.toBase58() });
  } else {
    res.json({ mint: "failed"})
  }
}