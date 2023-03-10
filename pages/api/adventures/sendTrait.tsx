// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import web3, {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from "../../../node_modules/@solana/spl-token"
import * as splToken from "@solana/spl-token"
import bs58 from "bs58"
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
  arrayUnion
} from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { Metaplex } from '@metaplex-foundation/js';

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
  const requestData = JSON.parse(req.body)

  const tx = Transaction.from(requestData.tx.data)

  const connection = new Connection(
      "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
      { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 },
  );

  const wait = (ms: any) => {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {
      const signature2 = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 10 })

      let i: any = 0
      const clrInt = setInterval(async () => {
          i++
          if (i < 60) {
              try {
                  const firstCheck = await connection.getSignatureStatus(signature2)
                  if ((firstCheck?.value?.confirmationStatus === "processed" || firstCheck?.value?.confirmationStatus === "confirmed" || firstCheck?.value?.confirmationStatus === "finalized") && firstCheck?.value?.err === null) {

                      clearInterval(clrInt)
                      await updateDoc(doc(db, "missions", requestData.claim), {
                          claimed: true
                      })
                      await wait(1000)
                      res.status(200).json({ info: "success" });
                      return
                  }
              } catch (e) {
                  console.log(e)
              }
          } else {

              console.log("Max attempts reached.")
              res.status(500).json({ info: "failed" });

          }

      }, 2000)
  } catch (e) {
      console.log(e)
      res.status(500).json({ result: 'failed' })
  }

}