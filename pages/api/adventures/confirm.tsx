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
import { initializeApp } from 'firebase/app';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '../../../node_modules/@solana/spl-token';
import mints from "../../../scripts/mints.json"
import AImints from "../../../scripts/aiNFTs.json"

const firebaseConfig = {
    apiKey: process.env.ADV_API_KEY,
    authDomain: process.env.ADV_AUTH_DOMAIN,
    projectId: process.env.ADV_PROJECT_ID,
    storageBucket: process.env.ADV_STORAGE_BUCKET,
    messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
    appId: process.env.ADV_APP_ID,
};

const app = initializeApp(firebaseConfig, 'third');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const db = getFirestore(app);

    function createConnection(url = "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/") {
        return new Connection(url, { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 });
    }
    const connection = createConnection();

    const requestData = JSON.parse(req.body)
    const walletAddress = requestData.publicKey
    const requestedInfo = requestData.request
    const signature = requestData.signature
    const extraInfo = requestData.extraInfo
    const missionsCompleted = requestData.missionsCompleted

    const nft = requestData.nft
    const sidekick = requestData.sidekick

    const wait = (ms: any) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const adminMission = await getDoc(doc(db, "admin", extraInfo.id))

    function weightedRand(spec: any) {
        var i,
            j,
            table: any = [];
        for (i in spec) {
            for (j = 0; j < spec[i].chance * 100; j++) {
                if (i === "nft" && sidekick) {
                    console.log("upping chance")
                    table.push({ item: i, number: +spec[i].number+0.05 });
                } else if (i === "nothing" && sidekick) {
                    table.push({ item: i, number: +spec[i].number-0.05 >= 0 ? +spec[i].number-0.05 : +spec[i].number });
                } else {
                    table.push({ item: i, number: +spec[i].number });
                }
            }
        }
        return table[Math.floor(Math.random() * table.length)];
    }
    var rand012 = weightedRand(adminMission?.data()?.items);

    if (requestedInfo === "startMission") {

        let i = 0
        const clrInt = setInterval(async () => {
            i++
            if (i < 60) {
                try {
                    const firstCheck = await connection.getSignatureStatus(signature)
                    if (firstCheck?.value?.confirmationStatus === "processed" || firstCheck?.value?.confirmationStatus === "confirmed" || firstCheck?.value?.confirmationStatus === "finalized") {
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* ============================================== SECURITY MEASURES ============================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */

                        const parsedSignature = await connection.getParsedTransaction(signature)
                        let user: any = parsedSignature?.transaction?.message?.accountKeys[0]?.pubkey?.toBase58()
                        if (user) {
                            clearInterval(clrInt)
                        } else {
                            console.log("trying again")
                            return
                        }
                        const adminMission = await getDoc(doc(db, "admin", extraInfo.id))
                        /* Checking for an eligible Time Machine */
                        const devAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"), new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"))
                        const userAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"), new PublicKey(user))
                        const TXincludesNFT2 = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                            return o?.parsed?.info?.source === userAssociatedAccount2.toBase58() && o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() && +o?.parsed?.info?.amount === 1
                        })
                        if (!TXincludesNFT2) {
                            console.log("This signature does not include the correct NFT.")
                            res.status(500).json({ info: "failed" });
                            return
                        }

                        /* Checking they paid sol for the mission */
                        if (adminMission?.data()?.solCost && adminMission?.data()?.solCost > 0) {
                            const TXincludesSOLPayment = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                                return o?.parsed?.info?.source === user && o?.parsed?.info?.destination === "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L" && +o?.parsed?.info?.lamports === +((adminMission?.data()?.solCost * LAMPORTS_PER_SOL).toFixed(0))
                            })
                            //will fail if they did not send the sol fee
                            if (!TXincludesSOLPayment) {
                                console.log("Did not pay the fee")
                                res.status(500).json({ info: "failed" });
                                return
                            }
                        }

                        /* Checking they paid pltmx for the mission */
                        if (adminMission?.data()?.tokenCost && adminMission?.data()?.tokenCost > 0) {
                            const devAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"), new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"))
                            const userAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"), new PublicKey(user))
                            const TXincludesTokenPayment = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                                return o?.parsed?.info?.source === userAssociatedAccount2.toBase58() && o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() && +o?.parsed?.info?.amount === +((adminMission?.data()?.tokenCost * LAMPORTS_PER_SOL).toFixed(0))
                            })
                            //will fail if they did not send the token fee
                            if (!TXincludesTokenPayment) {
                                console.log("Did not pay the fee")
                                res.status(500).json({ info: "failed" });
                                return
                            }
                        }

                        /* Checking they paid a sidekick nft for the mission */
                        if (sidekick) {
                            const devAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey(sidekick.mint), new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"))
                            const userAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey(sidekick.mint), new PublicKey(user))
                            const TXincludesSidekickPayment = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                                return o?.parsed?.info?.source === userAssociatedAccount2.toBase58() && o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() && +o?.parsed?.info?.amount === 1
                            })
                            //will fail if they did not send the token fee
                            if (!TXincludesSidekickPayment) {
                                console.log("Did not pay the sidekick")
                                res.status(500).json({ info: "failed" });
                                return
                            }
                        }

                        /* Checking they paid a normal nft for the mission */
                        if (nft) {
                            const devAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey(nft.mint), new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"))
                            const userAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey(nft.mint), new PublicKey(user))
                            const TXincludesNFTPayment = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                                return o?.parsed?.info?.source === userAssociatedAccount2.toBase58() && o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() && +o?.parsed?.info?.amount === 1
                            })
                            //will fail if they did not send the token fee
                            if (!TXincludesNFTPayment) {
                                console.log("Did not pay the NFT")
                                res.status(500).json({ info: "failed" });
                                return
                            }
                        }

                        //will fail if the tx is not sent within the last 60 seconds
                        if (new Date().getTime() - (+parsedSignature?.blockTime! * 1000) > 60000) {
                            console.log("This signature has expired.")
                            res.status(500).json({ info: "failed" });
                            return
                        }

                        //this checks if a signature has already been used, so someone can't spam the same transaction over and over to exploit that way.
                        const checkIfSignatureHasBeenUsed = await getDoc(doc(db, "signatures", signature))
                        if (checkIfSignatureHasBeenUsed.exists()) {
                            console.log("This signature has already been used to claim a box.")
                            res.status(500).json({ info: "failed" });
                            return
                        } else {
                            await setDoc(doc(db, "signatures", signature), {})
                        }

                        //check if this nft is eligible to be sent on mission
                        if (!mints.includes(nft.mint)) {
                            console.log("NFT doesn't exist")
                            res.status(500).json({ info: "failed" });
                            return
                        }

                        //check if this ai nft is eligible to be sent on mission
                        if (sidekick && !AImints.includes(sidekick.mint)) {
                            console.log("Sidekick doesn't exist")
                            res.status(500).json({ info: "failed" });
                            return
                        }

                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */
                        /* =============================================================================================================== */




                        const day = 86400 * 1000
                        const fourHours = 3600 * 4
                        const week = (86400 * 7) * 1000
                        const sentDate = new Date()
                        const returnDate = new Date(Number(sentDate.getTime()) + (day * extraInfo.data.length))
                        const sidekickReturnDate = new Date((Number(sentDate.getTime()) + ((day * (extraInfo.data.length)) - fourHours)))
                        let newCompletedMissions: any = []
                        missionsCompleted.forEach(async (el: any) => {
                            if (el.nft === nft.mint) {
                                newCompletedMissions = [...el.completed, extraInfo.id]
                            }
                        })
                        await addDoc(collection(db, "missions"), {
                            claimed: false,
                            owner: walletAddress,
                            timeSent: sentDate,
                            timeReturn: sidekick ? sidekickReturnDate : returnDate,
                            nftHash: nft.mint,
                            nftIMG: nft.metadata.image,
                            nftID: nft.metadata.name,
                            sidekickHash: sidekick ? sidekick.mint : null,
                            sidekickIMG: sidekick ? sidekick.metadata.image : null,
                            sidekickID: sidekick ? sidekick.metadata.name : null,
                            mission: extraInfo.id,
                            signature: signature,
                            result: rand012
                        })
                        await updateDoc(doc(db, "nfts", nft.mint), {
                            completedMissions: newCompletedMissions
                        })
                        const alreadyDoc = await getDoc(doc(db, "admin", extraInfo.id))
                        await updateDoc(doc(db, "admin", extraInfo.id), {
                            limit: alreadyDoc?.data()?.limit ? +(alreadyDoc?.data()?.limit - 1) : 0
                        })

                        await wait(1500)

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
    }

    else if (requestedInfo === "speedUp") {

        let i = 0
        const clrInt = setInterval(async () => {
            i++
            if (i < 60) {
                try {
                    const firstCheck = await connection.getSignatureStatus(signature)
                    if (firstCheck?.value?.confirmationStatus === "processed" || firstCheck?.value?.confirmationStatus === "confirmed" || firstCheck?.value?.confirmationStatus === "finalized") {
                        const parsedSignature = await connection.getParsedTransaction(signature)
                        let user: any = parsedSignature?.transaction?.message?.accountKeys[0]?.pubkey?.toBase58()
                        if (user) {
                            clearInterval(clrInt)
                        } else {
                            console.log("trying again")
                            return
                        }
                        const devAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"), new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"))
                        const userAssociatedAccount2 = await getAssociatedTokenAddress(new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"), new PublicKey(user))
                        const TXincludesPLTMX = parsedSignature?.transaction?.message?.instructions?.some((o: any) => {
                            return o?.parsed?.info?.source === userAssociatedAccount2.toBase58() && o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() && +((500* LAMPORTS_PER_SOL).toFixed(0))
                        })
                        if (!TXincludesPLTMX) {
                            console.log("This signature does not include the correct amount of PLTMX")
                            res.status(500).json({ info: "failed" });
                            return
                        }

                        await wait(1000)
                        const day = 86400000
                        const newReturnDate = new Date((extraInfo.data.timeReturn.seconds * 1000) - (day / 2))
                        const newSentDate = new Date((extraInfo.data.timeSent.seconds * 1000) - (day / 2))
                        await updateDoc(doc(db, "missions", extraInfo.id), {
                            timeReturn: newReturnDate,
                            timeSent: newSentDate
                        })

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

    }

}