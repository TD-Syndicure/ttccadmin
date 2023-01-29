import React, { useState, useEffect } from "react"
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';


import bs58 from 'bs58'

import web3, {
    Keypair,
    Transaction,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Connection,
    clusterApiUrl,
    sendAndConfirmTransaction,
    PublicKey,
} from '@solana/web3.js';
import moment from 'moment';



import { useWallet } from '@solana/wallet-adapter-react';
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import timeAgo from "../scripts/date"

import mints from '../scripts/mints.json'
import metadata from '../scripts/metadata.json'

import { initScriptLoader } from "next/script";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { Metaplex } from "@metaplex-foundation/js";

export default function Admin() {
    const alert = useAlert()
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    function createConnection(url = "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/") {
        return new Connection(url, { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 });
    }
    const connection = createConnection();
    const router = useRouter()
    const authenticatedUsers = ['CHkSoSiC4ds3N7LkjyonMtdzdoFPZGJ8C9gfen5z2sHN', 'Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2', "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L", 'TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L', 'AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr', '3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf']

    const [refresh, setRefresh]: any = useState(false)
    const [availableMissions, setAvailableMissions]: any = useState([])
    const [loading, setLoading]: any = useState(false)
    const [alertStatus, setAlertStatus] = useState(["none", "none"])
    const [authenticatedUser, setAuthenticatedUser]: any = useState(false)

    const writeAPI = async (request: any, signature: any, extraInfo: any) => {

        const requestData = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ publicKey: publicKey?.toBase58(), request: request, signature: signature, extraInfo: extraInfo })
        }
        var response = await fetch('./api/db/write', requestData)

        return response.json()

    }

    const readAPI = async (request: any, extraInfo: any) => {

        const requestData = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ publicKey: publicKey?.toBase58(), request: request, extraInfo: extraInfo })
        }
        var response = await fetch('./api/db/read', requestData)

        return response.json()

    }

    const RenderContent = () => {
        const [owner, setOwner]: any = useState()
        const [nft, setNFT]: any = useState()
        const [nftAI, setNFTAI]: any = useState()
        const [nftMetadata, setNFTMetadata]: any = useState()
        const [nftAIMetadata, setNFTAIMetadata]: any = useState()
        const [mission, setMission]: any = useState()
        const [time, setTime]: any = useState()

        useEffect(() => {

            const getInfo = async () => {
                const metaplex = new Metaplex(connection);
                if (nft) {
                    try {
                        if (nft != undefined) {
                            console.log(nft)
                            const mint: any = new PublicKey(nft);
                            const task = metaplex.nfts().findByMint({ mintAddress: mint });
                            const nftData = await task.run();
                            if (nftData) {
                                setNFTMetadata(nftData.json)
                            }
                        }
                    } catch (e) {
                        alert.removeAll()
                        alert.error("Chimp not found!")
                        console.log(e)
                    }
                }
                if (nftAI) {
                    try {
                        if (nftAI != undefined) {
                            const mint: any = new PublicKey(nftAI);
                            const task = metaplex.nfts().findByMint({ mintAddress: mint });
                            const nftData = await task.run();
                            if (nftData) {
                                setNFTAIMetadata(nftData.json)
                            }
                        }
                    } catch (e) {
                        alert.removeAll()
                        alert.error("AI Chimp not found!")
                        console.log(e)
                    }
                }
            }

            getInfo()

        }, [nft, nftAI])

        useEffect(() => {

            console.log(nftMetadata)

        }, [nftMetadata])

        const StartMission = () => {
            const [foundMission, setFoundMission]: any = useState()

            useEffect(() => {
                const findMission = async () => {
                    const response = await readAPI("checkIfMissionExists", mission)
                    if (response) {
                        console.log(response)
                        setFoundMission(response.info)
                    }
                }
                findMission()
            }, [])

            const runStart = async () => {
                alert.removeAll()
                alert.info("Adding mission manually...")

                const day = 86400 * 1000
                const returnDate = new Date(+(new Date(time).getTime()) + (day * +foundMission?.data?.length))
                const sidekickReturnDate = new Date(+(new Date(time).getTime()) + (day * (+foundMission?.data?.length * .95)))

                if (foundMission) {

                    if (nftAI && nftAI !== '' && nftAI !== null) {
                        const addManualMission = async () => {
                            const response = await writeAPI("fixMission", null, {
                                claimed: false,
                                mission: mission,
                                nftHash: nft,
                                nftID: nftMetadata.name,
                                nftIMG: nftMetadata.image,
                                owner: owner,
                                sidekickHash: nftAI,
                                sidekickID: nftAIMetadata.name,
                                sidekickIMG: nftAIMetadata.image,
                                timeReturn: sidekickReturnDate.getTime(),
                                timeSent: new Date(time).getTime()
                            })
                        }

                        await addManualMission()

                    } else {

                        const addManualMission = async () => {
                            const response = await writeAPI("fixMission", null, {
                                claimed: false,
                                mission: mission,
                                nftHash: nft,
                                nftID: nftMetadata.name,
                                nftIMG: nftMetadata.image,
                                owner: owner,
                                sidekickHash: null,
                                sidekickID: null,
                                sidekickIMG: null,
                                timeReturn: returnDate.getTime(),
                                timeSent: new Date(time).getTime()
                            })
                        }

                        await addManualMission()

                    }


                    alert.removeAll()
                    alert.success("Successfully added mission!")
                    setOwner('')
                    setNFT('')
                    setNFTAI('')
                    setNFTAIMetadata('')
                    setNFTMetadata('')
                    setMission('')
                    setTime('')

                } else {
                    alert.removeAll()
                    alert.error("Mission not found!")
                }
            }

            return (
                <button onClick={() => runStart()}>Add Mission</button>
            )
        }

        const handleInput = (e: any) => {
            var d = new Date();
            var ty = e.target.value;
            var newDate = new Date(d.toString().split(":")[0].slice(0, -2) + ty);
            setTime(newDate)
        }

        return (
            <div className="manual">
                <div className="manualText">
                    <h1>Manually Add Mission</h1>
                    <h3>Only to be used when a user's NFT gets sent but mission did not start.</h3>
                    <h4>Enter EXACT values, and get the time the user tried to start the mission (can be retrieved via solscan).</h4>
                </div>
                <input type="text" placeholder="Owner wallet address" value={owner} onChange={(e) => setOwner(e.target.value)} />
                <input type="text" placeholder="Main (Chimp) token address" value={nft} onChange={(e) => setNFT(e.target.value)} />
                <input type="text" placeholder="Sidekick (AI Chimp) token address (optional)" value={nftAI} onChange={(e) => setNFTAI(e.target.value)} />
                <input type="text" placeholder="Mission" value={mission} onChange={(e) => setMission(e.target.value)} />
                <input type="text" placeholder="Time Started IN CST TIME (e.g. November 10, 2022 19:00:04)" value={time} onChange={(e) => setTime(e.target.value)} />
                <StartMission />
            </div>
        )
    }

    const Login = () => {
        const [email, setEmail]: any = useState()
        const [password, setPassword]: any = useState()

        const signIn = async () => {
            const requestData = {
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            }
            var response = await fetch('./api/adventures/signIn', requestData)
            const res = await response.json()
            if (res === "success") {
                alert.removeAll()
                alert.success("Signed in!")
                setAuthenticatedUser(true)
            } else {
                alert.removeAll()
                alert.error("Not authorized!")
                setAuthenticatedUser(false)
            }
        }

        return (
            <div className="adminLogin">
                <input
                    type="email"
                    alt="Email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    alt="Password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={() => signIn()}>Log In</button>
            </div>
        )
    }


    return (
        <div className={styles.container}>
            <Head>
                <title>Adventures | Time Traveling Chimps Club</title>
                <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="192x192" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="512x512" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
                <meta property="og:url" content="/" />
                <meta property="og:title" content="Adventures | Time Traveling Chimps Club" />
                <meta
                    property="og:description"
                    content="Community managed derug | 100% Royalties to the DAO | Non-Derivative art | Nostalgic traits"
                />
                <meta property="og:image" content="/banner.png" />
                <meta name="twitter:title" content="Adventures | Time Traveling Chimps Club" />
                <meta
                    name="twitter:description"
                    content="Community managed derug | 100% Royalties to the DAO | Non-Derivative art | Nostalgic traits"
                />
                <meta name="twitter:image" content="/banner.png" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <main className={styles.main}>
                <div className="navbar">
                    <div className="selectSession">
                        <button onClick={() => router.push('/')} style={{ background: '#FFFFFF', color: '#B7B7B7' }} className="bigButtons">Back to Home</button>
                    </div>
                    <img src="/logo.png" />
                    <div className="flex">
                        <a href="https://twitter.com/TimeTravelingCC" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30">
                                <path d="M28,6.937c-0.957,0.425-1.985,0.711-3.064,0.84c1.102-0.66,1.947-1.705,2.345-2.951c-1.03,0.611-2.172,1.055-3.388,1.295 c-0.973-1.037-2.359-1.685-3.893-1.685c-2.946,0-5.334,2.389-5.334,5.334c0,0.418,0.048,0.826,0.138,1.215 c-4.433-0.222-8.363-2.346-10.995-5.574C3.351,6.199,3.088,7.115,3.088,8.094c0,1.85,0.941,3.483,2.372,4.439 c-0.874-0.028-1.697-0.268-2.416-0.667c0,0.023,0,0.044,0,0.067c0,2.585,1.838,4.741,4.279,5.23 c-0.447,0.122-0.919,0.187-1.406,0.187c-0.343,0-0.678-0.034-1.003-0.095c0.679,2.119,2.649,3.662,4.983,3.705 c-1.825,1.431-4.125,2.284-6.625,2.284c-0.43,0-0.855-0.025-1.273-0.075c2.361,1.513,5.164,2.396,8.177,2.396 c9.812,0,15.176-8.128,15.176-15.177c0-0.231-0.005-0.461-0.015-0.69C26.38,8.945,27.285,8.006,28,6.937z">
                                </path>
                            </svg>
                        </a>
                        <a href="https://discord.gg/saT5bZayns" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24">
                                <path d="M21,23l-4.378-3.406L17,21H5c-1.105,0-2-0.895-2-2V5c0-1.105,0.895-2,2-2h14c1.105,0,2,0.895,2,2V23z M16.29,8.57	c0,0-1.23-0.95-2.68-1.06l-0.3,0.61C12.86,8.04,12.4,7.98,12,7.98c-0.41,0-0.88,0.06-1.31,0.14l-0.3-0.61	C8.87,7.66,7.71,8.57,7.71,8.57s-1.37,1.98-1.6,5.84C7.49,15.99,9.59,16,9.59,16l0.43-0.58c-0.44-0.15-0.82-0.35-1.21-0.65	l0.09-0.24c0.72,0.33,1.65,0.53,3.1,0.53s2.38-0.2,3.1-0.53l0.09,0.24c-0.39,0.3-0.77,0.5-1.21,0.65L14.41,16	c0,0,2.1-0.01,3.48-1.59C17.66,10.55,16.29,8.57,16.29,8.57z M10,13.38c-0.52,0-0.94-0.53-0.94-1.18c0-0.65,0.42-1.18,0.94-1.18	s0.94,0.53,0.94,1.18C10.94,12.85,10.52,13.38,10,13.38z M14,13.38c-0.52,0-0.94-0.53-0.94-1.18c0-0.65,0.42-1.18,0.94-1.18	s0.94,0.53,0.94,1.18C14.94,12.85,14.52,13.38,14,13.38z">
                                </path>
                            </svg>
                        </a>
                        <a href="https://magiceden.io/marketplace/ttcc" target="_blank" style={{ marginRight: '15px' }}>
                            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                                <path id="Path 0" className="s0" d="m56.5 93.7c2.8 0.2 7.4 1.7 10.3 3.1 4 2 14.5 11.8 43.3 39.9 20.8 20.5 38.5 37.3 39.2 37.3 0.6 0 5.3-5.8 10.4-12.8 5.1-7 15.8-21.7 23.8-32.7 8.1-11 16.3-22 18.3-24.4 2.1-2.5 5.5-5.6 11.7-9.6l74.5-0.2c47.3-0.2 75.9 0.1 78.3 0.7 2 0.6 5.6 2.5 8 4.3 2.5 1.9 5.3 5.4 7 8.7 2.2 4.4 2.7 6.8 2.7 12 0 4.2-0.7 7.9-1.9 10.5-1 2.2-3.6 5.7-5.7 7.7-2.2 2-6.1 4.7-8.9 5.9-4.9 2.2-5.7 2.3-45.7 2.3-22.3 0.1-41 0.4-41.5 0.8-0.4 0.5-0.1 1.6 0.8 2.5 0.9 1 7.9 9.2 15.6 18.3 7.7 9.1 15 18.5 16.3 21 1.3 2.5 2.5 7.1 2.8 10.5 0.3 3.5-0.1 7.7-0.8 10-0.7 2.2-2.7 6.1-4.4 8.7-1.7 2.5-9.3 11.9-16.8 20.7-7.6 8.9-13.8 16.5-13.8 17.1 0 0.7 14.1 1 40.3 1 32 0 41.2 0.3 45.2 1.4 3.3 1 6.8 3.1 10.3 6.3q5.3 4.8 6.9 9.3c1.2 3.3 1.5 6.3 1 11-0.4 4.7-1.4 7.8-3.4 11-1.6 2.5-5.1 6-7.8 7.8-2.8 1.8-6.6 3.7-8.5 4.3-2.1 0.5-31.3 0.8-72.5 0.7-63.6-0.3-69.4-0.4-73.5-2.1-2.5-1-6.2-3-8.3-4.5-2.5-1.7-4.8-4.7-6.5-8.2-2.1-4.6-2.5-6.4-2-11.5 0.3-3.3 1.4-7.8 2.5-10 1.2-2.2 4.4-7.4 7.1-11.5 2.8-4.1 7.7-11.1 10.9-15.5 3.2-4.4 11.8-16 19.1-25.7 12.5-16.9 13.1-17.9 11.8-20-0.8-1.3-7.7-9.5-15.3-18.2-7.6-8.8-14.4-16.1-15-16.3-0.7-0.2-4.6 4.1-8.6 9.5-4 5.3-9.3 12.4-11.8 15.7-2.5 3.3-11.3 15-19.5 25.9-11.6 15.5-15.8 20.3-18.9 21.9-2.2 1.1-5.8 2.4-8 2.8-2.2 0.4-6.2 0.3-9-0.2-2.7-0.6-6.6-1.7-8.5-2.7-1.9-0.9-15-13-29-26.9-14-13.9-25.8-25.3-26.2-25.3-0.5 0-0.9 22.2-1.3 98.5l-2.4 6c-1.4 3.5-4.2 7.7-6.5 10-2.3 2.2-6.3 5.1-9.1 6.4-2.7 1.4-7.5 2.6-10.5 2.9-4.4 0.4-6.6 0-11-2-3-1.4-7-3.8-8.8-5.4-1.9-1.6-4.5-5.1-8.2-12.9l0.2-88c0.3-81.1 0.4-88.3 2-91.5 1-1.9 3.3-5.2 5.3-7.2 1.9-2.1 5.3-4.7 7.5-5.8 2.2-1.1 5.7-2.4 7.8-2.9 2-0.5 6-0.7 8.7-0.4z" />
                            </svg>
                        </a>
                        <WalletMultiButton />
                    </div>
                </div>
                {authenticatedUser ? (
                    <div className="adminScreen">
                        <RenderContent />
                    </div>
                ) : (
                    <div className="adminScreen">
                        <h1 className="notAuthorized">Not Authorized</h1>
                        <Login />
                    </div>
                )}
            </main>
        </div>
    );
}