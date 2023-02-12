// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { wait } from "../../scripts/helpers";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {
  const connection = new Connection(
    "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
    { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
  );

  const reqBody = JSON.parse(req.body);
  const metadata = reqBody.metadata;
  const uri = reqBody.uri;
  const collection = reqBody.collection;

  //setting up metaplex
  const keypair = Keypair.fromSecretKey(
    bs58.decode(process.env.TRAITS_STORE_ENCRYPT!)
  );
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage());

  try {
    const transactionBuilder = await metaplex
      .nfts()
      .builders()
      .create({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: uri,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
        collection: new PublicKey(collection),
        collectionAuthority: keypair,
      });

    const { mintAddress } = transactionBuilder.getContext();
    await metaplex.rpc().sendAndConfirmTransaction(transactionBuilder);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    if (nft) {
      res.json({ mint: nft?.address?.toBase58() });
    } else {
      console.log('retrying checks for mint address')
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const nft = await metaplex.nfts().findByMint({ mintAddress });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      res.json({ mint: nft?.address?.toBase58() });
    }
  } catch (error) {
    console.log(error);
    res.json({ mint: "failed" });
  }
}
