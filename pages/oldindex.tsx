import Head from 'next/head'
import { useState, useEffect } from 'react'
import { generateDownload } from "../scripts/cropImage";
import { useAlert } from "react-alert";
import { uploadIMG, uploadJSON, updateMetadata, toDataURL } from '../scripts';
import web3, {
	Keypair,
	Transaction,
	LAMPORTS_PER_SOL,
	SystemProgram,
	Connection,
	clusterApiUrl,
	sendAndConfirmTransaction,
	PublicKey
} from "@solana/web3.js";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loadingState, storeItemsState, userNFTsState, userTraitsState, videoPlayingState } from '../scripts/atoms';
import { useRouter } from 'next/router';



export default function Home() {

	const { publicKey, signTransaction, sendTransaction, disconnect } = useWallet();
	const alert = useAlert()
	const router = useRouter()

	const [storeItems, setStoreItems] = useRecoilState(storeItemsState)
	const videoPlaying = useRecoilValue(videoPlayingState)
	const [screen, setScreen] = useState('Home')

    function createConnection(url = "https://greatest-summer-pine.solana-mainnet.discover.quiknode.pro/00ffa4253f9b899be3e75cb0e176091c6df54cac/") {
      return new Connection(url, {commitment: "confirmed", confirmTransactionInitialTimeout: 60000});
    }
    const connection = createConnection();

	useEffect(() => {
		const test = async() => {
			const findSignature = await connection.getParsedTransaction(
				"jtDzSSptvv2ouKVBRx6MYc6p554TRzHvZVkZNTRxjvFJ52FzxGduy2DQjgSLv5j9hyhbghcGGp3yy6QL4H3rYjU",
				"confirmed"
			);
			const paid = findSignature.transaction.message.accountKeys.some((item) => (item.pubkey.toBase58() === "DU7Ek8xSiJXf4wdb9WVm5uEd9XL9njiYnQpGKPc17qgA"));

			// console.log(paid)
		}
		test()
	}, [])

	useEffect(() => {
		if (!publicKey) {
			setScreen('Home')
		} else {
			if (!videoPlaying) {
				router.push('/locker')
			}
		}
	}, [publicKey, videoPlaying])


	const MainScreen = () => {

		const [userNFTs, setUserNFTs] = useRecoilState(userNFTsState)
		const [userTraits, setUserTraits] = useRecoilState(userTraitsState)
		const [loading, setLoading] = useRecoilState(loadingState)

		const [loadingNewNFT, setLoadingNewNFT] = useState(false)

		const [newTrait, setNewTrait]: any = useState()
		const [userMetadata, setUserMetadata]: any = useState()

		const [localNFT, setLocalNFT]: any = useState('/images/placeholder.png')

		//use these values when everything is finally uploaded to arweave and blockchain
		const [finishedMetadataURI, setFinishedMetadataURI]: any = useState(null)
		const [finishedImageURI, setFinishedImageURI]: any = useState()

		//once the new metadata uri is uploaded and saved locally, we will run the api to update the on chain metadata
		useEffect(() => {

			if (finishedMetadataURI !== null) {

				const updateAPICall = async () => {
					const response = await updateMetadata(finishedMetadataURI)

					if (response) {
						setFinishedImageURI(null)
						alert.removeAll()
						alert.success("Metadata changed!")
					}
				}
				updateAPICall()
			}

		}, [finishedMetadataURI])

		useEffect(() => {

			const renderUpdatedImage = async () => {
				//NOTE: this gets the attributes and selects the correct local image to push into array. This will probably need to be rearranged to be in the correct order (ex: background needs to be pushed first to be in the very back of the image, then body, then clothes, etc)
				let currentImageArray = []
				let i = 0
				for (const info of userMetadata.attributes) {
					if ((info.trait_type).toLowerCase() === (newTrait.trait.trait_type).toLowerCase()) {
						await toDataURL(newTrait.image, function (dataUrl) {
							currentImageArray.push(dataUrl)
						})
					} else {
						await toDataURL(`/attributes/${encodeURI(info.trait_type)}/${encodeURI(info.value)}.png`, function (dataUrl) {
							currentImageArray.push(dataUrl)
						})
					}
					i++
				}

				if (i === userMetadata.attributes.length && newTrait) {
					const traitExists = userMetadata.attributes.some((attribute) => (attribute.trait_type).toLowerCase() === newTrait.trait.trait_type.toLowerCase());
					if (!traitExists) {
						await toDataURL(newTrait.image, function (dataUrl) {
							currentImageArray.push(dataUrl)
						})
					}
				}

				generateDownload(currentImageArray).then((base64image) => {
					setLocalNFT(base64image)
					setLoadingNewNFT(false)
				})
			}

			if (newTrait && userMetadata) {
				setLoadingNewNFT(true)
				renderUpdatedImage()
			}

		}, [newTrait, userMetadata])


		const changeMetadata = async () => {

			alert.removeAll()
			alert.info("Updating metadata...")

			//uploads image to arweave
			const response = await uploadIMG(localNFT.substring(22))

			if (response) {
				// console.log("new image url: " + response.uri)

				const localAttributes = () => {
					const local: any = []
					userMetadata.attributes.forEach((item: any) => {
						if ((item.trait_type).toLowerCase() === (newTrait.trait.trait_type).toLowerCase()) {
							local.push(newTrait.trait)
						} else {
							local.push(item)
						}
					})

					const found = userMetadata.attributes.some((o: any) => o.trait_type === newTrait.trait.trait_type)

					if (!found) {
						local.push(newTrait.trait)
					}

					return local
				}

				const localMetadata = userMetadata

				localMetadata.attributes = localAttributes()
				localMetadata.image = response.uri;
				localMetadata.properties.files[0].uri = response.uri

				// console.log(localMetadata)

				const finalJSON = await uploadJSON(localMetadata)
				if (finalJSON) {
					// console.log("new metadata url: " + finalJSON.uri)
					setFinishedMetadataURI(finalJSON.uri)
					setFinishedImageURI(response.uri)
				}
			}
		}

		if (screen === "Home") {

			return (
				<div className="home">
					<img src="/images/eyes.png" className="eyes" />
					<WalletMultiButton />
				</div>
			)

		} else {

			return <></>

		}

	}


	return (
        <>
            <Head>
                <title>Upgrades | TTCC</title>
                <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="192x192" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="512x512" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
                <meta property="og:url" content="/" />
                <meta property="og:title" content="Upgrades | TTCC" />
                <meta
                property="og:description"
                content="Fractured Apes NFT - Solana's home of premier art and gaming culture."
                />
                <meta property="og:image" content="/logo.png" />
                <meta name="twitter:title" content="Upgrades | TTCC" />
                <meta
                name="twitter:description"
                content="Fractured Apes NFT - Solana's home of premier art and gaming culture."
                />
                <meta name="twitter:image" content="/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
			<div className='container'>
				<div className="mainScreen">

					<MainScreen />

				</div>

			</div>
		</>
	);
}
