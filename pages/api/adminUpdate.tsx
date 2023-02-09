// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as anchor from "@project-serum/anchor";
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts
} from "@metaplex-foundation/mpl-token-metadata";
// import { Metaplex } from "@metaplex-foundation/js";
import web3, {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey
} from "@solana/web3.js";
import bs58 from "bs58"
// import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '../../node_modules/@solana/spl-token';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb' // Set desired value here
    }
  }
}

export default async function handler(req, res) {
  const reqBody = JSON.parse(req.body)
  const buf = reqBody.metadata;
  const tokenMint = reqBody.mint;
  const creators = reqBody.userMetadata.creators ?? []
  const metadata = reqBody.userMetadata.metadata
  const smoothies = reqBody.smoothies

  let instructions: any = []
  const user = reqBody.publicKey

  let useThisForCreators: any = []
  creators.forEach((item) => {
    useThisForCreators.push({
      address: new anchor.web3.PublicKey(item.address),
      verified: item.verified,
      share: +item.share
    })
  })

  const keypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(process.env.USERNAME_ENCRYPT!))
  const endpoint = "https://greatest-summer-pine.solana-mainnet.discover.quiknode.pro/00ffa4253f9b899be3e75cb0e176091c6df54cac/";
  const connection = new anchor.web3.Connection(endpoint);

  const wallet = new anchor.Wallet(keypair);
  console.log("Connected Wallet", wallet.publicKey.toString());

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // You have to enter your NFT Mint address Over Here
  //const mintKey = new anchor.web3.PublicKey("EbXfuQ55eAyNcCuCn3ihz3G8jwVvNWfyFmkSg721sWoX");
  const mintKey = new anchor.web3.PublicKey(tokenMint);

  const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const updated_data: DataV2 = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: buf,
    sellerFeeBasisPoints: 888,
    creators: useThisForCreators,
    collection: {
      verified: reqBody?.userMetadata?.collection?.verified ?? false,
      key: new anchor.web3.PublicKey(reqBody?.userMetadata?.collection?.key ?? "BzNwS8jm41n9MPoqVxKmwDK27DaJkscfn66344eHLrGR")
    },
    uses: null,
  };

  console.log(reqBody?.userMetadata)

  const accounts: UpdateMetadataAccountV2InstructionAccounts = {
    metadata: metadatakey,
    updateAuthority: keypair.publicKey,
  }

  const args: UpdateMetadataAccountV2InstructionArgs = {
    updateMetadataAccountArgsV2: {
      data: updated_data,
      updateAuthority: keypair.publicKey,
      primarySaleHappened: true,
      isMutable: true,
    }
  }

  instructions.push(createUpdateMetadataAccountV2Instruction(
    accounts,
    args
  ))


  const transaction = new anchor.web3.Transaction()
  transaction.add(...instructions);
  const blockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash.blockhash;
  transaction.feePayer = keypair.publicKey;
  const signedTx = await wallet.signTransaction(transaction);
  const txid = await connection.sendRawTransaction(signedTx.serialize());

  console.log("Transaction ID --", txid);

  res.status(200).json({ result: "success" })

}