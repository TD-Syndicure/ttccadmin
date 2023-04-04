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

const firebaseConfig = {
  apiKey: process.env.ADV_API_KEY,
  authDomain: process.env.ADV_AUTH_DOMAIN,
  projectId: process.env.ADV_PROJECT_ID,
  storageBucket: process.env.ADV_STORAGE_BUCKET,
  messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
  appId: process.env.ADV_APP_ID,
};

const app = initializeApp(firebaseConfig, "fourth");
import mints from "../../../scripts/mints.json";
import AImints from "../../../scripts/aiNFTs.json";

export default async function handler(req: any, res: any) {
  const db = getFirestore(app);
  const requestData = JSON.parse(req.body);
  const devkeyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.ADV_ENCRYPT!)
  );
  const ADV_ESCROWKeyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.ADV_ESCROW!)
  );

  const docForFunction = requestData.docID;

  const connection = new Connection(
    "https://patient-lively-brook.solana-mainnet.quiknode.pro/e00bf50f58434f5f45333bcbe77a45d69171cca1/",
    { commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }
  );

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
  
  // const allRewardNFTs = await getDoc(doc(db, "info", "nfts"));
  // const allTraitNFTs = await getDoc(doc(db, "info", "rewards"));

  const databaseDoc = await getDoc(doc(db, "missions", docForFunction));
  const databaseSignature = databaseDoc?.data()?.signature;

  const adminMission = await getDoc(
    doc(db, "admin", databaseDoc?.data()?.mission)
  );

  const allChimps = allDevNFTs.filter((mint: any) =>
    JSON.parse(adminMission?.data()?.nftsHashlist).includes(mint)
  );
  const allTraits = allDevNFTs.filter((mint: any) =>
    JSON.parse(adminMission?.data()?.traitsHashlist).includes(mint)
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

  const parsedSignatureDatabase = await connection.getParsedTransaction(
    databaseSignature
  );
  let userBase: any =
    parsedSignatureDatabase?.transaction?.message?.accountKeys[0]?.pubkey?.toBase58();
  let user: any =
    parsedSignatureDatabase?.transaction?.message?.accountKeys[0]?.pubkey;

  const nftToClaim = databaseDoc?.data()?.nftHash;
  const sidekickToClaim = databaseDoc?.data()?.sidekickHash;

  /* Checking for an eligible Time Machine */
  const devAssociatedAccount2 = await getAssociatedTokenAddress(
    new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"),
    new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
  );
  const userAssociatedAccount2 = await getAssociatedTokenAddress(
    new PublicKey("Ez7z9Y2bp7B1ErjEFTFqVyCMsWb38du7bTCdU15qMVKz"),
    new PublicKey(userBase)
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
            o?.parsed?.info?.source === userBase &&
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
  if (adminMission?.data()?.tokenCost && adminMission?.data()?.tokenCost > 0) {
    const devAssociatedAccount2 = await getAssociatedTokenAddress(
      new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"),
      new PublicKey("TTCCrCrX9RRGdEEjyvQwSvYWY9K7gmSXHuchfzhSa8L")
    );
    const userAssociatedAccount2 = await getAssociatedTokenAddress(
      new PublicKey("pLtMXLgfyTsRfZyxnFkJpWqHBxMTvkr4tyMLgyj9wrY"),
      new PublicKey(userBase)
    );
    const TXincludesTokenPayment =
      parsedSignatureDatabase?.transaction?.message?.instructions?.some(
        (o: any) => {
          return (
            o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
            o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() &&
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
      new PublicKey(userBase)
    );
    const TXincludesSidekickPayment =
      parsedSignatureDatabase?.transaction?.message?.instructions?.some(
        (o: any) => {
          return (
            o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
            o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() &&
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
      new PublicKey(userBase)
    );
    const TXincludesNFTPayment =
      parsedSignatureDatabase?.transaction?.message?.instructions?.some(
        (o: any) => {
          return (
            o?.parsed?.info?.source === userAssociatedAccount2.toBase58() &&
            o?.parsed?.info?.destination === devAssociatedAccount2.toBase58() &&
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

  //check if doc really exists
  const dbDoc = await getDoc(doc(db, "missions", docForFunction));
  if (!dbDoc.exists()) {
    console.log("Doesn't exist");
    res.status(500).json({ result: "failed" });
    return null;
  }

  //check if this nft is eligible to be sent on mission
  if (!mints.includes(databaseDoc?.data()?.nftHash)) {
    console.log("Doesn't exist");
    res.status(500).json({ info: "failed" });
    return;
  }

  //check if this ai nft is eligible to be sent on mission
  if (
    databaseDoc?.data()?.sidekickHash &&
    !AImints.includes(databaseDoc?.data()?.sidekickHash)
  ) {
    console.log("Doesn't exist");
    res.status(500).json({ info: "failed" });
    return;
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
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: user,
        toPubkey: devkeyPair.publicKey,
        lamports: 0.001 * LAMPORTS_PER_SOL,
      })
    );

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
      ADV_ESCROWKeyPair.publicKey
    );
    if (receiverAccount === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          ADV_ESCROWKeyPair.publicKey,
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
        ADV_ESCROWKeyPair.publicKey,
        1
      )
    );

    //if sidekick, return sidekick
    if (sidekickToClaim) {
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
        ADV_ESCROWKeyPair.publicKey
      );
      if (receiverAccount === null) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            ADV_ESCROWKeyPair.publicKey,
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
          ADV_ESCROWKeyPair.publicKey,
          1
        )
      );
    }

    let instructions2: any = [];

    if (dbDoc.data()?.result) {
      if (dbDoc.data()?.result.item === "sol") {
        instructions2.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: +(+(dbDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(0)),
          })
        );
      } else if (dbDoc.data()?.result.item === "nft") {
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
            instructions2.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                traitUserReceives
              )
            );
          }
          instructions2.push(
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
            instructions2.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                tokenMintAddress
              )
            );
          }
          instructions2.push(
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
      } else if (dbDoc.data()?.result.item === "nothing") {
        instructions2.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: 0.00001 * LAMPORTS_PER_SOL,
          })
        );
        console.log("user received nothing!");
      } else if (dbDoc.data()?.result.item === "chimp") {
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
            instructions2.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                traitUserReceives
              )
            );
          }
          instructions2.push(
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
            instructions2.push(
              createAssociatedTokenAccountInstruction(
                devkeyPair.publicKey,
                associatedDestinationTokenAddr,
                user,
                tokenMintAddress
              )
            );
          }
          instructions2.push(
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
      } else if (dbDoc.data()?.result.item === "tokens") {
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
          instructions2.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions2.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(+dbDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(0))
          )
        );
      } else if (dbDoc.data()?.result.item === "tokens2") {
        instructions2.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: +(+(dbDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(0)),
          })
        );
      } else if (dbDoc.data()?.result.item === "tokens3") {
        instructions2.push(
          SystemProgram.transfer({
            fromPubkey: devkeyPair.publicKey,
            toPubkey: user,
            lamports: +(+(dbDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(0)),
          })
        );
      } else if (dbDoc.data()?.result.item === "tokens4") {
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
          instructions2.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions2.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(
              (+dbDoc.data()?.result.number * LAMPORTS_PER_SOL) /
              1000
            ).toFixed(0))
          )
        );
      } else if (dbDoc.data()?.result.item === "tokens5") {
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
          instructions2.push(
            createAssociatedTokenAccountInstruction(
              devkeyPair.publicKey,
              associatedDestinationTokenAddr,
              user,
              tokenMintAddress
            )
          );
        }
        instructions2.push(
          createTransferInstruction(
            from,
            associatedDestinationTokenAddr,
            devkeyPair.publicKey,
            +(+(+dbDoc.data()?.result.number * LAMPORTS_PER_SOL).toFixed(0))
          )
        );
      }
    }

    const transaction2 = new Transaction().add(...instructions2);

    const blockhash = await connection.getLatestBlockhash();
    //transaction
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = user;
    transaction.recentBlockhash = blockhash.blockhash;
    transaction2.feePayer = devkeyPair.publicKey;
    transaction2.recentBlockhash = blockhash.blockhash;

    const handleResult = () => {
      if (dbDoc?.data()?.result) {
        if (dbDoc?.data()?.result?.item === "nft") {
          if (possibleTrait === undefined) {
            return {
              item: "tokens",
              number: requestData.missionInfo.items["tokens"].number,
            };
          } else {
            return dbDoc?.data()?.result;
          }
        } else if (dbDoc?.data()?.result?.item === "chimp") {
          if (possibleChimp === undefined) {
            return {
              item: "tokens",
              number: requestData.missionInfo.items["tokens"].number,
            };
          } else {
            return dbDoc?.data()?.result;
          }
        } else {
          return dbDoc?.data()?.result;
        }
      }
    };

    try {
      transaction.partialSign({
        publicKey: ADV_ESCROWKeyPair.publicKey,
        secretKey: ADV_ESCROWKeyPair.secretKey,
      });

      transaction2.partialSign({
        publicKey: devkeyPair.publicKey,
        secretKey: devkeyPair.secretKey,
      });

      if (possibleTrait && possibleChimp) {
        const mint: any = new PublicKey(possibleTrait);
        const traitData = await metaplex.nfts().findByMint({ mintAddress: mint });

        const mint2: any = new PublicKey(possibleChimp);
        const chimpData = await metaplex.nfts().findByMint({ mintAddress: mint2 });        res.status(200).json({
          info: transaction.serialize({ requireAllSignatures: false }),
          result: handleResult(),
          traitData: traitData.json,
          chimpData: chimpData.json,
          prizeTX: transaction2.serialize({ requireAllSignatures: false }),
        });
      } else if (possibleChimp && !possibleTrait) {
        const mint2: any = new PublicKey(possibleChimp);
        const chimpData = await metaplex.nfts().findByMint({ mintAddress: mint2 });
        res.status(200).json({
          info: transaction.serialize({ requireAllSignatures: false }),
          result: handleResult(),
          traitData: null,
          chimpData: chimpData.json,
          prizeTX: transaction2.serialize({ requireAllSignatures: false }),
        });
      } else if (possibleTrait && !possibleChimp) {
        const mint: any = new PublicKey(possibleTrait);
        const traitData = await metaplex.nfts().findByMint({ mintAddress: mint });
        res.status(200).json({
          info: transaction.serialize({ requireAllSignatures: false }),
          result: handleResult(),
          traitData: traitData.json,
          chimpData: null,
          prizeTX: transaction2.serialize({ requireAllSignatures: false }),
        });
      } else {
        res.status(200).json({
          info: transaction.serialize({ requireAllSignatures: false }),
          result: handleResult(),
          traitData: null,
          chimpData: null,
          prizeTX: transaction2.serialize({ requireAllSignatures: false }),
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  try {
    await sendCUSTOM();
  } catch (e) {
    console.log(e);
    res.status(500).json({ result: "failed" });
  }
}
