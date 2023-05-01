import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {
  try {
    const connection = new Connection(
      "https://solitary-hidden-uranium.solana-mainnet.quiknode.pro/621a21e3bb78de801e6b0305f0f3bdc407fe86e4/",
      { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
    );

    const reqBody = JSON.parse(req.body);
    const metadata = reqBody.metadata;
    const uri = reqBody.uri;
    const collection = reqBody.collection;
    console.log(collection);

    // Validate input data
    if (!metadata || !uri || !collection) {
      throw new Error("Invalid request body");
    }

    //setting up metaplex
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.TRAITS_STORE_ENCRYPT!)
    );
    const devWallet = new PublicKey(
      "Hh3dehjrQ7gXiipcewCWnWZZHpW5rA9gwBs7Aosno3B5"
    );
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(keypair))
      .use(bundlrStorage());

    let instructions = [];

    instructions.push(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: devWallet,
        lamports: 0.002 * LAMPORTS_PER_SOL,
      })
    );

    const blockhash = await connection.getLatestBlockhash();
    //transaction
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = keypair.publicKey;
    transaction.recentBlockhash = blockhash.blockhash;

    // Send transaction and handle errors
    const signed = await connection.sendTransaction(transaction, [
      keypair,
    ]);
    console.log(signed);

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
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Retry finding the NFT by mint address until it succeeds or a maximum number of retries is reached
    const maxRetries = 10;
    let retries = 0;
    let nft;
    while (!nft && retries < maxRetries) {
      try {
        nft = await metaplex.nfts().findByMint({ mintAddress });
      } catch (error) {
        console.error(error);
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Retrying...")
      }
    }

    if (!nft) {
      throw new Error("Failed to mint NFT");
    }

    res.json({ mint: nft?.address?.toBase58() });
  } catch (error) {
    // Handle errors here
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
