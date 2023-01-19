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
import bs58 from "bs58";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  query,
  addDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  DocumentSnapshot,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "../../node_modules/@solana/spl-token";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);

export default async function handler(req: any, res: any) {
  const db = getFirestore(app);

  const requestData = JSON.parse(req.body);
  const user = new PublicKey(requestData.publicKey);
  const devkeyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.USERNAME_ENCRYPT!)
  );

  const juice = requestData.juice;

  const connection = new Connection(
    "https://greatest-summer-pine.solana-mainnet.discover.quiknode.pro/00ffa4253f9b899be3e75cb0e176091c6df54cac/",
    { commitment: "processed", confirmTransactionInitialTimeout: 60000 }
  );

  const sendCUSTOM = async () => {
    let instructions: any = [];

    const dev = new PublicKey("Hh3dehjrQ7gXiipcewCWnWZZHpW5rA9gwBs7Aosno3B5"); // dev wallet address
    const devWallet = new PublicKey(
      "FAPELahUpRFN5tr8bfNzsPt8RSrxkyXrqW617sev5HD7"
    );
    //this covers arweave upload costs
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(user)!,
        toPubkey: dev,
        lamports: 0.01 * LAMPORTS_PER_SOL,
      })
    );
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(user)!,
        toPubkey: devWallet,
        lamports: 0.01 * LAMPORTS_PER_SOL,
      })
    );

    //send new trait from dev wallet to user
    const tokenMint = new PublicKey(juice);
    const destinationWallet = new PublicKey(requestData.publicKey);
    // GET SOURCE ASSOCIATED ACCOUNT
    const associatedSourceTokenAddr = await getAssociatedTokenAddress(
      tokenMint,
      devkeyPair.publicKey
    );
    // GET DESTINATION ASSOCIATED ACCOUNT
    const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
      tokenMint,
      destinationWallet
    );
    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );
    if (receiverAccount === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          devkeyPair.publicKey,
          associatedDestinationTokenAddr,
          destinationWallet,
          tokenMint
        )
      );
    }
    instructions.push(
      createTransferInstruction(
        associatedSourceTokenAddr,
        associatedDestinationTokenAddr,
        devkeyPair.publicKey,
        1
      )
    );

    //send mango from user to dev wallet
    const tokenMint2 = new PublicKey(
      "8ZKGnRpnM1BVN9SGBuJaXSf1cHwQ2fWUvPpXWoMWT31C"
    );
    const sourceWallet = new PublicKey(requestData.publicKey);
    const destinationWallet2 = devkeyPair.publicKey;
    // GET SOURCE ASSOCIATED ACCOUNT
    const associatedSourceTokenAddr2 = await getAssociatedTokenAddress(
      tokenMint2,
      sourceWallet
    );
    // GET DESTINATION ASSOCIATED ACCOUNT
    const associatedDestinationTokenAddr2 = await getAssociatedTokenAddress(
      tokenMint2,
      destinationWallet2
    );
    const receiverAccount2 = await connection.getAccountInfo(
      associatedDestinationTokenAddr2
    );
    if (receiverAccount2 === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          sourceWallet,
          associatedDestinationTokenAddr2,
          destinationWallet2,
          tokenMint2
        )
      );
    }
    instructions.push(
      createTransferInstruction(
        associatedSourceTokenAddr2,
        associatedDestinationTokenAddr2,
        sourceWallet,
        +(1000 * LAMPORTS_PER_SOL).toFixed(0)
      )
    );

    const blockhash = await connection.getLatestBlockhash();

    let allTXs: any = [];
    const numTransactions = Math.ceil(instructions.length / 8);

    for (let i = 0; i < numTransactions; i++) {
      let localArrOfNFTsSent = [];
      let singleBulkTX = new Transaction();
      singleBulkTX.feePayer = devkeyPair.publicKey;
      singleBulkTX.recentBlockhash = blockhash.blockhash;
      for (let j = i * 8; j < i * 8 + 8; j++) {
        if (instructions[j]) {
          singleBulkTX.add(instructions[j]);
        }
      }
      singleBulkTX.partialSign({
        publicKey: devkeyPair.publicKey,
        secretKey: devkeyPair.secretKey,
      });
      allTXs.push(singleBulkTX.serialize({ requireAllSignatures: false }));
    }

    try {
      res.status(200).json({ info: allTXs });
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
