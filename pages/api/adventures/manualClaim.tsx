// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import web3, {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  PublicKey,
  sendAndConfirmRawTransaction,
  BlockheightBasedTransactionConfirmationStrategy,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "../../../node_modules/@solana/spl-token";
import * as splToken from "@solana/spl-token";
import bs58 from "bs58";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  query,
  addDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  DocumentSnapshot,
  where,
  arrayUnion,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Metaplex } from "@metaplex-foundation/js";
import Arweave from "arweave";
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  UpdateMetadataAccountV2InstructionAccounts,
  UpdateMetadataAccountV2InstructionArgs,
} from "@metaplex-foundation/mpl-token-metadata";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);

const updateAdventureCount = async (updatedMetadata: any) => {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });

  const arweaveKey = JSON.parse(process.env.ARWEAVE_KEY);

  const arweaveWallet = await arweave.wallets.jwkToAddress(arweaveKey);

  const arweaveWalletBallance = await arweave.wallets.getBalance(arweaveWallet);

  let transaction = await arweave.createTransaction(
    { data: JSON.stringify(updatedMetadata) },
    arweaveKey
  );

  transaction.addTag("Content-Type", "application/json");

  await arweave.transactions.sign(transaction, arweaveKey);

  const response = await arweave.transactions.post(transaction);

  const status = await arweave.transactions.getStatus(transaction.id);

  return `https://www.arweave.net/${transaction.id}`;
};

