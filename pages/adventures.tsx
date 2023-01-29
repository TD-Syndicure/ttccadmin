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
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import axios from "axios";
import { programs } from "@metaplex/js";
import { AiOutlineClose } from "react-icons/ai";
const {
    metadata: { Metadata },
} = programs;

export default function Admin() {
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    function createConnection(url = "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/") {
        return new Connection(url, { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 });
    }
    const connection = createConnection();
    const router = useRouter()
    const authenticatedUsers = ['CHkSoSiC4ds3N7LkjyonMtdzdoFPZGJ8C9gfen5z2sHN', 'Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2', 'TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L', 'AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr', '3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf', "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L"]

    const [refresh, setRefresh]: any = useState(false)
    const [availableMissions, setAvailableMissions]: any = useState([])
    const [hashlist, setHashlist]: any = useState([])
    const [hashlist3, setHashlist3]: any = useState([])
    const [traits, setTraits]: any = useState([])
    const [loading, setLoading]: any = useState(false)
    const [authenticatedUser, setAuthenticatedUser]: any = useState(false)
    const [alertStatus, setAlertStatus] = useState(["none", "none"])
    const alert = useAlert()

    const convertTime = (daysss: number) => {
        const decimalHours = daysss * 24;
        const n = new Date(0, 0);
        n.setMinutes(+Math.round(decimalHours * 60));
        const days = (n.getDate() - 1)
        const hours = n.getHours()
        const minutes = n.getMinutes()

        if (days === 0 && hours > 0 && minutes > 0) {
            return (hours + ` hour${hours > 1 ? 's' : ''} ` + minutes + ` minute${minutes > 1 ? 's' : ''}`)
        } else if (days === 0 && hours === 0 && minutes > 0) {
            return (minutes + ` minute${minutes > 1 ? 's' : ''}`)
        } else if (days > 0 && hours > 0) {
            return (days + ` day${days > 1 ? 's' : ''} ` + hours + ` hour${hours > 1 ? 's' : ''} `)
        } else if (days > 0 && hours === 0) {
            return (days + ` day${days > 1 ? 's' : ''}`)
        } else if (days === 0 && hours > 0) {
            return (hours + `hour${hours > 1 ? 's' : ''} `)
        } else {
            return 'Instant!'
        }
    }

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




    useEffect(() => {
        const getHashlist = async () => {
            const response = await readAPI("getHashlist", null)
            const response2 = await readAPI("getHashlist2", null)
            const response3 = await readAPI("getTraits", null)
            if (response) {
                setHashlist(response.info)
            }
            if (response2) {
                setHashlist3(response2.info)
            }
            if (response3) {
                setTraits(response3.info)
            }
        }

        getHashlist()

        const getMissions = async () => {
            const response = await readAPI("getMissions", null)
            if (response) {
                setAvailableMissions(response.info)
            }
        }

        getMissions()
    }, [refresh])

    // useEffect(() => {

    //     if (alertStatus[0] === "success" || alertStatus[0] === "error") {
    //         setTimeout(() => {
    //             setAlertStatus(["none", "none"])
    //         }, 5000)
    //     }

    // }, [alertStatus])

    //component for rendering alerts when claiming and what not
    const Alert = () => {
        if (alertStatus[0] === "error") {
            return (
                <div className="redMessage alert">
                    <div />
                    <h1>{alertStatus[1]}</h1>
                    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 344 344" width="344" height="344">
                        <path d="m95 47c1.9 0 10.6 8.1 38 35.5 33.1 33.1 35.7 35.5 39 35.5 3.3 0 5.9-2.4 39.1-35.5 26.8-26.6 36.3-35.5 38-35.5 1.8 0 8.4 6 25.1 22.8 17.6 17.5 22.8 23.3 22.8 25.2 0 1.9-7.9 10.3-35.5 38-33.1 33.1-35.5 35.7-35.5 39 0 3.3 2.4 5.9 35.5 39 27.6 27.7 35.5 36.1 35.5 38 0 1.9-5.2 7.7-22.8 25.3-17.5 17.4-23.3 22.7-25.2 22.7-1.9 0-10.6-8.1-38-35.5-31.1-31.1-35.9-35.5-38.6-35.5-2.7 0-7.4 4.3-39 35.5-27.9 27.5-36.5 35.5-38.4 35.5-1.9 0-7.7-5.2-25.2-22.8-17.6-17.5-22.8-23.3-22.8-25.2 0-1.9 7.9-10.3 35.5-38 33.1-33.1 35.5-35.7 35.5-39 0-3.3-2.4-5.9-35.5-39-29.1-29.1-35.4-35.9-35.3-38 0.2-1.7 6.9-9.1 22.8-25.2 17.4-17.6 23.1-22.8 25-22.8z" />
                    </svg>
                </div>
            )
        } else if (alertStatus[0] === "pending") {
            return (
                <div className="yellowMessage alert">
                    <div />
                    <h1>{alertStatus[1]}</h1>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns-xlink="http://www.w3.org/1999/xlink" style={{ margin: 'auto', background: 'none', display: 'block', shapeRendering: 'auto' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                        <circle cx="50" cy="50" fill="none" stroke="#eed16c" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138">
                            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
                        </circle>
                    </svg>
                </div>
            )
        } else if (alertStatus[0] === "success") {
            return (
                <div className="greenMessage alert">
                    <div />
                    <h1>{alertStatus[1]}</h1>
                    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 172 172" width="172" height="172">
                        <path fillRule="evenodd" d="m89 16.5c7 0.3 11.8 1.1 18 3.2 4.7 1.6 11 4.3 14 6.1 3 1.8 7.3 4.8 13.5 10.1l-7.4 7.6-4.3-3.6c-2.4-2-6.3-4.6-8.8-5.9-2.5-1.3-7-3.1-10-4.2-3-1-9.1-2.2-13.5-2.5-4.6-0.3-11-0.1-15 0.6-4.1 0.7-10.5 2.9-15.5 5.3-6.5 3.1-10.2 5.8-15.6 11.2-5.4 5.4-8.1 9.1-11.2 15.6-2.2 4.7-4.5 11.2-5.1 14.5-0.6 3.3-1.1 8.5-1.1 11.5 0 3 0.5 8.2 1.1 11.5 0.6 3.3 2.9 9.8 5.1 14.5 3.1 6.5 5.8 10.2 11.2 15.6 5.4 5.4 9.1 8.1 15.6 11.2 4.7 2.2 11.2 4.5 14.5 5.1 3.3 0.6 8.5 1.1 11.5 1.1 3 0 8.2-0.5 11.5-1.1 3.3-0.6 9.8-2.9 14.5-5.1 6.5-3.1 10.2-5.8 15.6-11.2 5.4-5.4 8.1-9.1 11.2-15.6 2.4-5 4.6-11.4 5.3-15.5 0.7-4.2 0.9-10.4-0.1-24l4-4c2.2-2.2 4.2-3.8 4.5-3.5 0.2 0.3 1.2 3.9 2.1 8 1.1 5.3 1.4 10.1 1 16.5-0.3 5-1.5 12.2-2.7 16-1.1 3.8-3.7 10.2-5.7 14-2.5 4.8-6.3 9.6-12.2 15.5-5.9 5.9-10.7 9.7-15.5 12.2-3.8 2-10.4 4.7-14.5 5.9-6 1.9-9.8 2.4-19 2.4-9.2 0-13-0.5-19-2.4-4.1-1.2-10.6-3.9-14.5-5.9-4.8-2.5-9.6-6.3-15.5-12.2-5.9-5.9-9.7-10.7-12.2-15.5-2-3.8-4.7-10.4-5.9-14.5-1.9-6-2.4-9.8-2.4-19 0-9.2 0.5-13 2.4-19 1.2-4.1 3.9-10.6 5.9-14.5 2.5-4.8 6.3-9.6 12.2-15.5 5.9-6 10.6-9.6 15.5-12.2 3.9-1.9 9.5-4.3 12.5-5.3 3-1 7.5-2.1 10-2.6 2.5-0.4 8.8-0.6 14-0.4zm57.4 22.5l7.6 7.5-33.7 33.8c-18.6 18.5-34.1 33.7-34.5 33.7-0.5 0-7.6-6.6-30.9-29.5l8.1-8 23 23z" />
                    </svg>
                </div>
            )
        } else {
            return null
        }
    }

    const RenderMissions = () => {
        const AddMission = () => {

            const [name, setName]: any = useState()
            const [chimpPercent, setChimpPercent]: any = useState(0)
            const [traitPercent, setTraitPercent]: any = useState(0)
            const [solPercent, setSolPercent]: any = useState(0)
            const [solAmount, setSolAmount]: any = useState(0)

            const [tokenPercent, setTokenPercent]: any = useState(0)
            const [tokenAmount, setTokenAmount]: any = useState(0)

            const [tokenPercent2, setTokenPercent2]: any = useState(0)
            const [tokenAmount2, setTokenAmount2]: any = useState(0)

            const [tokenPercent3, setTokenPercent3]: any = useState(0)
            const [tokenAmount3, setTokenAmount3]: any = useState(0)

            const [tokenPercent4, setTokenPercent4]: any = useState(0)
            const [tokenAmount4, setTokenAmount4]: any = useState(0)

            const [tokenPercent5, setTokenPercent5]: any = useState(0)
            const [tokenAmount5, setTokenAmount5]: any = useState(0)

            const [nothingPercent, setNothingPercent]: any = useState(0)
            const [tokenCost, setTokenCost]: any = useState(0)
            const [solCost, setSOLCost]: any = useState(0)
            const [length, setLength]: any = useState(0)
            const [lore, setLore]: any = useState()
            const [confirm, setConfirm]: any = useState(false)
            const [expiration, setExpiration]: any = useState(0)
            const [limit, setLimit]: any = useState(0)

            const [traitsHashlist, setTraitsHashlist]: any = useState("[]")
            const [nftsHashlist, setNFTsHashlist]: any = useState("[]")


            const addMissionToDatabase = async () => {
                //setAlertStatus(["pending", "Adding mission..."])
                alert.removeAll()
                alert.info("Adding mission...")
                const response = await writeAPI("addMissionToDatabase", null, {
                    name: name,
                    items: {
                        "chimp": {
                            "chance": +((chimpPercent / 100).toFixed(4)),
                            "number": +1
                        },
                        "nft": {
                            "chance": +((traitPercent / 100).toFixed(4)),
                            "number": +1
                        },
                        "nothing": {
                            "chance": +((nothingPercent / 100).toFixed(4)),
                            "number": +0
                        },
                        "sol": {
                            "chance": +((solPercent / 100).toFixed(4)),
                            "number": +solAmount
                        },
                        "tokens": {
                            "chance": +((tokenPercent / 100).toFixed(4)),
                            "number": +tokenAmount
                        },
                        "tokens2": {
                            "chance": +((tokenPercent2 / 100).toFixed(4)),
                            "number": +tokenAmount2
                        },
                        "tokens3": {
                            "chance": +((tokenPercent3 / 100).toFixed(4)),
                            "number": +tokenAmount3
                        },
                        "tokens4": {
                            "chance": +((tokenPercent4 / 100).toFixed(4)),
                            "number": +tokenAmount4
                        },
                        "tokens5": {
                            "chance": +((tokenPercent5 / 100).toFixed(4)),
                            "number": +tokenAmount5
                        }
                    },
                    length: +length,
                    tokenCost: +tokenCost,
                    solCost: +solCost,
                    lore: lore,
                    traitsHashlist: traitsHashlist,
                    nftsHashlist: nftsHashlist,
                    expiration: +expiration,
                    limit: +limit,
                    created: new Date()
                })
                if (response.info === "success") {
                    alert.removeAll()
                    alert.success("Mission successfully added!")
                    //setAlertStatus(["success", "Mission successfully added!"])
                    setRefresh(!refresh)
                } else {
                    //setAlertStatus(["error", "Uh oh. Something went wrong!"])
                    alert.removeAll()
                    alert.error("Uh oh. Something went wrong!")
                    setRefresh(!refresh)
                }
            }

            return (
                <div className="indivMission addAMission">
                    <div className="missionInfo">
                        <h2>ADD A MISSION</h2>
                        <input type="text" className="missionName" onChange={(e) => setName(e.target.value)} placeholder='Name of mission' />
                        <h3><input type="number" onChange={(e) => setChimpPercent(e.target.value)} />% chance for an NFT reward</h3>
                        <h3><input type="number" onChange={(e) => setTraitPercent(e.target.value)} />% chance for a trait NFT</h3>
                        <h3><input type="number" onChange={(e) => setSolPercent(e.target.value)} />% chance for <input type="number" onChange={(e) => setSolAmount(e.target.value)} /> SOL</h3>
                        <h3><input type="number" onChange={(e) => setTokenPercent(e.target.value)} />% chance for <input type="number" onChange={(e) => setTokenAmount(e.target.value)} /> $PLTMX</h3>
                        <h3><input type="number" onChange={(e) => setTokenPercent2(e.target.value)} />% chance for <input type="number" onChange={(e) => setTokenAmount2(e.target.value)} /> SOL</h3>
                        <h3><input type="number" onChange={(e) => setTokenPercent3(e.target.value)} />% chance for <input type="number" onChange={(e) => setTokenAmount3(e.target.value)} /> SOL</h3>
                        <h3><input type="number" onChange={(e) => setTokenPercent4(e.target.value)} />% chance for <input type="number" onChange={(e) => setTokenAmount4(e.target.value)} /> $JELLY</h3>
                        <h3><input type="number" onChange={(e) => setTokenPercent5(e.target.value)} />% chance for <input type="number" onChange={(e) => setTokenAmount5(e.target.value)} /> $PUFF</h3>
                        <h3><input type="number" onChange={(e) => setNothingPercent(e.target.value)} />% chance for absolutely nothing</h3>
                        <h3><input type="number" onChange={(e) => setTokenCost(e.target.value)} /> $PLTMX & <input type="number" onChange={(e) => setSOLCost(e.target.value)} /> SOL ---- <input type="number" onChange={(e) => setLength(e.target.value)} /> day(s)</h3>
                        <h3>LORE: <textarea onChange={(e) => setLore(e.target.value)} /></h3>
                        <h3>Traits Rewards Hashlist: <textarea style={{ minHeight: '150px' }} value={traitsHashlist} onChange={(e) => setTraitsHashlist(e.target.value)} /></h3>
                        <h3>NFT Rewards Hashlist: <textarea style={{ minHeight: '150px' }} value={nftsHashlist} onChange={(e) => setNFTsHashlist(e.target.value)} /></h3>
                        <h3><input type="number" onChange={(e) => setExpiration(e.target.value)} /> day(s) until expiration.</h3>
                        <h3>Limit of <input type="number" onChange={(e) => setLimit(e.target.value)} /> people can board this mission.</h3>
                        <h4 style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>EVERY FIELD IS REQUIRED. IF YOU DON'T WANT AN OPTION TO EXIST, SET TO 0 (except expiration & limit, set to 1000 if no expiration)</h4>
                    </div>
                    <button onClick={() => confirm ? addMissionToDatabase() : setConfirm(true)}>{confirm ? 'Are you sure?' : 'Add Mission'}</button>
                </div>
            )
        }

        const DeleteMission = ({ mission, index }: { mission: any, index: any }) => {
            const [confirm, setConfirm]: any = useState(false)
            const [inProgress, setInProgress]: any = useState()

            useEffect(() => {

                const getProgress = async () => {
                    const response = await readAPI("getProgress", mission.id)
                    if (response) {
                        setInProgress(response.info)
                    }
                }

                // const getProgress = async() => {
                //     const q = query(collection(db, "missions"), where("claimed", "==", false), where("mission", "==", mission.id));

                //     const querySnapshot = await getDocs(q);

                //     setInProgress(querySnapshot.docs.length)
                // }

                if (!inProgress) {
                    getProgress()
                }

            }, [])

            const deleteThisMission = async () => {
                alert.removeAll()
                alert.info("Deleting mission...")
                //setAlertStatus(["pending", "Deleting mission..."])
                await writeAPI("deleteDocument", null, mission.id)
                alert.removeAll()
                alert.success("Mission successfully deleted!")
                //setAlertStatus(["success", "Mission successfully deleted!"])
                setRefresh(!refresh)
            }

            const HandleReturn = () => {
                const [edit, setEdit]: any = useState(false)
                const [name, setName]: any = useState(mission.id)
                const [chimpPercent, setChimpPercent]: any = useState(mission.data.items.chimp.chance * 100)
                const [traitPercent, setTraitPercent]: any = useState(mission.data.items.nft.chance * 100)
                const [solPercent, setSolPercent]: any = useState(mission.data.items.sol.chance * 100)
                const [solAmount, setSolAmount]: any = useState(mission.data.items.sol.number)

                const [tokenPercent, setTokenPercent]: any = useState(mission.data.items.tokens.chance * 100)
                const [tokenAmount, setTokenAmount]: any = useState(mission.data.items.tokens.number)

                const [tokenPercent2, setTokenPercent2]: any = useState(mission.data.items.tokens2?.chance ? mission.data.items.tokens2?.chance * 100 : 0)
                const [tokenAmount2, setTokenAmount2]: any = useState(mission.data.items.tokens2?.number ?? 0)

                const [tokenPercent3, setTokenPercent3]: any = useState(mission.data.items.tokens3?.chance ? mission.data.items.tokens3?.chance * 100 : 0)
                const [tokenAmount3, setTokenAmount3]: any = useState(mission.data.items.tokens3?.number ?? 0)

                const [tokenPercent4, setTokenPercent4]: any = useState(mission.data.items.tokens4?.chance ? mission.data.items.tokens4?.chance * 100 : 0)
                const [tokenAmount4, setTokenAmount4]: any = useState(mission.data.items.tokens4?.number ?? 0)

                const [tokenPercent5, setTokenPercent5]: any = useState(mission.data.items.tokens5?.chance ? mission.data.items.tokens5?.chance * 100 : 0)
                const [tokenAmount5, setTokenAmount5]: any = useState(mission.data.items.tokens5?.number ?? 0)

                const [nothingPercent, setNothingPercent]: any = useState(mission.data.items.nothing.chance * 100)
                const [tokenCost, setTokenCost]: any = useState(mission.data.tokenCost)
                const [solCost, setSOLCost]: any = useState(mission.data.solCost)
                const [length, setLength]: any = useState(mission.data.length)
                const [lore, setLore]: any = useState(mission.data.lore)
                const [confirm, setConfirm]: any = useState(false)
                const [expiration, setExpiration]: any = useState(mission.data.expiration)
                const [limit, setLimit]: any = useState(mission?.data?.limit ?? 0)

                const [traitsHashlist, setTraitsHashlist]: any = useState(mission?.data?.traitsHashlist ?? "[]")
                const [nftsHashlist, setNFTsHashlist]: any = useState(mission?.data?.nftsHashlist ?? "[]")


                const handleEdit = async () => {
                    alert.removeAll()
                    alert.info("Updating mission...")
                    //setAlertStatus(["pending", "Updating mission..."])
                    if (name !== mission.id) {
                        await writeAPI("deleteDocument", null, mission.id)
                    }
                    const response = await writeAPI("addMissionToDatabase2", null, {
                        name: name,
                        items: {
                            "chimp": {
                                "chance": +((chimpPercent / 100).toFixed(4)),
                                "number": +1
                            },
                            "nft": {
                                "chance": +((traitPercent / 100).toFixed(4)),
                                "number": +1
                            },
                            "nothing": {
                                "chance": +((nothingPercent / 100).toFixed(4)),
                                "number": +0
                            },
                            "sol": {
                                "chance": +((solPercent / 100).toFixed(4)),
                                "number": +solAmount
                            },
                            "tokens": {
                                "chance": +((tokenPercent / 100).toFixed(4)),
                                "number": +tokenAmount
                            },
                            "tokens2": {
                                "chance": +((tokenPercent2 / 100).toFixed(4)),
                                "number": +tokenAmount2
                            },
                            "tokens3": {
                                "chance": +((tokenPercent3 / 100).toFixed(4)),
                                "number": +tokenAmount3
                            },
                            "tokens4": {
                                "chance": +((tokenPercent4 / 100).toFixed(4)),
                                "number": +tokenAmount4
                            },
                            "tokens5": {
                                "chance": +((tokenPercent5 / 100).toFixed(4)),
                                "number": +tokenAmount5
                            }
                        },
                        length: +length,
                        tokenCost: +tokenCost,
                        solCost: +solCost,
                        lore: lore,
                        traitsHashlist: traitsHashlist,
                        nftsHashlist: nftsHashlist,
                        expiration: expiration,
                        limit: +limit,
                        created: new Date()
                    })
                    if (response.info === "success") {
                        alert.removeAll()
                        alert.success("Mission successfully updated!")
                        //setAlertStatus(["success", "Mission successfully added!"])
                        setRefresh(!refresh)
                    } else {
                        alert.removeAll()
                        alert.error("Uh oh. Something went wrong!")
                        //setAlertStatus(["error", "Uh oh. Something went wrong!"])
                        setRefresh(!refresh)
                    }
                }
                if (edit) {
                    return (
                        <div key={`missions ${index}`} className="indivMission addAMission">
                            <div className="missionInfo">
                                <h2>{mission.id}</h2>
                                <h3><input type="number" value={chimpPercent} onChange={(e) => setChimpPercent(e.target.value)} />% chance for an NFT reward</h3>
                                <h3><input type="number" value={traitPercent} onChange={(e) => setTraitPercent(e.target.value)} />% chance for a trait NFT</h3>
                                <h3><input type="number" value={solPercent} onChange={(e) => setSolPercent(e.target.value)} />% chance for <input type="number" value={solAmount} onChange={(e) => setSolAmount(e.target.value)} /> SOL</h3>
                                <h3><input type="number" value={tokenPercent} onChange={(e) => setTokenPercent(e.target.value)} />% chance for <input type="number" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} /> $PLTMX</h3>
                                <h3><input type="number" value={tokenPercent2} onChange={(e) => setTokenPercent2(e.target.value)} />% chance for <input type="number" value={tokenAmount2} onChange={(e) => setTokenAmount2(e.target.value)} /> SOL</h3>
                                <h3><input type="number" value={tokenPercent3} onChange={(e) => setTokenPercent3(e.target.value)} />% chance for <input type="number" value={tokenAmount3} onChange={(e) => setTokenAmount3(e.target.value)} /> SOL</h3>
                                <h3><input type="number" value={tokenPercent4} onChange={(e) => setTokenPercent4(e.target.value)} />% chance for <input type="number" value={tokenAmount4} onChange={(e) => setTokenAmount4(e.target.value)} /> $JELLY</h3>
                                <h3><input type="number" value={tokenPercent5} onChange={(e) => setTokenPercent5(e.target.value)} />% chance for <input type="number" value={tokenAmount5} onChange={(e) => setTokenAmount5(e.target.value)} /> $PUFF</h3>
                                <h3><input type="number" value={nothingPercent} onChange={(e) => setNothingPercent(e.target.value)} />% chance for absolutely nothing</h3>
                                <h3><input type="number" value={tokenCost} onChange={(e) => setTokenCost(e.target.value)} /> $PLTMX & <input type="number" value={solCost} onChange={(e) => setSOLCost(e.target.value)} /> SOL ---- <input type="number" value={length} onChange={(e) => setLength(e.target.value)} /> day(s)</h3>
                                <h3>LORE: <textarea onChange={(e) => setLore(e.target.value)} value={lore} /></h3>
                                <h3>Traits Rewards Hashlist: <textarea style={{ minHeight: '150px' }} value={traitsHashlist} onChange={(e) => setTraitsHashlist(e.target.value)} /></h3>
                                <h3>NFT Rewards Hashlist: <textarea style={{ minHeight: '150px' }} value={nftsHashlist} onChange={(e) => setNFTsHashlist(e.target.value)} /></h3>
                                <h4 style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>EVERY FIELD IS REQUIRED. IF YOU DON'T WANT AN OPTION TO EXIST, SET TO 0 (except expiration & limit, set to 1000 if no expiration)</h4>
                                <h3><input type="number" value={expiration} onChange={(e) => setExpiration(e.target.value)} /> day(s) until expiration.</h3>
                                <h3>Limit of <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} /> people can board this mission.</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', gap: '10px' }}>
                                <button style={{ width: 'calc(50% - 5px)', minWidth: 'fit-content', maxWidth: 'none' }} onClick={() => handleEdit()}>Confirm</button>
                                <button style={{ width: 'calc(50% - 5px)', minWidth: 'fit-content', maxWidth: 'none' }} onClick={() => setEdit(false)}>Cancel</button>
                            </div>
                        </div>
                    )
                } else {
                    const handleExpireTime = () => {
                        if (Date.now() > +(new Date(mission.data.created.seconds * 1000)) + +(mission.data.expiration * 86400000)) {
                            return "EXPIRED"
                        } else {
                            return "Expires " + moment(new Date(expireTime).toUTCString()).fromNow()
                        }
                    }
                    const expireTime = +(new Date(mission.data.created.seconds * 1000)) + +(mission.data.expiration * 86400000)
                    return (
                        <div key={`missions ${index}`} className="indivMission">
                            <div className="missionInfo">
                                <h2>{mission.id}</h2>
                                <h3>{mission.data.items.chimp.chance * 100}% chance for an NFT reward</h3>
                                <h3>{mission.data.items.nft.chance * 100}% chance for a trait NFT</h3>
                                <h3>{mission.data.items.sol.chance * 100}% chance for {mission.data.items.sol.number} SOL</h3>
                                <h3>{mission.data.items.tokens.chance * 100}% chance for {mission.data.items.tokens.number} $PLTMX</h3>
                                <h3>{mission.data.items.tokens2?.chance * 100}% chance for {mission.data.items.tokens2?.number} SOL</h3>
                                <h3>{mission.data.items.tokens3?.chance * 100}% chance for {mission.data.items.tokens3?.number} SOL</h3>
                                <h3>{mission.data.items.tokens4?.chance * 100}% chance for {mission.data.items.tokens4?.number} $JELLY</h3>
                                <h3>{mission.data.items.tokens5?.chance * 100}% chance for {mission.data.items.tokens5?.number} $PUFF</h3>
                                <h3>{mission.data.items.nothing.chance * 100}% chance for absolutely nothing</h3>
                                <h3>{mission.data.tokenCost} $PLTMX & {mission.data.solCost} SOL ---- {convertTime(mission.data.length)}</h3>
                                <h3 style={{ fontSize: '14px', fontWeight: '400', color: '#fff', textAlign: 'left' }}>{mission.data.lore}</h3>
                                <h3>Traits Rewards Hashlist: <textarea disabled style={{ minHeight: '150px' }} value={traitsHashlist} onChange={(e) => setTraitsHashlist(e.target.value)} /></h3>
                                <h3>NFT Rewards Hashlist: <textarea disabled style={{ minHeight: '150px' }} value={nftsHashlist} onChange={(e) => setNFTsHashlist(e.target.value)} /></h3>
                                <h3>{handleExpireTime()}</h3>
                                <h3>Limit of {mission?.data?.limit} people can board this mission.</h3>
                            </div>
                            <h1 style={{ fontSize: '14px', minWidth: '100%' }}>Allow users to start this mission? <input type="checkbox" checked={mission.data.available} onChange={async () => {

                                await writeAPI("updateMissionAvailability", null, { id: mission.id, value: !mission.data.available })
                                setRefresh(!refresh)

                            }} /></h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', gap: '10px' }}>
                                <button style={{ width: 'calc(50% - 5px)', minWidth: 'fit-content', maxWidth: 'none' }} onClick={() => confirm ? deleteThisMission() : setConfirm(true)}>{confirm ? 'Are you sure?' : `Delete Mission (${inProgress ? inProgress : 0} in progress)`}</button>
                                <button style={{ width: 'calc(50% - 5px)', minWidth: 'fit-content', maxWidth: 'none' }} onClick={() => setEdit(true)}>Edit</button>
                            </div>
                        </div>
                    )
                }
            }

            return (
                <HandleReturn />
            )
        }

        if (loading) {
            return (
                <div className={styles.MissionContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                        <circle cx="50" cy="50" fill="none" stroke="#ffffff" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138">
                            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
                        </circle>
                    </svg>
                </div>
            )
        } else {
            if (availableMissions.length > 0) {
                return (
                    <>
                        <AddMission />
                        <div className={styles.MissionContainer}>
                            {
                                availableMissions.map(function (mission: any, index: number) {
                                    return <DeleteMission mission={mission} index={index} />
                                })
                            }
                        </div>
                    </>
                )
            } else {
                return (
                    <>
                        <AddMission />
                        <div className={styles.MissionContainer}>
                            <h1 style={{ fontSize: '16px' }}>No missions available.</h1>
                        </div>
                    </>
                )
            }
        }
    }

    const EditHashlist = () => {
        const [localHashlist, setLocalHashlist]: any = useState(hashlist)
        const [localHashlist3, setLocalHashlist3]: any = useState(hashlist3)
        const [open, setOpen]: any = useState(false)
        const [open2, setOpen2]: any = useState(false)
        const [open3, setOpen3]: any = useState(false)
        const [sure, setSure]: any = useState(false)
        const [traitHashlist, setTraitHashlist]: any = useState()
        const [traitMetadata, setTraitMetadata]: any = useState()

        useEffect(() => {

            const getMetadataForOne = async (nft: any) => {

                try {
                    const metadataPDA = await Metadata.getPDA(nft);
                    const onchainMetadata = (await Metadata.load(connection, metadataPDA)).data;
                    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;
                    setTraitMetadata(JSON.stringify(externalMetadata))
                } catch (e) {
                    console.log(`failed to pull metadata for token ${nft}`);
                }
            }
            if (traitHashlist) {
                try {
                    if (Array.isArray(JSON.parse(traitHashlist))) {
                        getMetadataForOne(JSON.parse(traitHashlist)[0])
                    }
                } catch (e) {
                    console.log(e)
                }
            }

        }, [traitHashlist])

        const addIt = async () => {
            alert.removeAll()
            alert.info("Adding...")
            await writeAPI("addTrait", null, {
                metadata: traitMetadata,
                hashlist: traitHashlist
            })
            setRefresh(!refresh)
            alert.removeAll()
            alert.success("Success!")
        }

        const deleteIt = async (o: any) => {
            alert.removeAll()
            alert.info("Deleting...")
            await writeAPI("deleteTrait", null, o.id)
            setRefresh(!refresh)
            alert.removeAll()
            alert.success("Success!")
        }

        const update = async () => {
            alert.removeAll()
            alert.info("Updating...")
            await writeAPI("updateHashlist", null, localHashlist)
            setSure(false)
            alert.removeAll()
            alert.success("Success!")
        }

        const update3 = async () => {
            alert.removeAll()
            alert.info("Updating...")
            await writeAPI("updateHashlist2", null, localHashlist3)
            setSure(false)
            alert.removeAll()
            alert.success("Success!")
        }

        return (
            <>
                <div className="updateHashlist" style={open || open3 ? { flexDirection: 'column', alignItems: 'center' } : { flexDirection: 'row' }}>
                    {open3 ? <></> : <button onClick={() => sure ? update() : open ? setSure(true) : setOpen(!open)}>{sure ? 'Are you sure?' : 'Update Rewards Hashlist (Traits)'}</button>}
                    {open ? <></> : <button onClick={() => sure ? update3() : open3 ? setSure(true) : setOpen3(!open3)}>{sure ? 'Are you sure?' : 'Update Rewards Hashlist (NFTs)'}</button>}
                    {open || open3 ? <></> : <button onClick={() => setOpen2(!open2)}>Add/Delete Traits</button>}
                    {!open ? <></> :
                        <>
                            <button onClick={() => { setSure(false); setOpen(!open) }}>Cancel</button>
                            <textarea value={localHashlist} onChange={(e) => setLocalHashlist(e.target.value)} />
                        </>}
                    {!open3 ? <></> :
                        <>
                            <button onClick={() => { setSure(false); setOpen3(!open3) }}>Cancel</button>
                            <textarea value={localHashlist3} onChange={(e) => setLocalHashlist3(e.target.value)} />
                        </>}
                </div>
                {open2 &&
                    <div className="addTraits">
                        <AiOutlineClose onClick={() => setOpen2(false)} style={{ position: 'absolute', top: '10px', right: '10px', fill: '#fff', height: '25px', width: '25px', cursor: 'pointer' }} />
                        <div className="addTrait">
                            {traitMetadata ? <img src={JSON.parse(traitMetadata)?.image} /> : <img src="/silhouette.png" />}
                            <div className="innerAdd">
                                <textarea onChange={(e) => setTraitHashlist(e.target.value)} value={traitHashlist} placeholder={"Trait hashlist"} />
                                <textarea onChange={(e) => setTraitMetadata(e.target.value)} value={traitMetadata} placeholder={"Trait metadata"} />
                                <button onClick={() => addIt()}>Add Trait</button>
                            </div>
                        </div>
                        {traits.map((o: any) => {
                            return (
                                <div className="addTrait">
                                    <img src={JSON.parse(o?.metadata)?.image} />
                                    <div className="innerAdd">
                                        <textarea value={o.hashlist} disabled />
                                        <textarea value={o.metadata} disabled />
                                        <button onClick={() => deleteIt(o)}>Delete Trait</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </>
        )

    }

    const RenderContent = () => {
        return (
            <>
                <EditHashlist />
                <RenderMissions />
            </>
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
            var response = await fetch('./api/signIn', requestData)
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
                <Alert />
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