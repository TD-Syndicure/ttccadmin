// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {
  const connection = new Connection(
    "https://sly-sleek-grass.solana-mainnet.quiknode.pro/10b32dede2c9f7277037b8524ccccf0ae7a0fddd/",
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
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const nft = await metaplex.nfts().findByMint({ mintAddress });
  
      if (nft) {
        res.json({ mint: nft?.address?.toBase58() });
      } else {
        console.log('retrying checks for mint address')
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        res.json({ mint: nft?.address?.toBase58() });
      }
    } catch (error) {
      console.log(error);
      res.json({ mint: "failed" });
    }
  }