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
    "| TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
    "AAXgTsYU11higadNe4Yxf7mVpAQ51LUpkrziLinaJkr",
    "3KcjzRD2gEZ8KcynWnvpo6njRPMjMzn4MPaeudTcYjuf",
    "| TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
        <meta property="og:url" content="/" />
        <meta property="og:title" content="Home | TTCC" />
        <meta
          property="og:description"
          content="Fractured Apes NFT - Solana's home of premier art and gaming culture."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:title" content="Home | TTCC" />
        <meta
          name="twitter:description"
          content="Fractured Apes NFT - Solana's home of premier art and gaming culture."
        />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ul>
        <li className=" wallet-container flex ">
          <WalletMultiButton
            startIcon={null}
            className="wallet mr-4 mt-4"
          ></WalletMultiButton>
        </li>
        {isOwner && (
          <div className="adminPanel">
            <li className="ml-3">
              <Link href="/shop/traits">
                <button className="menu-bar-link">Trait Shop</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/upgrades/c25">
                <button className="menu-bar-link">C25 Upgrades</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/upgrades/fape">
                <button className="menu-bar-link">FAPE Upgrades</button>
              </Link>
            </li>
          </div>
        )}

        {!publicKey ? (
          <h1 className="text-center ml-[-1rem] mt-2 font-bold">
            Not Authorized
          </h1>
        ) : authorized.includes(publicKey.toBase58()) ? (
          <div className="adminPanel">
            <li className="ml-3">
              <Link href="/admin/inventory">
                <button className="menu-bar-link">STORE INVENTORY</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/admin/fix">
                <button className="adminPanel button">CHIMP FIX</button>
              </Link>
            </li>
            <li className="ml-3">
              <Link href="/admin/adventures">
                <button className="adminPanel button">ADVENTURE CONTROL</button>
              </Link>
            </li>
          </div>
        ) : (
          <h1 className="text-center ml-[-1rem] mt-2 font-bold">
            Not Authorized
          </h1>
        )}
      </ul>
    </>
  );
};

export default Landing;
