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
    where
} from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '../../node_modules/@solana/spl-token';


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
    const user = new PublicKey(requestData.publicKey)
    const devkeyPair = Keypair.fromSecretKey(bs58.decode(process.env.TRAITS_ENCRYPT!))

    const possibleTrait = requestData.nft

    const paymentType = requestData.paymentType


    // console.log('source: ' + devkeyPair.publicKey.toBase58())
    // console.log('dest: ' + requestData.publicKey)
    // console.log('possible trait:' + requestData.nft)

    const connection = new Connection(
        "https://greatest-summer-pine.solana-mainnet.discover.quiknode.pro/00ffa4253f9b899be3e75cb0e176091c6df54cac/",
        { commitment: "processed", confirmTransactionInitialTimeout: 60000 },
    );

    const databaseTrait = await getDoc(doc(db, "traits", requestData.trait))
    if (!databaseTrait.exists()) {
        console.log("trait doesn't exist in db")
        res.status(500).json({ result: 'failed' })
        return null
    }

    // //AUTHENTICATION

    // const findATA = await Token.getAssociatedTokenAddress(
    //     ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    //     TOKEN_PROGRAM_ID,
    //     new PublicKey("8ZKGnRpnM1BVN9SGBuJaXSf1cHwQ2fWUvPpXWoMWT31C"), //mint address
    //     devkeyPair.publicKey, // owner
    // )

    // const findSignature = await connection.getParsedTransaction(requestData.signature, "confirmed")
    // if (!findSignature) {
    //     console.log("tx hash doesn't exist")
    //     res.status(500).json({ result: 'failed' })
    //     return null
    // } else if (findSignature.transaction.message.accountKeys[0].pubkey.toBase58() !== requestData.publicKey) {
    //     console.log("not authorized to make this call -- wrong sender")
    //     res.status(500).json({ result: 'failed' })
    //     return null
    // } else if (!findSignature?.transaction.message.instructions.some((o: any) => +o?.parsed?.info?.amount === +(+databaseTrait.data().costSOL * LAMPORTS_PER_SOL ) || +o?.parsed?.info?.amount === +(+databaseTrait.data().cost * LAMPORTS_PER_SOL ))) {
    //     console.log("not authorized to make this call -- wrong price")
    //     console.log(findSignature)
    //     res.status(500).json({ result: 'failed' })
    //     return null
    // } else if (!findSignature?.transaction.message.instructions.some((o: any) => o?.parsed?.info?.destination === findATA.toBase58() || o?.parsed?.info?.destination === devkeyPair.publicKey.toBase58())) {
    //     console.log("not authorized to make this call -- wrong receiver")
    //     res.status(500).json({ result: 'failed' })
    //     return null
    // } else if (new Date().getTime() - (+findSignature?.blockTime! * 1000) > 120000) {
    //     console.log("not authorized to make this call -- time expired")
    //     res.status(500).json({ result: 'failed' })
    //     return null
    // }




    // async function isBlockhashExpired(initialBlockHeight: any) {
    //     const currentBlockHeight = await connection.getBlockHeight();

    //     return currentBlockHeight > initialBlockHeight;
    // }

    // const wait = (ms: any) => {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    const sendCUSTOM = async () => {
        let instructions: any = []
        //send new trait from dev wallet to user
        const tokenMint = new PublicKey(possibleTrait)
        const destinationWallet = new PublicKey(requestData.publicKey)
        // GET SOURCE ASSOCIATED ACCOUNT
        const associatedSourceTokenAddr = await getAssociatedTokenAddress(tokenMint, devkeyPair.publicKey);
        // GET DESTINATION ASSOCIATED ACCOUNT
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(tokenMint, destinationWallet);
        const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);
        if (receiverAccount === null) {
            instructions.push(createAssociatedTokenAccountInstruction(destinationWallet, associatedDestinationTokenAddr, destinationWallet, tokenMint));
        }
        instructions.push(createTransferInstruction(associatedSourceTokenAddr, associatedDestinationTokenAddr, devkeyPair.publicKey, 1));

        //send from user to dev wallet
        if (paymentType === 'sol') {
            instructions.push(SystemProgram.transfer({ fromPubkey: destinationWallet, toPubkey: devkeyPair.publicKey, lamports: +databaseTrait.data().costSOL * LAMPORTS_PER_SOL }))
        } else {
            const tokenMint2 = new PublicKey("8ZKGnRpnM1BVN9SGBuJaXSf1cHwQ2fWUvPpXWoMWT31C")
            // GET SOURCE ASSOCIATED ACCOUNT
            const associatedSourceTokenAddr2 = await getAssociatedTokenAddress(tokenMint2, destinationWallet);
            // GET DESTINATION ASSOCIATED ACCOUNT
            const associatedDestinationTokenAddr2 = await getAssociatedTokenAddress(tokenMint2, devkeyPair.publicKey);
            instructions.push(createTransferInstruction(associatedSourceTokenAddr2, associatedDestinationTokenAddr2, destinationWallet, +databaseTrait.data().cost * LAMPORTS_PER_SOL));
        }

        const blockhash = await connection.getLatestBlockhash()
        //transaction
        const transaction = new Transaction().add(...instructions);
        transaction.feePayer = devkeyPair.publicKey;
        transaction.recentBlockhash = blockhash.blockhash;

        try {
            transaction.partialSign({
                publicKey: devkeyPair.publicKey,
                secretKey: devkeyPair.secretKey
            })

            res.status(200).json({info: transaction.serialize({requireAllSignatures: false})});
        } catch (e) {
            console.log(e)
        }
    }

    try {
        await sendCUSTOM()
    } catch (e) {
        console.log(e)
        res.status(500).json({ info: 'failed' })
    }

}