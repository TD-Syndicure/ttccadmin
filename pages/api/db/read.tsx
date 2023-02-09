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
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};
const firebaseConfig1 = {
  apiKey: process.env.ADV_API_KEY,
  authDomain: process.env.ADV_AUTH_DOMAIN,
  projectId: process.env.ADV_PROJECT_ID,
  storageBucket: process.env.ADV_STORAGE_BUCKET,
  messagingSenderId: process.env.ADV_MESSAGING_SENDER_ID,
  appId: process.env.ADV_APP_ID,
};

const app = initializeApp(firebaseConfig, "primary");
const app1 = initializeApp(firebaseConfig1, "seventh");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db1 = getFirestore(app);
  const db = getFirestore(app1);

  const requestData = JSON.parse(req.body);
  const walletAddress = requestData.publicKey;
  const requestedInfo = requestData.request;
  const extraInfo = requestData.extraInfo;

  const getClaimsAvailable = async () => {
    let localArr: any = [];
    const q = query(
      collection(db, "missions"),
      where("owner", "==", walletAddress),
      where("claimed", "==", false)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      localArr.push({ id: doc.id, data: doc.data() });
    });
    return localArr;
  };

  function getAllIndexes(arr: any, val: any) {
    var indexes = [],
      i;
    for (i = 0; i < arr.length; i++) if (arr[i]?.owner === val) indexes.push(i);
    return indexes;
  }

  const getActiveMissions = async () => {
    let localArr: any = [];
    const q = query(collection(db, "missions"), where("claimed", "==", false));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((nft: any) => {
      localArr.push(nft.data().nftHash);
    });
    return localArr;
  };

  const getMissions = async () => {
    let localArr: any = [];
    const q = query(collection(db, "admin"));
    const querySnapshot = await getDocs(q);
    for (let i = 0; i < querySnapshot.docs.length; i++) {}
    querySnapshot.forEach((doc) => {
      localArr.push({ id: doc.id, data: doc.data() });
    });

    return localArr;
  };

  const getMissionsCompleted = async () => {
    const item: any = await getDoc(doc(db, "nfts", extraInfo));
    if (item) {
      return { nft: item.id, completed: item.data().completedMissions };
    } else {
      return null;
    }
  };

  const getLocalClaim = async () => {
    const localClaim = await getDoc(doc(db, "missions", extraInfo));
    return { id: localClaim.id, data: localClaim.data() };
  };

  const checkIfMissionExists = async () => {
    const localClaim = await getDoc(doc(db, "admin", extraInfo));
    return { id: localClaim.id, data: localClaim.data() };
  };

  const getProgress = async () => {
    const q = query(
      collection(db, "missions"),
      where("claimed", "==", false),
      where("mission", "==", extraInfo)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  };

  const checkIfUsersNFT = async () => {
    const q = query(
      collection(db, "missions"),
      where("claimed", "==", false),
      where("nftHash", "==", extraInfo)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  };

  if (requestedInfo === "getClaimsAvailable") {
    const info = await getClaimsAvailable();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "getMissions") {
    const info = await getMissions();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "getMissionsCompleted") {
    const info = await getMissionsCompleted();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "getLocalClaim") {
    const info = await getLocalClaim();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "getProgress") {
    const info = await getProgress();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "checkIfUsersNFT") {
    const info = await checkIfUsersNFT();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "fixMissions") {
    const info = await getActiveMissions();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "checkIfMissionExists") {
    const info = await checkIfMissionExists();
    res.status(200).json({ info: info });
  } else if (requestedInfo === "getAllMissions") {
    let localArr: any = [];
    const allMissions = await getDocs(collection(db, "missions"));
    allMissions.forEach((item) => {
      localArr.push(item.id);
    });
    res.status(200).json({ info: localArr });
  } else if (requestedInfo === "getHashlist") {
    const allMissions = await getDoc(doc(db, "info", "rewards"));
    res.status(200).json({ info: allMissions?.data()?.hashlist });
  } else if (requestedInfo === "getHashlist2") {
    const allMissions = await getDoc(doc(db, "info", "nfts"));
    res.status(200).json({ info: allMissions?.data()?.hashlist });
  } else if (requestedInfo === "getTraits") {
    const allMissions = await getDocs(collection(db, "traits"));
    let allTraits: any = [];

    for (const item of allMissions.docs) {
      allTraits.push({
        ...item.data(),
        id: item.id,
      });
    }
    res.status(200).json({ info: allTraits });
  } else if (requestedInfo === "doubleCheckMission") {
    const mission = await getDoc(doc(db, "admin", extraInfo));

    res.status(200).json({ info: mission.data() });
  } else if (requestedInfo === "getHashlist3") {
    const realChimps = await getDoc(doc(db, "info", "real_chimps"));
    const recruits = await getDoc(doc(db, "info", "recruits"));
    res.status(200).json({
      info: {
        chimps: realChimps?.data()?.hashlist,
        recruits: recruits?.data()?.hashlist,
      },
    });
  } else if (requestedInfo === "claimAll") {
    let localArr: any = [];
    const q = query(collection(db, "missions"), where("claimed", "==", false));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      if (!doc.data().manuallySent) {
        localArr.push({ id: doc.id, data: doc.data() });
      }
    });
    res.status(200).json(localArr);
  }

  const requestData1 = JSON.parse(req.body);
  const walletAddress1 = requestData1.publicKey;

  const requestedInfo1 = requestData1.request;
  const extraInfo1 = requestData1.extraInfo;

  if (requestedInfo1 === "getNFT") {
    const nft = await getDoc(doc(db1, "nfts", extraInfo1));
    res.status(200).json({ info: { id: nft.id, data: nft.data() } });
  } else if (requestedInfo1 === "getItems") {
    let localArr: any = [];
    const allTraits = await getDocs(collection(db1, "traits"));
    allTraits.forEach((item) => {
      localArr.push({ id: item.id, data: item.data() });
    });
    res.status(200).json({ info: localArr });
  } else if (requestedInfo1 === "getUser") {
    const userDB = await getDoc(doc(db1, "users", walletAddress1));
    if (userDB.exists()) {
      res.status(200).json({ info: { id: userDB.id, data: userDB.data() } });
    } else {
      res.status(200).json({ info: null });
    }
  } else if (requestedInfo1 === "getCDPHashlist") {
    const hashes = await getDoc(doc(db1, "admin", "hashlist"));
    res.status(200).json({ info: JSON.stringify(hashes.data().items) });
  }
}
