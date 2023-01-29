// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
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

const firebaseConfig = {
  apiKey: process.env.ADV_API_KEY,
  authDomain: process.env.ADV_AUTH_DOMAIN,
  projectId: process.env.ADV_PROJECT_ID,
  storageBucket: process.env.ADV_STORAGE_BUCKET,
  messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
  appId: process.env.ADV_APP_ID,
};

const firebaseConfig1 = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig, "TTCC");
const app1 = initializeApp(firebaseConfig1, "TTCC Traits");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getFirestore(app);
  const db1 = getFirestore(app1);
  const requestData = JSON.parse(req.body);
  const walletAddress = requestData.publicKey;

  const requestedInfo = requestData.request;
  const signature = requestData.signature;
  const extraInfo = requestData.extraInfo;

  if (requestedInfo === "addMissionToDatabase") {
    await setDoc(doc(db, "admin", extraInfo.name), {
        items: extraInfo.items,
        length: +extraInfo.length,
        tokenCost: +extraInfo.tokenCost,
        solCost: +extraInfo.solCost,
        lore: extraInfo.lore,
        traitsHashlist: extraInfo.traitsHashlist,
        nftsHashlist: extraInfo.nftsHashlist,
        available: false,
        expiration: +extraInfo.expiration,
        limit: +extraInfo.limit,
        created: new Date()
    })
    res.status(200).json({ info: "success" });
} else if (requestedInfo === "addMissionToDatabase2") {
    await updateDoc(doc(db, "admin", extraInfo.name), {
        items: extraInfo.items,
        length: +extraInfo.length,
        tokenCost: +extraInfo.tokenCost,
        solCost: +extraInfo.solCost,
        lore: extraInfo.lore,
        traitsHashlist: extraInfo.traitsHashlist,
        nftsHashlist: extraInfo.nftsHashlist,
        expiration: +extraInfo.expiration,
        limit: +extraInfo.limit
    })
    res.status(200).json({ info: "success" });
} else if (requestedInfo === "updateMissionAvailability") {
    await updateDoc(doc(db, "admin", extraInfo.id), {
        available: extraInfo.value
    })
    res.status(200).json({ info: "success" });
} else if (requestedInfo === "deleteDocument") {
    await deleteDoc(doc(db, "admin", extraInfo))
    res.status(200).json({ info: "success" });
} else if (requestedInfo === "updateHashlist") {
    await updateDoc(doc(db, "info", "rewards"), {
        hashlist: extraInfo
    })
    res.status(200).json({ info: "success" });
}
else if (requestedInfo === "updateHashlist2") {
    await updateDoc(doc(db, "info", "nfts"), {
        hashlist: extraInfo
    })
    res.status(200).json({ info: "success" });
}
else if (requestedInfo === "deleteTrait") {
    await deleteDoc(doc(db, "traits", extraInfo))
    res.status(200).json({ info: "success" });
} 
else if (requestedInfo === "addTrait") {
    await addDoc(collection(db, "traits"), extraInfo)
    res.status(200).json({ info: "success" });
}

else if (requestedInfo === "fixMission") {
    function weightedRand(spec: any) {
        var i,
            j,
            table: any = [];
        for (i in spec) {
            for (j = 0; j < spec[i].chance * 100; j++) {
                table.push({ item: i, number: spec[i].number });
            }
        }
        return table[Math.floor(Math.random() * table.length)];
    }
    const adminMission = await getDoc(doc(db, "admin", extraInfo.mission))
    var rand012 = weightedRand(adminMission?.data()?.items);
    const day = 86400 * 1000
    const week = (86400 * 7) * 1000
    const sentDate = new Date(extraInfo.timeSent)
    const returnDate = new Date(Number(sentDate.getTime()) + (day * +adminMission?.data()?.length))
    const sidekickReturnDate = new Date((Number(sentDate.getTime()) + ((day - 1440000) * (+adminMission?.data()?.length))))

    console.log(adminMission.data())

    await addDoc(collection(db, "missions"), {
        claimed: false,
        owner: extraInfo.owner,
        timeSent: sentDate,
        timeReturn: extraInfo.sidekickHash ? sidekickReturnDate : returnDate,
        nftHash: extraInfo.nftHash,
        nftIMG: extraInfo.nftIMG,
        nftID: extraInfo.nftID,
        sidekickHash: extraInfo.sidekickHash ?? null,
        sidekickIMG: extraInfo.sidekickIMG ?? null,
        sidekickID: extraInfo.sidekickID ?? null,
        mission: extraInfo.mission,
        signature: "bypass",
        result: rand012
    })
    await updateDoc(doc(db, "nfts", extraInfo.nftHash), {
        completedMissions: arrayUnion(extraInfo.mission)
    })
    await updateDoc(doc(db, "admin", extraInfo.mission), {
        limit: adminMission?.data()?.limit ? +(adminMission?.data()?.limit - 1) : 0
    })
    res.status(200).json({ info: "success" });
}

  if (requestedInfo === "updateAppliedTraits") {
    await updateDoc(doc(db1, "nfts", extraInfo.nft), {
      appliedTraits: extraInfo.appliedTraits,
      signature: signature ?? null,
    });
    res.status(200).json({ info: "success" });
  } else if (requestedInfo === "updateTrait") {
    await updateDoc(doc(db1, "traits", extraInfo.item), {
      costSOL: +extraInfo.costSOL,
      cost: +extraInfo.cost,
      quantity: extraInfo.quantity,
      metadata: extraInfo.metadata,
      hashlist: extraInfo.hashlist,
      available: extraInfo.available,
    });
    res.status(200).json({ info: "success" });
  } else if (requestedInfo === "deleteTrait") {
    await deleteDoc(doc(db1, "traits", extraInfo));
    res.status(200).json({ info: "success" });
  } else if (requestedInfo === "addTrait") {
    const newTraitDocID = await addDoc(collection(db1, "traits"), {
      costSOL: +extraInfo.costSOL,
      cost: +extraInfo.cost,
      metadata: extraInfo.metadata,
      hashlist: extraInfo.hashlist,
      quantity: extraInfo.quantity,
      available: extraInfo.available,
    });
    res.status(200).json({ info: newTraitDocID.id });
  } else if (requestedInfo === "updateQuantity") {
    await updateDoc(doc(db1, "traits", extraInfo.id), {
      quantity: +extraInfo.quantity,
    });
    res.status(200).json({ info: "success" });
  } else if (requestedInfo === "editHashlist") {
    await updateDoc(doc(db1, "admin", "hashlist"), {
      items: extraInfo,
    });
    res.status(200).json({ info: "success" });
  }
}
