import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleAuthProvider, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.ADV_API_KEY,
    authDomain: process.env.ADV_AUTH_DOMAIN,
    projectId: process.env.ADV_PROJECT_ID,
    storageBucket: process.env.ADV_STORAGE_BUCKET,
    messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
    appId: process.env.ADV_APP_ID,
};

const app = initializeApp(firebaseConfig, 'sixth');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getAuth();
    const requestData = JSON.parse(req.body)

    try {
        const user = await signInWithEmailAndPassword(auth, requestData.email, requestData.password)
        res.status(200).json("success");
    } catch (e) {
        res.status(500).json("failed");
    }

}