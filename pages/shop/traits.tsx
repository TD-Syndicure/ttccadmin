import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "../../node_modules/@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAlert } from "react-alert";
import { useRecoilState, waitForAll } from "recoil";
import {
  loadingState,
  selectedState,
  storeItemsState,
  tokenBalanceState,
  userTraitsState,
  paymentOptionState,
} from "../../scripts/atoms";
import { writeAPI } from "../../scripts";
import { connectFirestoreEmulator, increment } from "firebase/firestore";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function Shop() {
  const router = useRouter();
  const { publicKey, signTransaction, sendTransaction, disconnect } =
    useWallet();
  function createConnection(
    url = "https://solana-mainnet.g.alchemy.com/v2/UlhtaPGnQKjcVprRqZU8XlrA3fK4g_Oy"
  ) {
    return new Connection(url, {
      commitment: "processed",
      confirmTransactionInitialTimeout: 60000,
    });
  }
  const connection = createConnection();

  const alert = useAlert();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [storeItems, setStoreItems] = useRecoilState(storeItemsState);
  const [userTraits, setUserTraits] = useRecoilState(userTraitsState);
  const [tokenBalance, setTokenBalance] = useRecoilState(tokenBalanceState);
  //console.log(storeItems);
  const wait = (ms: any) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const ShowNFTs = () => {
    const [paymentOption, setPaymentOption]: any = useState("pltmx");

    const [category, setCategory] = useState("All");
    const [type, setType] = useState();

    // const [categories, setCategories]: any = useState([])

    //const [selected, setSelected]: any = useState()

    // storeItems.forEach((item) => {
    //     const localItem = JSON.parse(item.data.metadata)
    //     if (!categories.includes(localItem.attributes[0].trait_type)) {
    //         setCategories([...categories, localItem.attributes[0].trait_type])
    //     }
    // })

    const paginate = (array: any, pageSize: any, pageNumber: any) => {
      return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    };

    const NFTContainer = ({ item, index }: { item: any; index: any }) => {
      const [selected, setSelected] = useRecoilState(selectedState);

      if (item.data.quantity === 0) {
        return (
          <div
            key={item + index}
            className={
              selected === item
                ? "indivNFT activeNFT soldOut"
                : "indivNFT inactiveNFT soldOut"
            }
          >
            <div className="soldOutInner">
              <h1>SOLD OUT!</h1>
            </div>

            <img src={JSON.parse(item.data.metadata).image} alt="nft" />

            <div className="extraInfo">
              <h3>
                {JSON.parse(item.data.metadata).attributes[0].trait_type}:{" "}
                {JSON.parse(item.data.metadata).attributes[0].value}
              </h3>
            </div>
            <div className="remainingNum">{item.data.quantity}</div>
          </div>
        );
      } else {
        return (
          <div
            key={item + index}
            onClick={() =>
              selected === item ? setSelected(null) : setSelected(item)
            }
            className={
              selected === item ? "indivNFT activeNFT" : "indivNFT inactiveNFT"
            }
          >
            <Zoom>
              <img src={JSON.parse(item.data.metadata).image} alt="nft" />{" "}
            </Zoom>
            <div className="extraInfo">
              <h3>
                {JSON.parse(item.data.metadata).attributes[0].trait_type}:{" "}
                {JSON.parse(item.data.metadata).attributes[0].value}
              </h3>
            </div>
            <div className="remainingNum">{item.data.quantity}</div>
          </div>
        );
      }
    };

    const Traits = () => {
      return (
        <>
          <div className="userTraits">
            {storeItems
              .filter((item: any) => {
                if (
                  category &&
                  item.data.available &&
                  JSON.parse(item.data.metadata)?.attributes[0]?.trait_type !=
                    type
                ) {
                  if (category === "All") {
                    return true;
                  } else {
                    return (
                      category ===
                      JSON.parse(item.data.metadata).attributes[0].trait_type
                    );
                  }
                }
              })
              .map((nft, index) => {
                return (
                  <NFTContainer item={nft} index={index} key={nft + index} />
                );
              })}
          </div>
        </>
      );
    };

    const categories = [
      "All",
      "Background",
      "Fur",
      "Eyes",
      "Clothing",
      "Headwear",
      "Eyewear",
      "Neck",
      "Mouth",
      "Accessory",
    ];

    const BuyButton = () => {
      const [selected, setSelected] = useRecoilState(selectedState);
      const [buying, setBuying] = useState<boolean>(false);

      const buyItem = async () => {
        if (!publicKey) {
          alert.removeAll();
          alert.info(`Wallet not connected!`);
          return;
        }

        if (
          paymentOption === "sol"
            ? tokenBalance.sol < +selected.data.costSOL
            : tokenBalance.pltmx < +selected.data.cost
        ) {
          alert.removeAll();
          alert.info(
            `Not enough ${paymentOption === "sol" ? "SOL" : "$PLTMX"}!`
          );
        } else {
          alert.removeAll();
          alert.info("Fetching item...");

          const confirmAPI = async (signature: any, extraInfo: any) => {
            const requestData = {
              method: "POST",
              header: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                publicKey: publicKey?.toBase58(),
                signature: signature,
                extraInfo: extraInfo,
              }),
            };
            var response = await fetch("./api/store/confirm", requestData);

            return response.json();
          };

          const send = async (mint: any, trait: any, paymentType: any) => {
            const requestData = {
              method: "POST",
              header: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                publicKey: publicKey?.toBase58(),
                nft: mint,
                trait: trait,
                paymentType: paymentType,
              }),
            };
            var response = await fetch("./api/store/send", requestData);

            return response.json();
          };

          const fetchNFTs = async () => {
            const devWalletNFTs = new PublicKey(
              "Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2"
            ); //Trait wallet
            // will get all spl token accounts for the connected wallet
            const getTokenAccounts = async () => {
              const tokenAccounts =
                await connection.getParsedTokenAccountsByOwner(devWalletNFTs!, {
                  programId: TOKEN_PROGRAM_ID,
                });
              return tokenAccounts;
            };
            // will get all spl token accounts for the connected wallet where the spl token amount is 1
            const parseTokenAccounts = async () => {
              const tokenAccounts = await getTokenAccounts();
              const parsedTokenAccounts = tokenAccounts.value.filter(
                (tokenAccount) =>
                  tokenAccount.account.data.parsed.info.tokenAmount.amount ===
                  "1"
              );
              return parsedTokenAccounts;
            };
            // will return token mints for the parsed token accounts
            const getTokenMints = async () => {
              const parsedTokenAccounts = await parseTokenAccounts();
              const tokenMints = parsedTokenAccounts.map((tokenAccount) => {
                return tokenAccount.account.data.parsed.info.mint;
              });
              return tokenMints;
            };
            const tokenMints = await getTokenMints();
            return tokenMints;
          };
          const intialize = async () => {
            const tokenMints = await fetchNFTs();
            if (tokenMints && tokenMints.length === 0) {
              //console.log("sorry! all out of nfts. come back later");
            } else {
              /* for single collection */
              let acceptedNFTs: any = [];
              let localIndex = 0;
              storeItems.forEach((storeItem) => {
                if (storeItem.data === selected.data) {
                  tokenMints.forEach((mint) => {
                    let hashlist = JSON.parse(storeItem.data.hashlist);
                    hashlist.forEach((item) => {
                      if (item === mint) {
                        acceptedNFTs.push(item);
                      }
                    });
                    localIndex++;
                  });
                }
              });

              if (localIndex === tokenMints.length) {
                return acceptedNFTs;
              }
            }
          };
          await intialize().then(async (res) => {
            if (res.length === 0) {
              alert.removeAll();
              alert.error("Sold out!");
            } else {
              alert.removeAll();
              alert.info("Fetching transaction...");
              try {
                const randomNFT = res[Math.floor(Math.random() * res.length)];

                const response = await send(
                  randomNFT,
                  selected.id,
                  paymentOption
                );

                if (response?.info !== "failed") {
                  alert.removeAll();
                  alert.info("Confirm transaction...");
                  let signed = await signTransaction?.(
                    Transaction.from(response?.info?.data)
                  );
                  let signature = await connection.sendRawTransaction(
                    signed?.serialize()!
                  );

                  if (signature) {
                    alert.removeAll();
                    alert.info("Confirming transaction...");
                    const confirmed = await confirmAPI(signature, {
                      id: selected.id,
                      quantity: selected.data.quantity - 1,
                    });
                    if (confirmed.info === "success") {
                      alert.removeAll();
                      alert.success("Success!");
                      let newUserTraits = [
                        ...userTraits,
                        {
                          metadata: JSON.parse(selected.data.metadata),
                          mint: randomNFT,
                        },
                      ];
                      setUserTraits(newUserTraits);
                      const filteredItems = [...storeItems].filter((o: any) => {
                        return o.id !== selected.id;
                      });
                      setStoreItems([
                        ...filteredItems,
                        {
                          id: selected.id,
                          data: {
                            cost: +selected.data.cost,
                            costSOL: +selected.data.costSOL,
                            metadata: selected?.data?.metadata,
                            hashlist: selected?.data?.hashlist,
                            quantity: selected.data.quantity - 1,
                            available: selected.data.available,
                          },
                        },
                      ]);
                    } else {
                      alert.removeAll();
                      alert.error("Something went wrong.");
                    }
                  }
                } else {
                  alert.removeAll();
                  alert.error("Something went wrong.");
                }
              } catch (e) {
                //console.log(e);
                alert.removeAll();
                alert.error("Something went wrong.");
              }
            }
          });
        }
      };
      return (
        <div
          className={
            !selected
              ? "shopPurchase noneSelected"
              : "shopPurchase itemsSelected"
          }
        >
          <button
            disabled={!selected || buying}
            onClick={async () => {
              setBuying(true);
              await buyItem().catch((e) => {
                alert.removeAll();
                alert.error("Uh oh! Something went wrong. Please try again.");
                //console.log(e);
              });
              setBuying(false);
            }}
          >
            Purchase for{" "}
            {paymentOption === "sol"
              ? selected?.data?.costSOL ?? 0
              : selected?.data?.cost ?? 0}{" "}
            {paymentOption === "sol" ? "SOL" : "PLTMX"}
          </button>
          <div className="paymentOptions">
            {selected?.data?.cost !== 0 ? (
              <div
                className={
                  paymentOption === "pltmx"
                    ? "paymentOption activePay"
                    : "paymentOption"
                }
                onClick={() => setPaymentOption("pltmx")}
              >
                <img src="/images/pltmx.png" alt="pltmx" />
              </div>
            ) : (
              setPaymentOption("sol")
            )}{" "}
            {selected?.data?.costSOL !== 0 ? (
              <div
                className={
                  paymentOption === "sol"
                    ? "paymentOption activePay"
                    : "paymentOption"
                }
                onClick={() => setPaymentOption("sol")}
              >
                <img src="/images/sol.png" alt="sol" />
              </div>
            ) : (
              setPaymentOption("pltmx")
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="shopTraitsWrapper">
        {/* <div className="userTraitsWrapper">
          <div className="flex" style={{ flexWrap: "nowrap" }}></div>
        </div> */}
        <div className="midTraitsSection lg:w-[1200px]">
          <div className="flex">
            {categories.map((item, index) => {
              return (
                <h3
                  key={item + index + 1}
                  onClick={() => setCategory(item)}
                  className={
                    category === item ? "activeCategory" : "inactiveCategory"
                  }
                >
                  {item}
                </h3>
              );
            })}
          </div>
          <Traits />
        </div>
        <div className="shopPurchaseWrapper w-[1200px]" style={{ marginBottom: "12px" }}>
          <BuyButton />
        </div>
      </div>
    );
  };

  const HandleShopScreen = () => {
    return <ShowNFTs />;
  };

  return (
    <>
      <Head>
        <title>Shop | TTCC</title>
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
        <meta property="og:url" content="/" />
        <meta property="og:title" content="Shop | TTCC" />
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
      <div className="container shopScreen ">
        <div className="mainScreen">
          <div className="shop xs:backdrop-blur-md md:backdrop-blur-sm">
            {publicKey ? (
              <>
                {" "}
                <h1 style={{ color: "#7cfdad " }}>SHOP</h1>
                <h2 style={{ color: "#fff" }}>
                  Buy attributes to upgrade your Chimp
                </h2>
                {loading ? (
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
                      stroke="#9D45F5"
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
                ) : (
                  <>
                    <HandleShopScreen />
                  </>
                )}{" "}
              </>
            ) : (
              <div className="homeWrapper xs:backdrop-blur-md md:backdrop-blur-sm">
                <h1>
                  Time Traveling <b>Trait Shop</b>
                </h1>
                <h2>
                  Missed some traits on adventures? Get all your exclusive TTCC
                  merch here!
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
