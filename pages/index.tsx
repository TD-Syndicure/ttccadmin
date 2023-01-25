import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import Head from "next/head";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Landing: NextPage = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const isOwner = publicKey
    ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY
    : false;

  const authorized = [
    "CHkSoSiC4ds3N7LkjyonMtdzdoFPZGJ8C9gfen5z2sHN",
    "Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2",
    "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr",
    "3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf",
    "Hh3dehjrQ7gXiipcewCWnWZZHpW5rA9gwBs7Aosno3B5",
    "5hopvnJPJpriQVmGuhEoAsAZVh9zK9LxSf7UjMnpPF9",
  ];

  useEffect(() => {
    if (!publicKey) {
      router.push("/");
    }
  }, [publicKey]);

  return (
    <>
      <Head>
        <title>Admin | TTCC</title>
        <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon.ico" />
      </Head>
      <ul className="h-[100vh]">
          <div className="adminPanel">
            <li className="ml-3">
              <Link href="/inventory">
                <button className="menu-bar-link">STORE INVENTORY</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/fix">
                <button className="menu-bar-link">CHIMP FIX</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/adventures">
                <button className="menu-bar-link">ADVENTURE CONTROL</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/adventurefix">
                <button className="menu-bar-link">MANUAL ADVENTURES</button>
              </Link>
            </li>
          </div>
      </ul>
    </>
  );
};

export default Landing;
