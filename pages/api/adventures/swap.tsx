// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import web3, {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "../../../node_modules/@solana/spl-token";

export default async function handler(req: any, res: any) {
  const requestData = JSON.parse(req.body);
  const user = new PublicKey(requestData.publicKey);
  const devkeyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.ADV_ENCRYPT!)
  );
  const timeDevices = requestData.devicesToSend;

  console.log("source: " + devkeyPair.publicKey.toBase58());
  console.log("dest: " + requestData.publicKey);
  console.log("amount: " + timeDevices);

  const connection = new Connection(
    "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/",
    { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
  );

  const timeMachines = new PublicKey(
    "Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"
  );

  const sendCUSTOM = async () => {
    let instructions: any = [];

    const tokenMint = new PublicKey(
      "pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"
    );
    const sourceWallet = new PublicKey(requestData.publicKey);

    const destinationWallet2 = devkeyPair.publicKey;
    // GET SOURCE ASSOCIATED ACCOUNT
    const associatedSourceTokenAddr2 = await getAssociatedTokenAddress(
      tokenMint,
      sourceWallet
    );
    // GET DESTINATION ASSOCIATED ACCOUNT
    const associatedDestinationTokenAddr2 = await getAssociatedTokenAddress(
      tokenMint,
      destinationWallet2
    );
    const receiverAccount2 = await connection.getAccountInfo(
      associatedDestinationTokenAddr2
    );
    if (receiverAccount2 === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          destinationWallet2,
          associatedDestinationTokenAddr2,
          destinationWallet2,
          tokenMint
        )
      );
    }
    instructions.push(
      createTransferInstruction(
        associatedSourceTokenAddr2,
        associatedDestinationTokenAddr2,
        sourceWallet,
        +(timeDevices * 121 * LAMPORTS_PER_SOL).toFixed(0)
      )
    );

    //send time machines back to user
    const destinationWallet = new PublicKey(requestData.publicKey);
    // GET SOURCE ASSOCIATED ACCOUNT
    const associatedSourceTokenAddr = await getAssociatedTokenAddress(
      timeMachines,
      devkeyPair.publicKey
    );
    // GET DESTINATION ASSOCIATED ACCOUNT
    const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
      timeMachines,
      destinationWallet
    );
    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );
    if (receiverAccount === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          destinationWallet,
          associatedDestinationTokenAddr,
          destinationWallet,
          timeMachines
        )
      );
    }
    instructions.push(
      createTransferInstruction(
        associatedSourceTokenAddr,
        associatedDestinationTokenAddr,
        devkeyPair.publicKey,
        timeDevices
      )
    );

    const blockhash = await connection.getLatestBlockhash();
    //transaction
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = devkeyPair.publicKey;
    transaction.recentBlockhash = blockhash.blockhash;

    try {
      transaction.partialSign({
        publicKey: devkeyPair.publicKey,
        secretKey: devkeyPair.secretKey,
      });

      res
        .status(200)
        .json({ info: transaction.serialize({ requireAllSignatures: false }) });
    } catch (e) {
      console.log(e);
    }
  };

  try {
    await sendCUSTOM();
  } catch (e) {
    console.log(e);
    res.status(500).json({ info: "failed" });
  }
}
