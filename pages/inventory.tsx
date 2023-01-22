import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Router, useRouter } from "next/router";
import { useAlert } from "react-alert";
import { useRecoilState } from "recoil";
import { storeItemsState } from "../scripts/atoms";
import { useEffect, useState } from "react";
import axios from "axios";
import { BiImageAdd } from "react-icons/bi";
import Head from "next/head";
import { writeAPI } from "../scripts";
import { programs } from "@metaplex/js";
import { Connection } from "@solana/web3.js";
const {
  metadata: { Metadata },
} = programs;

export default function Admin() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const connection = new Connection(
    "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
    { commitment: "processed", confirmTransactionInitialTimeout: 60000 }
  );
  const alert = useAlert();
  const router = useRouter();

  const [loading, setLoading]: any = useState(false);

  const [storeItems, setStoreItems] = useRecoilState(storeItemsState);

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

  const AddTraitItems = () => {
    const IndivItem = ({ item, index }: { item: any; index: any }) => {
      const [hashlist, setHashlist]: any = useState(item?.data?.hashlist);
      const [metadata, setMetadata]: any = useState(item?.data?.metadata);
      const [cost, setCost]: any = useState(item?.data?.cost);
      const [costSOL, setCostSOL]: any = useState(item?.data?.costSOL);
      const [quantity, setQuantity]: any = useState(item?.data?.quantity);
      const [available, setAvailable]: any = useState(item?.data?.available);

      const [edit, setEdit]: any = useState(false);

      const editItem = async () => {
        await writeAPI(publicKey?.toBase58()!, "updateTrait", null, {
          costSOL: +costSOL,
          cost: +cost,
          quantity: quantity,
          metadata: item?.data?.metadata,
          hashlist: item?.data?.hashlist,
          available: available,

          item: item.id,
        });
        const filteredItems = storeItems.filter((o: any) => {
          return o.id !== item.id;
        });
        setStoreItems([
          ...filteredItems,
          {
            id: item.id,
            data: {
              cost: +cost,
              costSOL: +costSOL,
              metadata: item?.data?.metadata,
              hashlist: item?.data?.hashlist,
              quantity: quantity,
              available: available,
            },
          },
        ]);
        setCost(0);
        setCostSOL(0);
        setEdit(false);
      };

      const DeleteButton = () => {
        const [text, setText]: any = useState("Delete");
        let id = text;
        const deleteItem = async () => {
          if (text === "Delete") {
            setText("ConfirmDelete");
          } else {
            await writeAPI(
              publicKey?.toBase58()!,
              "deleteTrait",
              null,
              item.id
            );
            const filteredItems = storeItems.filter((o: any) => {
              return o.id !== item.id;
            });
            setStoreItems([...filteredItems]);
          }
        };

        return (
          <button id={id} onClick={() => deleteItem()}>
            {text}
          </button>
        );
      };

      if (!edit) {
        return (
          <div className="itemBoxes">
            <div id="editView" className="row">
              <img
                src={JSON.parse(item.data.metadata).image}
                height="250"
                width="250"
              />
              <div className="itemBoxInner">
                {/* <div><h1>* Hashlist (JSON Array):</h1><textarea value={hashlist} disabled /></div>
                                <div><h1>* Metadata (JSON Object):</h1><textarea value={metadata} disabled /></div> */}
                <h1>
                  Trait Type:{" "}
                  <b>
                    {JSON.parse(item.data.metadata).attributes[0].trait_type}
                  </b>
                  Value:{" "}
                  <b>{JSON.parse(item.data.metadata).attributes[0].value}</b>
                </h1>
                {/* <h1>Image: <b>{JSON.parse(item.data.metadata).image}</b></h1> */}
                <h1>
                  SPL Cost: <b>{item?.data?.cost}</b>
                  SOL Cost: <b>{item?.data?.costSOL}</b>
                  Quantity: <b>{item?.data?.quantity}</b>
                  Available:{" "}
                  <b>{item?.data?.available === true ? "yes" : "no"}</b>
                </h1>
              </div>
            </div>
            <button className="editButton" onClick={() => setEdit(true)}>
              Edit Trait
            </button>
          </div>
        );
      } else {
        return (
          <div className="itemBoxes">
            <div className="row">
              {/* <img
                src={JSON.parse(item.data.metadata).image}
                height="50"
                width="50"
              /> */}
              <div className="itemBoxInner">
                <h1>
                  Trait Type:{" "}
                  <b>
                    {JSON.parse(item.data.metadata).attributes[0].trait_type}
                  </b>
                </h1>
                <h1>
                  Value:{" "}
                  <b>{JSON.parse(item.data.metadata).attributes[0].value}</b>
                </h1>
                <div>
                  <textarea
                    value={hashlist}
                    onChange={(e) => setHashlist(e.target.value)}
                  />
                </div>
                {/* <div>
                  <h1>* Metadata (JSON Object):</h1>
                  <textarea
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                  />
                </div> */}

                {/* <h1>Image: <b>{JSON.parse(item.data.metadata).image}</b></h1> */}
                <div>
                  <h1>SPL Price:</h1>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(+e.target.value)}
                  />{" "}
                </div>
                <div>
                  <h1>SOL Price:</h1>
                  <input
                    type="number"
                    value={costSOL}
                    onChange={(e) => setCostSOL(+e.target.value)}
                  />
                </div>
                <div>
                  <h1>Quantity:</h1>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                  />
                  <h1>Available:</h1>

                  <input
                    style={{ width: "fit-content" }}
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(!available)}
                  />
                </div>
              </div>
            </div>
            <button className="confirmButton" onClick={() => editItem()}>
              Confirm Update
            </button>
            <DeleteButton />
          </div>
        );
      }
    };

    const AddItem = () => {
      const [hashlist, setHashlist]: any = useState();
      const [metadata, setMetadata]: any = useState();
      const [cost, setCost]: any = useState(0);
      const [costSOL, setCostSOL]: any = useState(0);
      const [quantity, setQuantity]: any = useState(0);
      const [available, setAvailable]: any = useState(false);

      useEffect(() => {
        const getMetadataForOne = async (nft: any) => {
          try {
            const metadataPDA = await Metadata.getPDA(nft);
            const onchainMetadata = (
              await Metadata.load(connection, metadataPDA)
            ).data;
            const externalMetadata = (await axios.get(onchainMetadata.data.uri))
              .data;
            setMetadata(JSON.stringify(externalMetadata));
          } catch (e) {
            //console.log(`failed to pull metadata for token ${nft}`);
          }
        };
        if (hashlist) {
          try {
            if (Array.isArray(JSON.parse(hashlist))) {
              getMetadataForOne(JSON.parse(hashlist)[0]);
            }
          } catch (e) {
            //console.log(e);
          }
        }
      }, [hashlist]);

      const submitItem = async () => {
        const newTraitDocID = await writeAPI(
          publicKey?.toBase58()!,
          "addTrait",
          null,
          {
            costSOL: +costSOL,
            cost: +cost,
            metadata: metadata,
            hashlist: hashlist,
            quantity: quantity,
            available: available,
          }
        );

        if (newTraitDocID) {
          setStoreItems([
            ...storeItems,
            {
              id: newTraitDocID.info,
              data: {
                costSOL: +costSOL,
                cost: +cost,
                metadata: metadata,
                hashlist: hashlist,
                quantity: quantity,
                available: available,
              },
            },
          ]);
          setHashlist();
          setMetadata();
          setQuantity(0);
          setCost(0);
          setCostSOL(0);
          setLoading(false);
          setAvailable(false);
        }
      };

      return (
        <div className="itemBox">
          <div className="row">
            <img
              src={
                metadata
                  ? JSON.parse(metadata).image
                  : "/images/placeholder.png"
              }
              height="50"
              width="50"
            />
            <div className="itemBoxInner">
              <div>
                <h1>Hashlist:</h1>
                <textarea
                  value={hashlist}
                  onChange={(e) => setHashlist(e.target.value)}
                />
              </div>
              {/* <div>
                <h1>Metadata:</h1>
                <textarea
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                />
              </div> */}
              <div>
                <h1>SPL Cost:</h1>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(+e.target.value)}
                />

                <h1>SOL Cost:</h1>
                <input
                  type="number"
                  value={costSOL}
                  onChange={(e) => setCostSOL(+e.target.value)}
                />

                <h1>Quantity:</h1>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(+e.target.value)}
                />

                <h1>For Sale?</h1>
                <input
                  style={{ width: "fit-content" }}
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(!available)}
                />
              </div>
            </div>
          </div>
          <button className="addButton" onClick={() => submitItem()}>
            Add Item
          </button>
        </div>
      );
    };

    // const EditHashlist = () => {
    //     const [edit, setEdit]: any = useState(false)
    //     const [hashlist, setHashlist]: any = useState(smoothiesHashlist)

    //     const confirmChange = async() => {
    //         await writeAPI(publicKey?.toBase58()!, "editHashlist", null, hashlist)
    //         setSmoothiesHashlist(hashlist)
    //     }

    //     return (
    //         <>
    //             <button onClick={() => setEdit(!edit)} className="editSmoothie">Edit Smoothie Hashlist</button>
    //             {edit && (
    //                 <>
    //                     <div className="itemBox">
    //                         <div className="row">
    //                             <div className="itemBoxInner">
    //                                 <div><h1>* Hashlist (JSON Array):</h1><textarea value={hashlist} onChange={(e) => setHashlist(e.target.value)} /></div>
    //                             </div>
    //                         </div>
    //                         <button onClick={() => confirmChange()}>Confirm</button>
    //                     </div>
    //                 </>
    //             )}
    //         </>
    //     )
    // }

    return (
      <>
        <div className="addTraitItems">
          {/* <EditHashlist /> */}
          <h1 style={{ color: "#fff" }} className="traitTitle">
            Add Item
          </h1>
          <AddItem />
          <h1 style={{ color: "#fff" }} className="traitTitle">
            Edit Items
          </h1>
          <div className="traitGrid">
            {storeItems.map((item, index) => {
              return (
                <IndivItem key={item + index + 3} item={item} index={index} />
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Inventory Panel | TTCC </title>
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
  
      </Head>
      <div className="container">
        <div className="mainScreen">
          <div className="navbar">
            <div className="navButtons">
              {publicKey ? (
                <>
                  <button
                    className={
                      router.pathname === "/"
                        ? "navButton activeNav"
                        : "navButton inactiveNav"
                    }
                    onClick={() => router.push("/")}
                  >
                    Home
                  </button>
                </>
              ) : null}
              <WalletMultiButton />
            </div>
          </div>

          {!publicKey ? (
            <div className="addTrait">
              <WalletMultiButton />
            </div>
          ) : authorized.includes(publicKey.toBase58()) ? (
            <div className="addTrait">
              <AddTraitItems />
            </div>
          ) : (
            <div className="addTrait">
              <h1 style={{ color: "#fff" }}>Not authorized</h1>
            </div>
          )}
        </div>
        {loading !== false && (
          <div className="loading">
            Adding hashlist to database... {loading}
          </div>
        )}
      </div>
    </>
  );
}
