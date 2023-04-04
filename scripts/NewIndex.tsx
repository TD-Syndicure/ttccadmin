import { Metaplex, token } from "@metaplex-foundation/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  aiState,
  loadingState,
  cdpHashlistState,
  cdpState,
  storeItemsState,
  tokenBalanceState,
  userNFTsState,
  userTraitsState,
  deviceState,
} from "./atoms";
import { findFarmerPDA, stringifyPKsAndBNs } from "@gemworks/gem-farm-ts";
import { readAPI } from ".";
import { getNFTsByOwner } from "./helpers";
import { getAssociatedTokenAddress } from "../node_modules/@solana/spl-token";
import Layout from "../Components/layout/Layout";

const NewIndex = ({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) => {
  const router = useRouter();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  function createConnection(
    url = "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/"
  ) {
    return new Connection(url, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
  }
  const connection = createConnection();

  const [userNFTs, setUserNFTs] = useRecoilState(userNFTsState);
  const [userTraits, setUserTraits] = useRecoilState(userTraitsState);
  const [cdp, setCDP] = useRecoilState(cdpState);
  const [ai, setAI] = useRecoilState(aiState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [storeItems, setStoreItems] = useRecoilState(storeItemsState);
  const [tokenBalance, setTokenBalance] = useRecoilState(tokenBalanceState);
  const [cdpHashlist, setCDPHashlist] = useRecoilState(cdpHashlistState);
  const [device, setDevice] = useRecoilState(deviceState);

  // console.log(ai)
  useEffect(() => {
    const getItems = async () => {
      const cdpHash = await readAPI(
        publicKey?.toBase58()!,
        "getCDPHashlist",
        null
      );
      setCDPHashlist(JSON.parse(cdpHash.info));

      const allTraits = await readAPI(publicKey?.toBase58()!, "getItems", null);
      setStoreItems(allTraits.info);
    };
    getItems();
  }, []);

  useEffect(() => {
    const getBalance = async () => {
      const mint = new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY");
      if (!publicKey) {
        setTokenBalance({ sol: 0, pltmx: 0 });
      } else {
        try {
          let user = await getAssociatedTokenAddress(mint, publicKey);
          const userBal = new PublicKey(user);
          const tok = await connection
            .getTokenAccountBalance(userBal)
            .catch((e) => console.log(e));
          const solbal = await connection.getBalance(publicKey);
          setTokenBalance({
            sol: +solbal / 1000000000,
            pltmx: tok ? +tok.value.amount / 1000000000 : 0,
          });
          //console.log({sol: +(solbal)/1000000000, pltmx: tok ? +(tok.value.amount)/1000000000 : 0})
        } catch (error) {
          setTokenBalance({ sol: 0, pltmx: 0 });
          console.log(error);
        }
      }
    };
    const getAllNFTs = async () => {
      setLoading(true);
      const all = await getNFTsByOwner(
        publicKey,
        connection,
        storeItems,
        cdp,
        ai,
        device
      );
      console.log(all);
      setUserNFTs(all.nfts);
      setUserTraits(all.traits);
      setCDP(all.cdp);
      setAI(all.ais);
      setDevice(all.device);
      setLoading(false);
    };
    if (publicKey && storeItems.length > 0 && cdpHashlist.length > 0) {
      getAllNFTs();
      getBalance();
    } else {
      setUserTraits([]);
      setUserNFTs([]);
      setCDP([]);
      setAI([]);
      setDevice([]);
      setLoading(false);
      setTokenBalance(0);
    }
  }, [publicKey, storeItems.length > 0, cdpHashlist.length > 0]);

  return (
    <Layout>
      <>
        {" "}
        <Component {...pageProps} />
      </>
    </Layout>
  );
};

export default NewIndex;
