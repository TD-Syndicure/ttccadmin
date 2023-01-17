// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const db = getFirestore(app);
    const requestData = JSON.parse(req.body)
    const walletAddress = requestData.publicKey

    const requestedInfo = requestData.request
    const signature = requestData.signature
    const extraInfo = requestData.extraInfo

    if (requestedInfo === "updateAppliedTraits") {
        await updateDoc(doc(db, "nfts", extraInfo.nft), {
            appliedTraits: extraInfo.appliedTraits,
            signature: signature ?? null
        })
        res.status(200).json({ info: "success" });
    } else if (requestedInfo === "updateTrait") {
        await updateDoc(doc(db, "traits", extraInfo.item), {
            costSOL: +extraInfo.costSOL,
            cost: +extraInfo.cost,
            quantity: extraInfo.quantity,
            metadata: extraInfo.metadata,
            hashlist: extraInfo.hashlist,
            available: extraInfo.available
        })
        res.status(200).json({ info: "success" });
    } else if (requestedInfo === "deleteTrait") {
        await deleteDoc(doc(db, "traits",extraInfo))
        res.status(200).json({ info: "success" });
    } else if (requestedInfo === "addTrait") {
        const newTraitDocID = await addDoc(collection(db, "traits"), {
            costSOL: +extraInfo.costSOL,
            cost: +extraInfo.cost,
            metadata: extraInfo.metadata,
            hashlist: extraInfo.hashlist,
            quantity: extraInfo.quantity,
            available: extraInfo.available
        })
        res.status(200).json({ info: newTraitDocID.id });
    } else if (requestedInfo === "updateQuantity") {
        await updateDoc(doc(db, "traits", extraInfo.id), {
            quantity: +extraInfo.quantity
        })
        res.status(200).json({ info: "success" });
    } else if (requestedInfo === "editHashlist") {
        await updateDoc(doc(db, "admin", "hashlist"), {
            items: extraInfo
        })
        res.status(200).json({ info: "success" });
    }

}