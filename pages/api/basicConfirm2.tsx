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
import { initializeApp } from 'firebase/app';

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
    const connection = new Connection("https://sly-sleek-grass.solana-mainnet.quiknode.pro/10b32dede2c9f7277037b8524ccccf0ae7a0fddd/", { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 });
    const requestData = JSON.parse(req.body)
    const signature = requestData.signature
    const id = requestData.id

    const wait = (ms: any) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    try {




        let i: any = 0
        const clrInt = setInterval(async () => {
            i++
            if (i < 60) {
                try {
                    const firstCheck = await connection.getSignatureStatus(signature)
                    if ((firstCheck?.value?.confirmationStatus === "processed" || firstCheck?.value?.confirmationStatus === "confirmed" || firstCheck?.value?.confirmationStatus === "finalized") && firstCheck?.value?.err === null) {

                        clearInterval(clrInt)
                        await updateDoc(doc(db, "missions", id), {
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
                res.status(500).json({ info: "max" });

            }

        }, 2000)











        // const blockhash = await connection.getLatestBlockhash()
        // const confirmCheck = await connection.getSignatureStatus(signature)

        // if (confirmCheck?.value?.confirmationStatus === 'processed' || confirmCheck?.value?.confirmationStatus === 'confirmed' || confirmCheck?.value?.confirmationStatus === 'finalized') {
        //     await updateDoc(doc(db, "missions", id), {
        //         claimed: true
        //     })
        //     await wait(3000)
        //     res.status(200).json({ info: "success" });
        //     return
        // }
        // await connection.confirmTransaction({
        //     signature: signature,
        //     blockhash: blockhash.blockhash,
        //     lastValidBlockHeight: blockhash.lastValidBlockHeight,
        // }).then(async () => {
        //     await updateDoc(doc(db, "missions", id), {
        //         claimed: true
        //     })
        //     await wait(3000)
        //     res.status(200).json({ info: "success" });
        // }).catch(async (e: any) => {
        //     await connection.confirmTransaction({
        //         signature: signature,
        //         blockhash: blockhash.blockhash,
        //         lastValidBlockHeight: blockhash.lastValidBlockHeight,
        //     }).then(async () => {
        //         await updateDoc(doc(db, "missions", id), {
        //             claimed: true
        //         })
        //         await wait(3000)
        //         res.status(200).json({ info: "success" });
        //     }).catch((e: any) => {
        //         res.status(500).json({ info: "failed" });
        //     })
        // })

    } catch (e) {

        console.log(e)
        res.status(500).json({ info: "failed" });

    }

}