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
    orderBy
} from "firebase/firestore/lite";
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
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "../../node_modules/@solana/spl-token"
import bs58 from "bs58"
import { wait } from '../../scripts/helpers';
import {initializeApp} from 'firebase/app';

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

    const connection = new Connection("https://greatest-summer-pine.solana-mainnet.discover.quiknode.pro/00ffa4253f9b899be3e75cb0e176091c6df54cac/", { commitment: "processed", confirmTransactionInitialTimeout: 60000 });
    const requestData = JSON.parse(req.body)
    const signature = requestData.signature

    try {

        const firstCheck = await connection.getSignatureStatus(signature)
        if (firstCheck?.value?.confirmationStatus === "processed" || firstCheck?.value?.confirmationStatus === "confirmed" || firstCheck?.value?.confirmationStatus === "finalized") {
            await wait(2000)
            res.status(200).json({info: "success"});
            return
        }
        const blockhash = await connection.getLatestBlockhash()
        await connection.confirmTransaction({
            signature: signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).then(async () => {
            res.status(200).json({info: "success"});
        })

    } catch(e) {

        console.log(e)
        res.status(500).json({info: "failed"});

    }

}
