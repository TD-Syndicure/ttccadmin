// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Arweave from 'arweave';

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '4mb' // Set desired value here
      }
  }
}

export default async function handler(req, res) {
  const reqBody = JSON.parse(req.body)
  const buf = reqBody.metadata;

  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  const arweaveKey = JSON.parse(process.env.ARWEAVE_KEY)

  const arweaveWallet = await arweave.wallets.jwkToAddress(arweaveKey);

  const arweaveWalletBallance = await arweave.wallets.getBalance(arweaveWallet);

  let transaction = await arweave.createTransaction({data: JSON.stringify(buf)}, arweaveKey);

  transaction.addTag('Content-Type', 'application/json');

  await arweave.transactions.sign(transaction, arweaveKey);

  const response = await arweave.transactions.post(transaction);

  const status = await arweave.transactions.getStatus(transaction.id)

  console.log(`Completed transaction ${transaction.id} with status code ${status}!`)

  res.status(200).json({ 
    uri: `https://www.arweave.net/${transaction.id}` 
  })
}
