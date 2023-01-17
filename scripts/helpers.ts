import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "../node_modules/@solana/spl-token";
import axios from "axios";
import { programs } from "@metaplex/js";
import { useRecoilState } from "recoil";
const nfts = require("./mints.json");
const aiNFTs = require("./aiNFTs.json");
const metadata = require("./metadata.json");
const aiNFTs_metadata = require("./aiNFTs_metadata.json");
const timeDevices = require("./timedevices.json");

declare type NFT = {
  pubkey?: PublicKey;
  mint: PublicKey;
  onchainMetadata: programs.metadata.MetadataData;
  externalMetadata: {
    attributes: Array<any>;
    collection: any;
    description: string;
    edition: number;
    external_url: string;
    image: string;
    name: string;
    properties: {
      files: Array<string>;
      category: string;
      creators: Array<{
        pubKey: string;
        address: string;
      }>;
    };
    seller_fee_basis_points: number;
  };
};

const {
  metadata: { Metadata },
} = programs;

async function getNFTMetadata(
  mint: string,
  conn: Connection,
  pubkey?: string
): Promise<any> {
  try {
    const metadataPDA = await Metadata.getPDA(mint);
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;

    const test = await axios.get(onchainMetadata.data.uri);
    //console.log(test)
    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;

    // console.log(onchainMetadata)

    return {
      pubkey: pubkey ? new PublicKey(pubkey) : undefined,
      mintPubKey: new PublicKey(mint),
      mint: mint,
      onchainMetadata,
      metadata: externalMetadata,
      creators: onchainMetadata.data.creators,
    };
  } catch (e) {
    console.log(`failed to pull metadata for token ${mint}`);
  }
}

export async function getNFTMetadataForMany(
  tokens: any[],
  conn: Connection
): Promise<NFT[]> {
  const promises: Promise<NFT | undefined>[] = [];
  tokens.forEach((token) =>
    promises.push(getNFTMetadata(token.mint, conn, token.pubkey))
  );
  const nfts = (await Promise.all(promises)).filter((n) => !!n);

  return nfts;
}

export async function getNFTsByOwner(
  owner: PublicKey,
  conn: Connection,
  storeItems: any,
  cdp: any,
  ais: any,
  devices: any
): Promise<any> {
  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const tokens = tokenAccounts.value
    .filter((tokenAccount) => {
      const amount = tokenAccount.account.data.parsed.info.tokenAmount;

      return amount.decimals === 0 && amount.uiAmount === 1;
    })
    .map((tokenAccount) => {
      return {
        pubkey: tokenAccount.pubkey,
        mint: tokenAccount.account.data.parsed.info.mint,
      };
    });

  const NFTs = tokens.filter((tokenAccount) => {
    return nfts.includes(tokenAccount.mint);
  });

  const doneTraits = [];
  tokens.forEach((nft) => {
    storeItems.forEach((storeItem) => {
      JSON.parse(storeItem.data.hashlist).forEach((item) => {
        if (item === nft.mint) {
          doneTraits.push({
            metadata: JSON.parse(storeItem.data.metadata),
            mint: item,
          });
        }
      });
    });
  });

  const doneCDP = [];
  tokens.forEach((nft) => {
    if (cdp.includes(nft.mint)) {
      doneCDP.push(nft);
    }
  });

  const allaiNFTs = tokenAccounts.value
    .filter((tokenAccount) => {
      const amount = tokenAccount.account.data.parsed.info.tokenAmount;

      return amount.decimals === 0 && amount.uiAmount === 1;
    })
    .map((tokenAccount) => {
      return {
        pubkey: tokenAccount.pubkey,
        mint: tokenAccount.account.data.parsed.info.mint,
      };
    })
    .filter((tokenAccount) => {
      return aiNFTs.includes(tokenAccount.mint);
    });

  const doneAIs: any = [];
  for (const nft of allaiNFTs) {
    aiNFTs_metadata.forEach((item: any) => {
        if (item.mint === nft.mint) {
            doneAIs.push(item);
        }
      });
  }

  const allDevices = tokenAccounts.value
    .filter((tokenAccount) => {
      const amount = tokenAccount.account.data.parsed.info.tokenAmount;

      return amount.decimals === 0 && amount.uiAmount === 1;
    })
    .map((tokenAccount) => {
      return {
        pubkey: tokenAccount.pubkey,
        mint: tokenAccount.account.data.parsed.info.mint,
      };
    })
    .filter((tokenAccount) => {
      return timeDevices.includes(tokenAccount.mint);
    });

  const doneNFTs = await getNFTMetadataForMany(NFTs, conn);

  return {
    nfts: doneNFTs,
    traits: doneTraits,
    cdp: doneCDP,
    ais: doneAIs,
    devices: allDevices,
  };
}

export const wait = (ms: any) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
