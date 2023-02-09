import React, { useState, useEffect } from "react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import bs58 from "bs58";

import web3, {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import moment from "moment";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import timeAgo from "../scripts/date";

import mints from "../scripts/mints.json";
import metadata from "../scripts/metadata.json";

import { initScriptLoader } from "next/script";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { Metaplex } from "@metaplex-foundation/js";

export default function Admin() {
  const alert = useAlert();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  function createConnection(
    url = "https://solana-mainnet.g.alchemy.com/v2/UlhtaPGnQKjcVprRqZU8XlrA3fK4g_Oy"
  ) {
    return new Connection(url, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
  }
  const connection = createConnection();
  const router = useRouter();
  const authenticatedUsers = [
    "CHkSoSiC4ds3N7LkjyonMtdzdoFPZGJ8C9gfen5z2sHN",
    "Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2",
    "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr",
    "3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf",
  ];

  const [refresh, setRefresh]: any = useState(false);
  const [availableMissions, setAvailableMissions]: any = useState([]);
  const [loading, setLoading]: any = useState(false);
  const [alertStatus, setAlertStatus] = useState(["none", "none"]);
  const [authenticatedUser, setAuthenticatedUser]: any = useState(false);

  const writeAPI = async (request: any, signature: any, extraInfo: any) => {
    const requestData = {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: publicKey?.toBase58(),
        request: request,
        signature: signature,
        extraInfo: extraInfo,
      }),
    };
    var response = await fetch("./api/db/write", requestData);

    return response.json();
  };

  const readAPI = async (request: any, extraInfo: any) => {
    const requestData = {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: publicKey?.toBase58(),
        request: request,
        extraInfo: extraInfo,
      }),
    };
    var response = await fetch("./api/db/read", requestData);

    return response.json();
  };

  const RenderContent = () => {
    const [owner, setOwner]: any = useState();
    const [nft, setNFT]: any = useState();
    const [nftAI, setNFTAI]: any = useState();
    const [nftMetadata, setNFTMetadata]: any = useState();
    const [nftAIMetadata, setNFTAIMetadata]: any = useState();
    const [mission, setMission]: any = useState();
    const [time, setTime]: any = useState();

    useEffect(() => {
      const getInfo = async () => {
        const metaplex = new Metaplex(connection);
        if (nft) {
          try {
            if (nft != undefined) {
              console.log(nft);
              const mint: any = new PublicKey(nft);
              const task = metaplex.nfts().findByMint({ mintAddress: mint });
              const nftData = await task.run();
              if (nftData) {
                setNFTMetadata(nftData.json);
              }
            }
          } catch (e) {
            alert.removeAll();
            alert.error("Chimp not found!");
            console.log(e);
          }
        }
        if (nftAI) {
          try {
            if (nftAI != undefined) {
              const mint: any = new PublicKey(nftAI);
              const task = metaplex.nfts().findByMint({ mintAddress: mint });
              const nftData = await task.run();
              if (nftData) {
                setNFTAIMetadata(nftData.json);
              }
            }
          } catch (e) {
            alert.removeAll();
            alert.error("AI Chimp not found!");
            console.log(e);
          }
        }
      };

      getInfo();
    }, [nft, nftAI]);

    useEffect(() => {
      console.log(nftMetadata);
    }, [nftMetadata]);

    const StartMission = () => {
      const [foundMission, setFoundMission]: any = useState();

      useEffect(() => {
        const findMission = async () => {
          const response = await readAPI("checkIfMissionExists", mission);
          if (response) {
            console.log(response);
            setFoundMission(response.info);
          }
        };
        findMission();
      }, []);

      const runStart = async () => {
        alert.removeAll();
        alert.info("Adding mission manually...");

        const day = 86400 * 1000;
        const returnDate = new Date(
          +new Date(time).getTime() + day * +foundMission?.data?.length
        );
        const sidekickReturnDate = new Date(
          +new Date(time).getTime() + day * (+foundMission?.data?.length * 0.95)
        );

        if (foundMission) {
          if (nftAI && nftAI !== "" && nftAI !== null) {
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
                timeSent: new Date(time).getTime(),
              });
            };

            await addManualMission();
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
                timeSent: new Date(time).getTime(),
              });
            };

            await addManualMission();
          }

          alert.removeAll();
          alert.success("Successfully added mission!");
          setOwner("");
          setNFT("");
          setNFTAI("");
          setNFTAIMetadata("");
          setNFTMetadata("");
          setMission("");
          setTime("");
        } else {
          alert.removeAll();
          alert.error("Mission not found!");
        }
      };

      return <button onClick={() => runStart()}>Add Mission</button>;
    };

    const handleInput = (e: any) => {
      var d = new Date();
      var ty = e.target.value;
      var newDate = new Date(d.toString().split(":")[0].slice(0, -2) + ty);
      setTime(newDate);
    };

    return (
      <div className="manual">
        <div className="manualText">
          <h1>Manually Add Mission</h1>
          <h3>
            Only to be used when a user's NFT gets sent but mission did not
            start.
          </h3>
          <h4>
            Enter EXACT values, and get the time the user tried to start the
            mission (can be retrieved via solscan).
          </h4>
        </div>
        <input
          type="text"
          placeholder="Owner wallet address"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <input
          type="text"
          placeholder="Main (Chimp) token address"
          value={nft}
          onChange={(e) => setNFT(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sidekick (AI Chimp) token address (optional)"
          value={nftAI}
          onChange={(e) => setNFTAI(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mission"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
        />
        <input
          type="text"
          placeholder="Time Started IN CST TIME (e.g. November 10, 2022 19:00:04)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <StartMission />
      </div>
    );
  };

  const Login = () => {
    const [email, setEmail]: any = useState();
    const [password, setPassword]: any = useState();

    const signIn = async () => {
      const requestData = {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      };
      var response = await fetch("./api/adventures/signIn", requestData);
      const res = await response.json();
      if (res === "success") {
        alert.removeAll();
        alert.success("Signed in!");
        setAuthenticatedUser(true);
      } else {
        alert.removeAll();
        alert.error("Not authorized!");
        setAuthenticatedUser(false);
      }
    };

    return (
      <div className="adminLogin">
        <input
          type="email"
          alt="Email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          alt="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => signIn()}>Log In</button>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Adventures Fix | Time Traveling Chimps Club</title>
        <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
        <meta property="og:url" content="/" />
        <meta
          property="og:title"
          content="Adventures Fix | Time Traveling Chimps Club"
        />
        <meta
          property="og:description"
          content="Community managed derug | 100% Royalties to the DAO | Non-Derivative art | Nostalgic traits"
        />
        <meta property="og:image" content="/banner.png" />
        <meta
          name="twitter:title"
          content="Adventures | Time Traveling Chimps Club"
        />
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
            <button
              onClick={() => router.push("/")}
              style={{ background: "#FFFFFF", color: "#B7B7B7" }}
              className="bigButtons"
            >
              Back to Home
            </button>
          </div>

          <div className="flex">
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
