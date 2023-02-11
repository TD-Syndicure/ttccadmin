//const express = require('express'); //Import the express dependency
import express from "express"
import bodyParser from "body-parser"
const app = express();              //Instantiate an express app, the main work horse of this server
const port = process.env.PORT || 3001;                  //Save the port number where your server will be listening

//const cors = require('cors')
// const solanaWeb3 = require('@solana/web3.js');
import cors from 'cors'
import Arweave from 'arweave';
import anchor from "@solana/web3.js";
import { Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY, sendAndConfirmTransaction } from "@solana/web3.js";

var jsonParser = bodyParser.json()
var urlEncoded = bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 500000 })

const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
    ],

    allowedHeaders: [
        'Content-Type'
    ],
};

//init arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

const arweaveKey = (
    JSON.parse(process.env.ARWEAVE_KEY)
)
const arweaveWallet = await arweave.wallets.jwkToAddress(arweaveKey);
const arweaveWalletBallance = await arweave.wallets.getBalance(arweaveWallet);
console.log('wallet address', arweaveWallet);
console.log('wallet balance', arweaveWalletBallance);

app.use(cors(corsOpts));

app.post('/fape', urlEncoded, (req, res) => {

    console.log("Called!")

    const uploadIMG = async () => {
        const reqBody = req.body
        const bufIMG = Buffer.from(reqBody.base64image, 'base64');
        const bufJSON = JSON.parse(reqBody.metadata)


        const enrage = reqBody.enrage
        const enrage1 = reqBody.enrage1
        const enrage2 = reqBody.enrage2
        const newTraits = JSON.parse(reqBody.newTraits)

        console.log('nftname', bufJSON?.onchainMetadata?.data?.name)

        //get metadata file
        const getNewMetadata = () => {
            let currentImageArray = []
            let i = 0
            if (bufJSON.metadata.attributes[0].trait_type === "Iconic") {
                currentImageArray.push(bufJSON.metadata.attributes[0])
                currentImageArray.push(bufJSON.metadata.attributes[1])
                currentImageArray.push({ trait_type: "Version", value: "Enraged" })
            } else {
                for (const attributeType of bufJSON.metadata.attributes) {

                    const foundIndex = newTraits.find((o) => {
                        return o.metadata.attributes[0].trait_type.toLowerCase() === attributeType.trait_type.toLowerCase()
                    })
                    if (foundIndex) {
                        currentImageArray.push(foundIndex.metadata.attributes[0])
                    } else if (attributeType.value === "Fractured" && enrage === 'true') {
                        currentImageArray.push({ trait_type: "Version", value: "Enraged" })
                    } else if (attributeType.value === "None" && enrage === 'true') {
                        currentImageArray.push({ trait_type: "Tier", value: "One" })
                    } else if (attributeType.value === "None" && enrage1 === 'true') {
                        currentImageArray.push({ trait_type: "Tier", value: "Two" })
                    } else if (attributeType.value === "None" && enrage2 === 'true') {
                        currentImageArray.push({ trait_type: "Tier", value: "Three" })
                    } else {
                        currentImageArray.push(attributeType)

                    }
                    i++
                }
            }
            return currentImageArray
        }



        //upload image
        let transaction = await arweave.createTransaction({ data: bufIMG }, arweaveKey);
        transaction.addTag('Content-Type', 'image/png');
        await arweave.transactions.sign(transaction, arweaveKey);
        const response = await arweave.transactions.post(transaction);
        const status = await arweave.transactions.getStatus(transaction.id)
        console.log(`Completed transaction ${transaction.id} with status code ${status}!`)
        const imageURL = `https://www.arweave.net/${transaction.id}?ext=png`

        //construct json
        let localMetadata = {
            ...bufJSON.metadata,
            attributes: getNewMetadata(),
            image: imageURL,
            properties: { creators: bufJSON.creators, files: [{ uri: imageURL, type: 'image/png' }] }
        }

        //upload json
        let transaction2 = await arweave.createTransaction({ data: JSON.stringify(localMetadata) }, arweaveKey);
        transaction2.addTag('Content-Type', 'application/json');
        await arweave.transactions.sign(transaction2, arweaveKey);
        const response2 = await arweave.transactions.post(transaction2);
        const status2 = await arweave.transactions.getStatus(transaction2.id)
        console.log(`Completed transaction ${transaction2.id} with status code ${status2}!`)

        res.json({ image: `https://www.arweave.net/${transaction.id}?ext=png`, json: `https://www.arweave.net/${transaction2.id}` })
    }


    try {
        uploadIMG()
    } catch (e) {
        console.log(e)
        res.json({ result: "failed" });
    }
});

app.post('/uploadMetadataForMint', urlEncoded, (req, res) => {

    console.log("Called!")

    const uploadFiles = async () => {
        const reqBody = req.body
        const bufIMG = Buffer.from(reqBody.base64image, 'base64');
        const bufJSON = JSON.parse(reqBody.metadata)

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


    try {
        uploadFiles()
    } catch (e) {
        console.log(e)
        res.json({ result: "failed" });
    }
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});