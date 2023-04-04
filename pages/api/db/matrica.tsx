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
    where
} from "firebase/firestore";
import {initializeApp} from 'firebase/app';
import { Connection, PublicKey } from '@solana/web3.js';

const firebaseConfig = {
  apiKey: process.env.ADV_API_KEY,
  authDomain: process.env.ADV_AUTH_DOMAIN,
  projectId: process.env.ADV_PROJECT_ID,
  storageBucket: process.env.ADV_STORAGE_BUCKET,
  messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
  appId: process.env.ADV_APP_ID,
};

const app = initializeApp(firebaseConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    function createConnection(url = "https://sly-sleek-grass.solana-mainnet.quiknode.pro/10b32dede2c9f7277037b8524ccccf0ae7a0fddd/") {
        return new Connection(url, { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 });
    }
    const connection = createConnection();
    const db = getFirestore(app);
    function getAllIndexes(arr: any, val: any) {
        var indexes = [], i;
        for(i = 0; i < arr.length; i++)
            if (arr[i]?.owner === val)
                indexes.push(i);
        return indexes;
    }

    const getActiveMissions = async () => {
        let localArr: any = []
        let notDBArr: any = []
        const q = query(collection(db, "missions"), where("claimed", "==", false));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            notDBArr.push(doc.data())
        });
        notDBArr.forEach((item:any) => {
            let localUserArr: any = []
            let indexes = getAllIndexes(notDBArr, item.owner)
            indexes.forEach((index) => {
                localUserArr.push(notDBArr[index].nftHash)
            })
            if (!localArr.some((o: any) => o?.owner === item.owner)) {
                localArr.push({owner: item.owner, nfts: localUserArr})
            }
        })
        let obj = localArr.reduce((obj: any, cur: any) => ({...obj, [cur.owner]: cur.nfts}), {})

        return obj
    }

    try {
        const info = await getActiveMissions()
        res.status(200).json(info);
    } catch(e) {
        console.log(e)
        res.status(500).json({message: "error"});
    }


}