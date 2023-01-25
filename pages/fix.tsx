import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { generateDownload } from "../scripts/cropImage";
import { useAlert } from "react-alert";
import axios from "axios";
import {
  uploadIMG,
  uploadJSON,
  updateMetadata,
  adminUpdate,
  toDataURL,
} from "../scripts";
//const Wallet = require('@project-serum/anchor')
import * as anchor from "@project-serum/anchor";
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts,
} from "@metaplex-foundation/mpl-token-metadata";
// import { Metaplex } from "@metaplex-foundation/js";
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
import bs58 from "bs58";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Marquee from "react-fast-marquee";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  loadingState,
  storeItemsState,
  userNFTsState,
  userTraitsState,
  videoPlayingState,
} from "../scripts/atoms";
import { Router, useRouter } from "next/router";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";

export default function Admin() {
  const router = useRouter();

  function createConnection(
    url = "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/"
  ) {
    return new Connection(url, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
  }
  const connection = createConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const alert = useAlert();

  const authorized = [
    "CHkSoSiC4ds3N7LkjyonMtdzdoFPZGJ8C9gfen5z2sHN",
    "Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2",
    "| TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr",
    "3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf",
    "| TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "Hh3dehjrQ7gXiipcewCWnWZZHpW5rA9gwBs7Aosno3B5",
    "5hopvnJPJpriQVmGuhEoAsAZVh9zK9LxSf7UjMnpPF9",
  ];

  const [newTrait, setNewTrait]: any = useState();
  const [userMetadata, setUserMetadata]: any = useState();
  const [storeItems, setStoreItems] = useRecoilState(storeItemsState);

  const [localNFT, setLocalNFT]: any = useState("/images/placeholder.png");

  //use these values when everything is finally uploaded to arweave and blockchain
  const [finishedMetadataURI, setFinishedMetadataURI]: any = useState(null);
  const [finishedMetadataObj, setFinishedMetadataObj]: any = useState(null);

  const [localMetadata, setLocalMetadata]: any = useState();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [loadingNewNFT, setLoadingNewNFT] = useState(false);
  const [findingNFT, setFindingNFT]: any = useState(false);

  const resetStates = () => {
    setUserMetadata();
    setLocalNFT("/images/placeholder.png");
    setNewTrait();
    setFinishedMetadataURI(null);
    setFinishedMetadataObj(null);
    setLoadingNewNFT(false);
  };

  useEffect(() => {
    const renderUpdatedImage = async (type2: any) => {
      setLoadingNewNFT(true);
      let currentImageArray = [];
      let i = 0;
      if (userMetadata.metadata.attributes[0].trait_type === "Iconic") {
        for (const attributeType of userMetadata.metadata.attributes) {
          await toDataURL(
            `/attributes/ttcc/${encodeURI(
              attributeType.trait_type
            )}/${encodeURI(attributeType.value)}.png`,
            function (dataUrl) {
              currentImageArray.push(dataUrl);
            }
          );
        }
      } else {
        for (const attributeType of userMetadata.metadata.attributes) {
          try {
            if (type2 === "enraged") {
              if (
                attributeType.value !== "Sensitek" &&
                attributeType.trait_type !== "Gaming Headset"
              ) {
                if (
                  attributeType.trait_type === "Eyewear" ||
                  attributeType.trait_type === "Eye Wear"
                ) {
                  await toDataURL(
                    `/attributes/ttcc/${encodeURI("Eyewear")}/${encodeURI(
                      attributeType.value
                    )}.png`,
                    function (dataUrl) {
                      currentImageArray.push(dataUrl);
                    }
                  );
                } else if (
                  attributeType.trait_type === "Earring" ||
                  attributeType.trait_type === "Ear Ring" ||
                  attributeType.trait_type === "Ear ring"
                ) {
                  await toDataURL(
                    `/attributes/ttcc/Earring/${encodeURI(
                      attributeType.value
                    )}.png`,
                    function (dataUrl) {
                      currentImageArray.push(dataUrl);
                    }
                  );
                } else {
                  await toDataURL(
                    `/attributes/ttcc/${encodeURI(
                      attributeType.trait_type
                    )}/${encodeURI(attributeType.value)}.png`,
                    function (dataUrl) {
                      currentImageArray.push(dataUrl);
                    }
                  );
                }
              }
            } else {
              if (
                attributeType.trait_type === "Eyewear" ||
                attributeType.trait_type === "Eye Wear"
              ) {
                await toDataURL(
                  `/attributes/ttcc/${encodeURI("Eyewear")}/${encodeURI(
                    attributeType.value
                  )}.png`,
                  function (dataUrl) {
                    currentImageArray.push(dataUrl);
                  }
                );
              } else if (attributeType.trait_type === "Gaming Headset") {
                await toDataURL(
                  `/attributes/ttcc/Headwear/${encodeURI(
                    attributeType.value
                  )}.png`,
                  function (dataUrl) {
                    currentImageArray.push(dataUrl);
                  }
                );
              } else {
                await toDataURL(
                  `/attributes/ttcc/${encodeURI(
                    attributeType.trait_type
                  )}/${encodeURI(attributeType.value)}.png`,
                  function (dataUrl) {
                    currentImageArray.push(dataUrl);
                  }
                );
              }
            }
          } catch {
            for (const item of storeItems) {
              if (
                JSON.parse(
                  item.data.metadata
                ).attributes[0].trait_type.toLowerCase() ===
                  attributeType.trait_type.toLowerCase() &&
                JSON.parse(
                  item.data.metadata
                ).attributes[0].value.toLowerCase() ===
                  attributeType.value.toLowerCase()
              ) {
                await toDataURL(
                  JSON.parse(item.data.metadata).image,
                  function (dataUrl) {
                    currentImageArray.push(dataUrl);
                  }
                );
              }
            }
          }

          i++;
        }
      }
      generateDownload(currentImageArray).then((base64image) => {
        setLocalNFT(base64image);
        setLoadingNewNFT(false);
        // console.log("RAN THIS HERE!")
      });
    };

    if (userMetadata) {
      const enraged = userMetadata.metadata.attributes.some((o: any) => {
        if (
          JSON.stringify(o) ===
          JSON.stringify({ trait_type: "Version", value: "Enraged" })
        ) {
          return true;
        }
      });
      setLoadingNewNFT(true);
      renderUpdatedImage(enraged ? "enraged" : "fractured");
    }
  }, [userMetadata]);

  const getNewMetadata = () => {
    let currentImageArray = [];
    let i = 0;

    // console.log(userMetadata.metadata.attributes)

    if (userMetadata.metadata.attributes[0].trait_type === "Iconic") {
      currentImageArray.push(userMetadata.metadata.attributes[0]);
      currentImageArray.push(userMetadata.metadata.attributes[1]);
      currentImageArray.push({ trait_type: "Version", value: "Enraged" });
    } else {
      for (const attributeType of userMetadata.metadata.attributes) {
        currentImageArray.push(attributeType);

        i++;
      }
    }

    return currentImageArray;
  };

  const changeMetadata1 = async () => {
    alert.removeAll();
    alert.info("Uploading metadata...");

    const enraged = userMetadata.metadata.attributes.some((o: any) => {
      if (
        JSON.stringify(o) ===
        JSON.stringify({ trait_type: "Version", value: "Enraged" })
      ) {
        return true;
      }
    });

    //uploads image to arweave
    const response = await uploadIMG(
      localNFT.substring(22),
      userMetadata,
      [],
      enraged
    );

    if (response.image) {
      return response;
    } else {
      alert.removeAll();
      alert.error("Something went wrong uploading your new metadata!");
      return "fail";
    }
  };

  const changeMetadata2 = async (signature: any, response: any) => {
    let localMetadata = {
      ...userMetadata.metadata,
      attributes: getNewMetadata(),
      image: response.image,
      properties: {
        creators: userMetadata.creators,
        files: [{ uri: response.image, type: "image/png" }],
      },
    };

    console.log("new metadata url: " + response.json);
    await adminUpdate(null, response.json, userMetadata.mint, userMetadata, []);
  };

  const changeMetadata = async () => {
    const info = await changeMetadata1();

    if (info !== "fail") {
      await changeMetadata2(null, info);
      alert.removeAll();
      alert.success(
        "Successfully upgraded! Please allow the blockchain a few minutes to reflect changes..."
      );
      // console.log("Done! Metadata successfully upgraded.")
      resetStates();
    }
  };

  const FetchNFT = () => {
    const [address, setAddress]: any = useState();

    const handleFindNFT = async () => {
      const metaplex = new Metaplex(connection);
      try {
        if (address != undefined) {
          setFindingNFT(true);
          const mint: any = new PublicKey(address);

          const task = metaplex.nfts().findByMint({ mintAddress: mint });
          const nftData = await task.run();

          // console.log(nftData)

          setUserMetadata({
            creators: nftData.creators,
            metadata: nftData.json,
            mint: nftData.mint.address.toBase58(),
            collection: nftData.collection,
          });

          setFindingNFT(false);
        }
      } catch (e) {
        setFindingNFT("failed");
        console.log(e);
      }
    };

    const UpgradeBTN = () => {
      const [sure, setSure]: any = useState(false);

      return (
        <button
          onClick={() =>
            sure ? (userMetadata ? changeMetadata() : null) : setSure(true)
          }
          disabled={!userMetadata}
        >
          {!sure ? "Repair Chimp" : "Are you sure?"}
        </button>
      );
    };

    return (
      <>
        <h1>Repair User Metadata</h1>
        <h2>
          This will regenerate a broken image, only if the metadata is still
          correct.
        </h2>
        <input
          type="text"
          placeholder="NFT token address"
          onChange={(e) => setAddress(e.target.value)}
        />
        <button onClick={() => handleFindNFT()}>Find NFT</button>
        {findingNFT === "failed" && <h2>NFT not found.</h2>}
        <div
          className={
            userMetadata && newTrait
              ? "upgradedNFT eligibleNFT"
              : "upgradedNFT ineligibleNFT"
          }
        >
          {loadingNewNFT ? (
            <div className="spinner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                style={{
                  margin: "100px 0",
                  background: "rgba(241, 242, 243, 0)",
                  display: "block",
                  shapeRendering: "auto",
                }}
                width="50px"
                height="50px"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
              >
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  stroke="#45f5a1"
                  strokeWidth="10"
                  r="35"
                  strokeDasharray="164.93361431346415 56.97787143782138"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    repeatCount="indefinite"
                    dur="1s"
                    values="0 50 50;360 50 50"
                    keyTimes="0;1"
                  ></animateTransform>
                </circle>
              </svg>
            </div>
          ) : null}
          <img src={localNFT} />
          <UpgradeBTN />
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Fix Chimp | FAPE </title>
        <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
      </Head>
      <div className="container">
        <div className={styles.main}>
        <div className="navbar">
        {publicKey ? (
                <div className="mr-2">
                    <div className="selectSession">
                        <button onClick={() => router.push('/')} style={{ background: '#FFFFFF', color: '#B7B7B7' }} className="bigButtons">Back to Home</button>
                    </div>
                </div>
              ) : null}
          <div className="flex">
            <WalletMultiButton />
          </div>
        </div>

          <div className="adminPanel">
            {authorized.includes(publicKey?.toBase58()) ? (
              <FetchNFT />
            ) : (
              <h1>Not authorized.</h1>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
