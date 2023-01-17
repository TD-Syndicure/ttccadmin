// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import * as anchor from "@project-serum/anchor";
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts
} from "@metaplex-foundation/mpl-token-metadata";
import web3, {
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey
} from "@solana/web3.js";
import bs58 from "bs58"
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '../../node_modules/@solana/spl-token';

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
  const signature = reqBody.signature;
  const smoothies = reqBody.smoothies

  let instructions: any = []
  const user = reqBody.publicKey

  console.log(signature)

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
    sellerFeeBasisPoints: 500,
    creators: useThisForCreators,
    collection: {
      verified: reqBody?.userMetadata?.onchainMetadata?.collection?.verified ?? false,
      key: new anchor.web3.PublicKey(reqBody?.userMetadata?.onchainMetadata?.collection?.key ?? "82ourSJ5SgtNuHzvJ6y2XEqF43WnogCaXpuxg78JPk1m")
    },
    uses: null,
  };

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

  //wallet for arweave upload costs
  const dev = new PublicKey('Hh3dehjrQ7gXiipcewCWnWZZHpW5rA9gwBs7Aosno3B5') // dev wallet address

  //traits wallet
  const devWallet = new PublicKey("FAPEuryhVq7naaKorrbgY48L27qytsyDX2xc3rLNXoUh")
  //this covers arweave upload costs
  instructions.push(
      SystemProgram.transfer({
          fromPubkey: new PublicKey(user)!,
          toPubkey: dev,
          lamports: 0.01 * LAMPORTS_PER_SOL,
      })
  )
  instructions.push(
    SystemProgram.transfer({
        fromPubkey: new PublicKey(user)!,
        toPubkey: devWallet,
        lamports: 0.01 * LAMPORTS_PER_SOL,
    })
)

  //send new trait from dev wallet to user
  const tokenMint2 = new PublicKey(smoothies[0].mint)
  // GET SOURCE ASSOCIATED ACCOUNT
  const associatedSourceTokenAddr = await getAssociatedTokenAddress(tokenMint2, new PublicKey(user));
  // GET DESTINATION ASSOCIATED ACCOUNT
  const associatedDestinationTokenAddr = await getAssociatedTokenAddress(tokenMint2, devWallet);
  const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);
  if (receiverAccount === null) {
      instructions.push(createAssociatedTokenAccountInstruction(new PublicKey(user), associatedDestinationTokenAddr, devWallet, tokenMint2));
  }
  instructions.push(createTransferInstruction(associatedSourceTokenAddr, associatedDestinationTokenAddr, new PublicKey(user), 1));

  const transaction = new anchor.web3.Transaction()
  transaction.add(...instructions);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = keypair.publicKey;

  transaction.partialSign({
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey
  })

  res.status(200).json({ info: transaction.serialize({ requireAllSignatures: false }) });

}
