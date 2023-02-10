// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Arweave from "arweave";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
};

export default async function handler(req, res) {
  const reqBody = JSON.parse(req.body);
  const bufIMG = Buffer.from(reqBody.base64image, "base64");
  const bufJSON = reqBody.metadata

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });

  const arweaveKey = JSON.parse(process.env.ARWEAVE_KEY);
  const arweaveWallet = await arweave.wallets.jwkToAddress(arweaveKey);
  const arweaveWalletBallance = await arweave.wallets.getBalance(arweaveWallet);

  //upload image
  let transaction = await arweave.createTransaction(
    { data: bufIMG },
    arweaveKey
  );
  transaction.addTag("Content-Type", "image/png");
  await arweave.transactions.sign(transaction, arweaveKey);
  const response = await arweave.transactions.post(transaction);
  const status = await arweave.transactions.getStatus(transaction.id);
  console.log(
    `Completed transaction ${transaction.id} with status code ${status}!`
  );
  const imageURL = `https://www.arweave.net/${transaction.id}?ext=png`;

  if (bufJSON !== null) {
    //construct json
    let localMetadata = {
      ...bufJSON,
      image: imageURL,
      properties: {
        creators: bufJSON.creators,
        files: [{ uri: imageURL, type: "image/png" }],
      },
    };

    //upload json
    let transaction2 = await arweave.createTransaction(
      { data: JSON.stringify(localMetadata) },
      arweaveKey
    );
    transaction2.addTag("Content-Type", "application/json");
    await arweave.transactions.sign(transaction2, arweaveKey);
    const response2 = await arweave.transactions.post(transaction2);
    const status2 = await arweave.transactions.getStatus(transaction2.id);
    console.log(
      `Completed transaction ${transaction2.id} with status code ${status2}!`
    );

    res.json({
      image: `https://www.arweave.net/${transaction.id}?ext=png`,
      json: `https://www.arweave.net/${transaction2.id}?ext=png`,
    });
  } else {

    res.json({
      image: `https://www.arweave.net/${transaction.id}?ext=png`
    });

  }
}