export default async function handler(req: any, res: any) {
  const db = getFirestore(app);
  const requestData = JSON.parse(req.body);
  const devkeyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.USERNAME_ENCRYPT!)
  );
  const escrowKeyPair = Keypair.fromSecretKey(bs58.decode(process.env.ESCROW!));

  const mission = requestData.mission;

  const connection = new Connection(
    "https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
    { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
  );

  const dbmints = await getDoc(doc(db, "info", "real_chimps"));
  const mints = JSON.parse(dbmints?.data()?.hashlist);

  const dbrecruitmints = await getDoc(doc(db, "info", "recruits"));
  const recruitMints = JSON.parse(dbrecruitmints?.data()?.hashlist);

  const fetchNFTs = async () => {
    const devWalletNFTs = new PublicKey(
      "Fg3NSQfyzoDxRDSLRJWWVsEWLpPH1UD3FEvRvmzw7BG2"
    );
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      devWalletNFTs!,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value
      .filter(
        (tokenAccount) =>
          tokenAccount.account.data.parsed.info.tokenAmount.amount === "1"
      )
      .map((tokenAccount) => {
        return tokenAccount.account.data.parsed.info.mint;
      });
  };
  const allDevNFTs = await fetchNFTs();
  const allRewardNFTs = await getDoc(doc(db, "info", "nfts"));
  const allTraitNFTs = await getDoc(doc(db, "info", "rewards"));

  const allChimps = allDevNFTs.filter((mint: any) =>
    JSON.parse(allRewardNFTs?.data()?.hashlist).includes(mint)
  );
  const allTraits = allDevNFTs.filter((mint: any) =>
    JSON.parse(allTraitNFTs?.data()?.hashlist).includes(mint)
  );

  const possibleTrait = allTraits[Math.floor(Math.random() * allTraits.length)];
  const possibleChimp = allChimps[Math.floor(Math.random() * allChimps.length)];

  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* ============================================== SECURITY MEASURES ============================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */

  const databaseDoc = await getDoc(doc(db, "missions", mission));
  const databaseSignature = databaseDoc?.data()?.signature;
  let user = new PublicKey(databaseDoc?.data()?.owner);

  const nftToClaim = databaseDoc?.data()?.nftHash;
  const sidekickToClaim = databaseDoc?.data()?.sidekickHash;

  const adminMission = await getDoc(
    doc(db, "admin", databaseDoc?.data()?.mission)
  );
  if (databaseSignature !== "bypass") {
    const parsedSignatureDatabase = await connection.getParsedTransaction(
      databaseSignature
    );
    let userDatabase: any =
      parsedSignatureDatabase?.transaction?.message?.accountKeys[0]?.pubkey?.toBase58();

    /* Checking for an eligible Time Machine */
    const devAssociatedAccount2 = await getAssociatedTokenAddress(
      new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"),
      new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
    );
    const userAssociatedAccount2 = await getAssociatedTokenAddress(
      new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"),
      new PublicKey(userDatabase)
    );
    const TXincludesNFT2 =
      parsedSignatureDatabase?.transaction?.message?.instructions?.some(
        (o: any) => {
          return (
            o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
            o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() &&
            +o?.parsed?.info?.amount === 1
          );
        }
      );
    if (!TXincludesNFT2) {
      console.log("This signature does not include the correct NFT.");
      res.status(500).json({ info: "failed" });
      return;
    }

    /* Checking they paid sol for the mission */
    if (adminMission?.data()?.solCost && adminMission?.data()?.solCost > 0) {
      const TXincludesSOLPayment =
        parsedSignatureDatabase?.transaction?.message?.instructions?.some(
          (o: any) => {
            return (
              o?.parsed?.info?.source === userDatabase &&
              o?.parsed?.info?.destination ===
                "TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L" &&
              +o?.parsed?.info?.lamports ===
                +(adminMission?.data()?.solCost * LAMPORTS_PER_SOL).toFixed(0)
            );
          }
        );
      //will fail if they did not send the sol fee
      if (!TXincludesSOLPayment) {
        console.log("Did not pay the fee");
        res.status(500).json({ info: "failed" });
        return;
      }
    }

    /* Checking they paid pltmx for the mission */
    if (
      adminMission?.data()?.tokenCost &&
      adminMission?.data()?.tokenCost > 0
    ) {
      const devAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"),
        new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
      );
      const userAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"),
        new PublicKey(userDatabase)
      );
      const TXincludesTokenPayment =
        parsedSignatureDatabase?.transaction?.message?.instructions?.some(
          (o: any) => {
            return (
              o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
              o?.parsed?.info?.destination ===
                devAssociatedAccount2.toBase58() &&
              +o?.parsed?.info?.amount ===
                +(adminMission?.data()?.tokenCost * LAMPORTS_PER_SOL).toFixed(0)
            );
          }
        );
      //will fail if they did not send the token fee
      if (!TXincludesTokenPayment) {
        console.log("Did not pay the fee");
        res.status(500).json({ info: "failed" });
        return;
      }
    }

    /* Checking they paid a sidekick nft for the mission */
    if (databaseDoc?.data()?.sidekickHash) {
      const devAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey(databaseDoc?.data()?.sidekickHash),
        new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
      );
      const userAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey(databaseDoc?.data()?.sidekickHash),
        new PublicKey(userDatabase)
      );
      const TXincludesSidekickPayment =
        parsedSignatureDatabase?.transaction?.message?.instructions?.some(
          (o: any) => {
            return (
              o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
              o?.parsed?.info?.destination ===
                devAssociatedAccount2.toBase58() &&
              +o?.parsed?.info?.amount === 1
            );
          }
        );
      //will fail if they did not send the token fee
      if (!TXincludesSidekickPayment) {
        console.log("Did not pay the sidekick");
        res.status(500).json({ info: "failed" });
        return;
      }
    }

    /* Checking they paid a normal nft for the mission */
    if (databaseDoc?.data()?.nftHash) {
      const devAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey(databaseDoc?.data()?.nftHash),
        new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
      );
      const userAssociatedAccount2 = await getAssociatedTokenAddress(
        new PublicKey(databaseDoc?.data()?.nftHash),
        new PublicKey(userDatabase)
      );
      const TXincludesNFTPayment =
        parsedSignatureDatabase?.transaction?.message?.instructions?.some(
          (o: any) => {
            return (
              o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
              o?.parsed?.info?.destination ===
                devAssociatedAccount2.toBase58() &&
              +o?.parsed?.info?.amount === 1
            );
          }
        );
      //will fail if they did not send the token fee
      if (!TXincludesNFTPayment) {
        console.log("Did not pay the NFT");
        res.status(500).json({ info: "failed" });
        return;
      }
    }

    //check if this nft is eligible to be sent on mission
    if (
      !(
        mints.includes(databaseDoc?.data()?.nftHash) ||
        recruitMints.includes(databaseDoc?.data()?.nftHash)
      )
    ) {
      console.log("Doesn't exist");
      res.status(500).json({ info: "failed" });
      return;
    }
  }

  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */
  /* =============================================================================================================== */

  const metaplex = new Metaplex(connection);

  async function sendCUSTOM(): Promise<any> {
    let NFTUserReceives = new PublicKey(nftToClaim);
    const instructions: any = [];

    //always return base chimp
    const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
      NFTUserReceives,
      user
    );
    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );
    let from = await getAssociatedTokenAddress(
      NFTUserReceives,
      escrowKeyPair.publicKey
    );
    if (receiverAccount === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          escrowKeyPair.publicKey,
          associatedDestinationTokenAddr,
          user,
          NFTUserReceives
        )
      );
    }
    instructions.push(
      createTransferInstruction(
        from,
        associatedDestinationTokenAddr,
        escrowKeyPair.publicKey,
        1
      )
    );

    //if sidekick, return sidekick
    if (sidekickToClaim !== null) {
      let SidekickUserReceives = new PublicKey(sidekickToClaim);
      const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
        SidekickUserReceives,
        user
      );
      const receiverAccount = await connection.getAccountInfo(
        associatedDestinationTokenAddr
      );
      let from = await getAssociatedTokenAddress(
        SidekickUserReceives,
        escrowKeyPair.publicKey
      );
      if (receiverAccount === null) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            escrowKeyPair.publicKey,
            associatedDestinationTokenAddr,
            user,
            SidekickUserReceives
          )
        );
      }
      instructions.push(
        createTransferInstruction(
          from,
          associatedDestinationTokenAddr,
          escrowKeyPair.publicKey,
          1
        )
      );
    }

    if (databaseDoc.data()?.result) {
      if (databaseDoc.data()?.result.item === "sol") {
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: databaseDoc.data()?.result.number * LAMPORTS_PER_SOL,
          })
        );
      } else if (databaseDoc.data()?.result.item === "nft") {
        if (possibleTrait) {
          const traitUserReceives = new PublicKey(possibleTrait);
          const associatedDestinationTokenAddr =
            await getAssociatedTokenAddress(traitUserReceives, user);
          const receiverAccount = await connection.getAccountInfo(
            associatedDestinationTokenAddr
          );
          let from = await getAssociatedTokenAddress(
            traitUserReceives,
            devkeyPair.publicKey
          );
          if (receiverAccount === null) {
            instructions.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                traitUserReceives
              )
            );
          }
          instructions.push(
            createTransferInstruction(
              from,
              associatedDestinationTokenAddr,
              devkeyPair.publicKey,
              1
            )
          );
        } else {
          const tokenMintAddress = new PublicKey(
            "pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"
          );
          const associatedDestinationTokenAddr =
            await getAssociatedTokenAddress(tokenMintAddress, user);
          const receiverAccount = await connection.getAccountInfo(
            associatedDestinationTokenAddr
          );
          let from = await getAssociatedTokenAddress(
            tokenMintAddress,
            devkeyPair.publicKey
          );
          if (receiverAccount === null) {
            instructions.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                tokenMintAddress
              )
            );
          }
          instructions.push(
            createTransferInstruction(
              from,
              associatedDestinationTokenAddr,
              devkeyPair.publicKey,
              +(+(
                +requestData.missionInfo.items["tokens"].number *
                LAMPORTS_PER_SOL
              ).toFixed(0))
            )
          );
        }
      } else if (databaseDoc.data()?.result.item === "nothing") {
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: 0.00001 * LAMPORTS_PER_SOL,
          })
        );
        console.log("user received nothing!");
      } else if (databaseDoc.data()?.result.item === "chimp") {
        if (possibleChimp) {
          const traitUserReceives = new PublicKey(possibleChimp);
          const associatedDestinationTokenAddr =
            await getAssociatedTokenAddress(traitUserReceives, user);
          const receiverAccount = await connection.getAccountInfo(
            associatedDestinationTokenAddr
          );
          let from = await getAssociatedTokenAddress(
            traitUserReceives,
            devkeyPair.publicKey
          );
          if (receiverAccount === null) {
            instructions.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                traitUserReceives
              )
            );
          }
          instructions.push(
            createTransferInstruction(
              from,
              associatedDestinationTokenAddr,
              devkeyPair.publicKey,
              1
            )
          );
        } else {
          const tokenMintAddress = new PublicKey(
            "pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"
          );
          const associatedDestinationTokenAddr =
            await getAssociatedTokenAddress(tokenMintAddress, user);
          const receiverAccount = await connection.getAccountInfo(
            associatedDestinationTokenAddr
          );
          let from = await getAssociatedTokenAddress(
            tokenMintAddress,
            devkeyPair.publicKey
          );
          if (receiverAccount === null) {
            instructions.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                tokenMintAddress
              )
            );
          }
          instructions.push(
            createTransferInstruction(
              from,
              associatedDestinationTokenAddr,
              devkeyPair.publicKey,
              +(+(
                +requestData.missionInfo.items["tokens"].number *
                LAMPORTS_PER_SOL
              ).toFixed(0))
            )
          );
        }
      } else if (databaseDoc.data()?.result.item === "tokens") {
        const tokenMintAddress = new PublicKey(
          "pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"
        );
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
          tokenMintAddress,
          user
        );
        const receiverAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );
        let from = await getAssociatedTokenAddress(
          tokenMintAddress,
          devkeyPair.publicKey
        );
        if (receiverAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(+databaseDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(
              0
            ))
          )
        );
      } else if (databaseDoc.data()?.result.item === "tokens2") {
        const tokenMintAddress = new PublicKey(
          "8ZKGnRpnM1BVN9SGBuJaXSf1cHwQ2fWUvPpXWoMWT31C"
        );
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
          tokenMintAddress,
          user
        );
        const receiverAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );
        let from = await getAssociatedTokenAddress(
          tokenMintAddress,
          devkeyPair.publicKey
        );
        if (receiverAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(+databaseDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(
              0
            ))
          )
        );
      } else if (databaseDoc.data()?.result.item === "tokens3") {
        const tokenMintAddress = new PublicKey(
          "ETsA9km6SDf5dno7RqLwqg8bUYUb3MYNyrphhJiQbHQH"
        );
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
          tokenMintAddress,
          user
        );
        const receiverAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );
        let from = await getAssociatedTokenAddress(
          tokenMintAddress,
          devkeyPair.publicKey
        );
        if (receiverAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(
              (+databaseDoc.data()?.result.number * LAMPORTS_PER_SOL) /
              100
            ).toFixed(0))
          )
        );
      } else if (databaseDoc.data()?.result.item === "tokens4") {
        const tokenMintAddress = new PublicKey(
          "9WMwGcY6TcbSfy9XPpQymY3qNEsvEaYL3wivdwPG2fpp"
        );
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
          tokenMintAddress,
          user
        );
        const receiverAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );
        let from = await getAssociatedTokenAddress(
          tokenMintAddress,
          devkeyPair.publicKey
        );
        if (receiverAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(
              (+databaseDoc.data()?.result.number * LAMPORTS_PER_SOL) /
              1000
            ).toFixed(0))
          )
        );
      } else if (databaseDoc.data()?.result.item === "tokens5") {
        const tokenMintAddress = new PublicKey(
          "G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB"
        );
        const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
          tokenMintAddress,
          user
        );
        const receiverAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );
        let from = await getAssociatedTokenAddress(
          tokenMintAddress,
          devkeyPair.publicKey
        );
        if (receiverAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(+databaseDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(
              0
            ))
          )
        );
      }
    }

    //UPLOAD NEW METADATA URL========================================================================================================================================
    const task = metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(nftToClaim) });
    const nftData = await task.run();
    const metadataUpdated = nftData.json;

    const updatedAttributes = [];
    metadataUpdated?.attributes?.forEach((o: any) => {
      if (o.trait_type === "Adventure Count") {
        updatedAttributes.push({
          trait_type: "Adventure Count",
          value: +o.value + 1,
        });
      } else {
        updatedAttributes.push(o);
      }
    });
    if (
      !metadataUpdated?.attributes?.some((o: any) => o.trait_type === "Role")
    ) {
      updatedAttributes.push({
        trait_type: "Role",
        value: "Time Traveler",
      });
    }
    if (
      !metadataUpdated?.attributes?.some(
        (o: any) => o.trait_type === "Adventure Count"
      )
    ) {
      updatedAttributes.push({
        trait_type: "Adventure Count",
        value: 1,
      });
    }

    const updatedMetadata = {
      ...metadataUpdated,
      attributes: updatedAttributes,
    };

    const newMetadataURL = await updateAdventureCount(updatedMetadata);

    const keypair = Keypair.fromSecretKey(bs58.decode(process.env.ESCROW!));
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const mintKey = new PublicKey(nftToClaim);
    const [metadatakey] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    const updated_data: DataV2 = {
      name: nftData.name,
      symbol: nftData.symbol,
      uri: newMetadataURL,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      creators: nftData.creators,
      collection: {
        verified: nftData?.collection?.verified!,
        key: nftData?.collection?.address!,
      },
      uses: null,
    };
    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: metadatakey,
      updateAuthority: keypair.publicKey,
    };
    const args: UpdateMetadataAccountV2InstructionArgs = {
      updateMetadataAccountArgsV2: {
        data: updated_data,
        updateAuthority: keypair.publicKey,
        primarySaleHappened: true,
        isMutable: true,
      },
    };
    instructions.push(createUpdateMetadataAccountV2Instruction(accounts, args));

    // =========================================================================================================================================================

    const blockhash = await connection.getLatestBlockhash();
    //transaction
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = devkeyPair.publicKey;
    transaction.recentBlockhash = blockhash.blockhash;

    try {
      transaction.partialSign({
        publicKey: escrowKeyPair.publicKey,
        secretKey: escrowKeyPair.secretKey,
      });
      transaction.partialSign({
        publicKey: devkeyPair.publicKey,
        secretKey: devkeyPair.secretKey,
      });
      const sentSig = await connection.sendRawTransaction(
        transaction.serialize()
      );
      const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: sentSig,
      };
      const result = await connection.confirmTransaction(confirmStrategy);
      if (result.value.err === null) {
        await updateDoc(doc(db, "missions", mission), {
          manuallySent: true,
          manualPrize: {
            nft: possibleChimp ?? null,
            trait: possibleTrait ?? null,
          },
        });
        res.status(200).json({ info: "success" });
      } else {
        res.status(200).json({ info: "failed" });
      }
    } catch (e) {
      console.log(e);
    }
  }

  try {
    await sendCUSTOM();
  } catch (e) {
    console.log(e);
    res.status(500).json({ info: "failed" });
  }
}
