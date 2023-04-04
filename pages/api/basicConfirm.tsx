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
  where,
  limit,
  orderBy,
} from "firebase/firestore/lite";
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
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "../../node_modules/@solana/spl-token";
import bs58 from "bs58";
import { initializeApp } from "firebase/app";

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
  const connection = new Connection(
    "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/",
    { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
  );
  const requestData = JSON.parse(req.body);
  const signature = requestData.signature;

  const wait = (ms: any) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  try {
    let i = 0;
    const clrInt = setInterval(async () => {
      i++;
      if (i < 60) {
        try {
          const firstCheck = await connection.getSignatureStatus(signature);
          if (
            (firstCheck?.value?.confirmationStatus === "processed" ||
              firstCheck?.value?.confirmationStatus === "confirmed" ||
              firstCheck?.value?.confirmationStatus === "finalized") &&
            firstCheck?.value?.err === null
          ) {
            clearInterval(clrInt);
            await wait(1500);

            res.status(200).json({ info: "success" });
            return;
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log("Max attempts reached.");
        res.status(500).json({ info: "max" });
      }
    }, 2000);
  } catch (e) {
    console.log(e);
    res.status(500).json({ info: "failed" });
  }
}
