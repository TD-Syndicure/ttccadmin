import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { useRecoilState } from "recoil";
import { storeItemsState } from "../scripts/atoms";
import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import { writeAPI } from "../scripts";
import { programs } from "@metaplex/js";
import { Connection } from "@solana/web3.js";
import {
	AiOutlineCheck,
	AiOutlineEdit,
	AiOutlineMinus,
	AiOutlinePlus,
	AiOutlineUpload,
} from "react-icons/ai";
import { wait } from "../scripts/helpers";
const {
	metadata: { Metadata },
} = programs;
import styles from "../styles/Home.module.css";
export default function Admin() {
	const { publicKey, signTransaction, sendTransaction } = useWallet();
	const connection = new Connection(
		"https://lingering-winter-vineyard.solana-mainnet.quiknode.pro/cac2c64de80fb7bd7895357dbd96a436320d0441/",
		{ commitment: "processed", confirmTransactionInitialTimeout: 60000 }
	);
	const alert = useAlert();
	const router = useRouter();

	const [loading, setLoading]: any = useState(false);
	const [authenticatedUser, setAuthenticatedUser]: any = useState(false);
	const [storeItems, setStoreItems] = useRecoilState(storeItemsState);

	const Login = () => {
		const [email, setEmail]: any = useState();
		const [password, setPassword]: any = useState();

		const signIn = async () => {
			const requestData = {
				method: "POST",
				header: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: email, password: password }),
			};
			var response = await fetch("./api/adventures/signIn", requestData);
			const res = await response.json();
			if (res === "success") {
				alert.removeAll();
				alert.success("Signed in!");
				setAuthenticatedUser(true);
			} else {
				alert.removeAll();
				alert.error("Not authorized!");
				setAuthenticatedUser(false);
			}
		};

		return (
			<div className="adminLogin">
				<input
					type="email"
					alt="Email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					alt="Password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button onClick={() => signIn()}>Log In</button>
			</div>
		);
	};

	const AddTraitItems = () => {
		const IndivItem = ({ item, index }: { item: any; index: any }) => {
			const [hashlist, setHashlist]: any = useState(item?.data?.hashlist);
			const [metadata, setMetadata]: any = useState(item?.data?.metadata);
			const [costMango, setMango]: any = useState(item?.data?.costMango);
			const [costPuff, setPuff]: any = useState(item?.data?.costPuff);
			const [costJelly, setJelly]: any = useState(item?.data?.costJelly);
			const [cost, setCost]: any = useState(item?.data?.cost);
			const [costSOL, setCostSOL]: any = useState(item?.data?.costSOL);
			const [quantity, setQuantity]: any = useState(item?.data?.quantity);
			const [available, setAvailable]: any = useState(item?.data?.available);
			const [file, setFile] = useState<File>();
			const [file2, setFile2] = useState<File>();

			const [edit, setEdit]: any = useState(false);

			const editItem = async () => {
				let imageForMetadata = null;
				let imageForImageGeneration = null;
				//converting image to base64
				let reader = new FileReader();
				reader.onload = async function () {
					//@ts-ignore
					let base64_data = await window.btoa(reader.result!);
					if (base64_data) {
						//uploads metadata and image files to arweave
						alert.removeAll();
						alert.info("Uploading metadata...");

						const requestData = {
							method: "POST",
							header: {
								"Content-Type": "application/x-www-form-urlencoded",
							},
							body: new URLSearchParams({
								base64image: base64_data,
								metadata: JSON.stringify(null),
							}),
						};
						var response = await fetch(
							"https://upgradestation.fracturedapes.com/uploadMetadataForMint",
							requestData
						);
						const res = await response.json();
						console.log(res);
						imageForMetadata = res.image;
					}
				};
				if (file) {
					reader.readAsBinaryString(file);
					let i = 0;
					while (1) {
						console.log("here");
						i++;
						await wait(500);
						if (
							imageForMetadata !== null &&
							typeof imageForMetadata === "string"
						) {
							await wait(2000);
							break;
						} else if (i === 60) {
							alert.removeAll();
							alert.error("Error!");
							return;
						}
					}
				}
				//converting image to base64
				let reader2 = new FileReader();
				reader2.onload = async function () {
					//@ts-ignore
					let base64_data = await window.btoa(reader2.result!);
					if (base64_data) {
						//uploads metadata and image files to arweave
						alert.removeAll();
						alert.info("Uploading metadata...");
						const requestData = {
							method: "POST",
							header: {
								"Content-Type": "application/x-www-form-urlencoded",
							},
							body: JSON.stringify({
								base64image: base64_data,
								metadata: null,
							}),
						};
						var response = await fetch(
							"https://upgradestation.fracturedapes.com/uploadMetadataForMint",
							requestData
						);
						const res = await response.json();
						console.log(res);
						imageForImageGeneration = res.image;
					}
				};
				if (file2) {
					reader2.readAsBinaryString(file2);
					let i = 0;
					while (1) {
						console.log("here");
						i++;
						await wait(500);
						if (
							imageForImageGeneration !== null &&
							typeof imageForImageGeneration === "string"
						) {
							console.log(imageForImageGeneration);
							await wait(2000);
							break;
						} else if (i === 60) {
							alert.removeAll();
							alert.error("Error!");
							return;
						}
					}
				}

				let localMetadata = {
					...JSON.parse(item?.data?.metadata),
					image: imageForMetadata ?? JSON.parse(item?.data?.metadata).image,
					properties: {
						creators:
							JSON.parse(item?.data?.metadata)?.properties?.creators ??
							JSON.parse(item?.data?.metadata)?.creators,
						files: [
							{
								uri: imageForMetadata ?? JSON.parse(item?.data?.metadata).image,
								type: "image/png",
							},
						],
					},
				};

				await writeAPI(publicKey?.toBase58()!, "updateTrait", null, {
					costSOL: +costSOL,
					costMango: +costMango,
					costJelly: +costJelly,
					costPuff: +costPuff,
					cost: +cost,
					quantity: quantity,
					metadata: JSON.stringify(localMetadata),
					hashlist: hashlist,
					available: available,
					image: imageForImageGeneration ?? item?.data?.image,
					item: item.id,
				});
				const filteredItems = storeItems.filter((o: any) => {
					return o.id !== item.id;
				});
				setStoreItems([
					...filteredItems,
					{
						id: item.id,
						data: {
							cost: +cost,
							costMango: +costMango,
							costJelly: +costJelly,
							costPuff: +costPuff,
							costSOL: +costSOL,
							metadata: JSON.stringify(localMetadata),
							hashlist: hashlist,
							quantity: quantity,
							available: available,
							image: imageForImageGeneration ?? item?.data?.image,
						},
					},
				]);
				setCost(0);
				setCostSOL(0);
				setEdit(false);
				alert.removeAll();
				alert.success("Success!");
			};

			const DeleteButton = () => {
				const [text, setText]: any = useState("Delete");
				let id = text;
				const deleteItem = async () => {
					if (text === "Delete") {
						setText("ConfirmDelete");
					} else {
						await writeAPI(
							publicKey?.toBase58()!,
							"deleteTrait",
							null,
							item.id
						);
						const filteredItems = storeItems.filter((o: any) => {
							return o.id !== item.id;
						});
						setStoreItems([...filteredItems]);
					}
				};

				return (
					<button id={id} onClick={() => deleteItem()}>
						{text}
					</button>
				);
			};

			if (!edit) {
				return (
					<div className="itemBoxes">
						<div id="editView" className="row">
							<div className="flex relative overflow-hidden">
								<img
									src={JSON.parse(item.data.metadata).image}
									height="250"
									width="250"
									style={{ borderRadius: "6px" }}
								/>
								<img
									src={item.data?.image ?? "/images/placeholder.png"}
									height="60"
									width="60"
									className="absolute bottom-0 right-0 rounded-tl-md"
									style={{ boxShadow: "-2px -2px 10px #00000040" }}
								/>
							</div>
							<div className="itemBoxInner">
								{/* <div><h1>* Hashlist (JSON Array):</h1><textarea value={hashlist} disabled /></div>
                                <div><h1>* Metadata (JSON Object):</h1><textarea value={metadata} disabled /></div> */}
								<h1>
									Trait Type:{" "}
									<b>
										{JSON.parse(item.data.metadata).attributes[0]?.trait_type}
									</b>
									Value:{" "}
									<b>{JSON.parse(item.data.metadata).attributes[0]?.value}</b>
								</h1>
								{/* <h1>Image: <b>{JSON.parse(item.data.metadata).image}</b></h1> */}
								<h1>
									PLTMX Cost: <b>{item?.data?.cost}</b>
									Jelly Cost: <b>{item?.data?.costJelly}</b>
									Mango Cost: <b>{item?.data?.costMango}</b>
									Puff Cost: <b>{item?.data?.costPuff}</b>
									SOL Cost: <b>{item?.data?.costSOL}</b>
									Quantity: <b>{item?.data?.quantity}</b>
									Available:{" "}
									<b>{item?.data?.available === true ? "yes" : "no"}</b>
								</h1>
							</div>
						</div>
						<button className="editButton" onClick={() => setEdit(true)}>
							Edit Trait
						</button>
					</div>
				);
			} else {
				return (
					<div className="itemBoxes">
						<div className="row">
							{/* <img
                src={JSON.parse(item.data.metadata).image}
                height="50"
                width="50"
              /> */}
							<div className="itemBoxInner">
								<h1>
									Trait Type:{" "}
									<b>
										{JSON.parse(item.data.metadata).attributes[0]?.trait_type}
									</b>
								</h1>
								<h1>
									Value:{" "}
									<b>{JSON.parse(item.data.metadata).attributes[0]?.value}</b>
								</h1>
								<div>
									<textarea
										value={hashlist}
										onChange={(e) => setHashlist(e.target.value)}
									/>
								</div>
								{/* <div>
                  <h1>* Metadata (JSON Object):</h1>
                  <textarea
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                  />
                </div> */}

								{/* <h1>Image: <b>{JSON.parse(item.data.metadata).image}</b></h1> */}
								<div className="flex flex-row">
									<div>
										<h1>PLTMX Price:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={cost}
											onChange={(e) => setCost(+e.target.value)}
										/>{" "}
									</div>
									<div>
										{" "}
										<h1>Jelly Cost:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={costJelly}
											onChange={(e) => setJelly(+e.target.value)}
										/>
									</div>
									<div>
										{" "}
										<h1>Mango Cost:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={costMango}
											onChange={(e) => setMango(+e.target.value)}
										/>
									</div>
									<div>
										{" "}
										<h1>Puff Cost:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={costPuff}
											onChange={(e) => setPuff(+e.target.value)}
										/>
									</div>
									<div>
										<h1>SOL Price:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={costSOL}
											onChange={(e) => setCostSOL(+e.target.value)}
										/>
									</div>
									<div>
										<h1>Quantity:</h1>
										<input
											className="w-[5rem]"
											type="number"
											value={quantity}
											onChange={(e) => setQuantity(+e.target.value)}
										/>
									</div>{" "}
									<div>
										<h1>Available:</h1>

										<input
											style={{ width: "fit-content" }}
											type="checkbox"
											checked={available}
											onChange={(e) => setAvailable(!available)}
										/>
									</div>
									<div>
										<input
											id="imgUpload3"
											type="file"
											style={{ display: "none" }}
											onChange={(e) => setFile(e.target.files[0])}
										/>
										<label htmlFor="imgUpload3" className="uploadImage">
											{file ? (
												<img src={URL.createObjectURL(file)} />
											) : (
												<>
													<AiOutlineUpload />
													<h1>Upload NFT Image</h1>
												</>
											)}
										</label>
										<input
											id="imgUpload4"
											type="file"
											style={{ display: "none" }}
											onChange={(e) => setFile2(e.target.files[0])}
										/>
										<label htmlFor="imgUpload4" className="uploadImage">
											{file2 ? (
												<img src={URL.createObjectURL(file2)} />
											) : (
												<>
													<AiOutlineUpload />
													<h1>Upload Image Used For Generation</h1>
												</>
											)}
										</label>
									</div>
								</div>
							</div>
						</div>
						<button className="confirmButton" onClick={() => editItem()}>
							Confirm Update
						</button>
						<DeleteButton />
					</div>
				);
			}
		};

		const AddItem2 = () => {
			const [hashlist, setHashlist]: any = useState();
			const [metadata, setMetadata]: any = useState();
			const [cost, setCost]: any = useState(0);
			const [costMango, setMango]: any = useState(0);
			const [costPuff, setPuff]: any = useState(0);
			const [costJelly, setJelly]: any = useState(0);
			const [costSOL, setCostSOL]: any = useState(0);
			const [costNft, setCostNft]: any = useState(0);
			const [quantity, setQuantity]: any = useState(0);
			const [available, setAvailable]: any = useState(false);
			const [file3, setFile3] = useState<File>();

			useEffect(() => {
				const getMetadataForOne = async (nft: any) => {
					try {
						const metadataPDA = await Metadata.getPDA(nft);
						const onchainMetadata = (
							await Metadata.load(connection, metadataPDA)
						).data;
						const externalMetadata = (await axios.get(onchainMetadata.data.uri))
							.data;
						setMetadata(JSON.stringify(externalMetadata));
					} catch (e) {
						//console.log(`failed to pull metadata for token ${nft}`);
					}
				};
				if (hashlist) {
					try {
						if (Array.isArray(JSON.parse(hashlist))) {
							getMetadataForOne(JSON.parse(hashlist)[0]);
						}
					} catch (e) {
						//console.log(e);
					}
				}
			}, [hashlist]);

			const submitItem = async () => {
				if (file3) {
					//gets base64 data for trait application image
					let reader = new FileReader();
					reader.readAsBinaryString(file3);
					reader.onload = async function () {
						//@ts-ignore
						let base64_data = await window.btoa(reader.result!);
						if (base64_data) {
							const requestData = {
								method: "POST",
								header: {
									"Content-Type": "application/x-www-form-urlencoded",
								},
								body: new URLSearchParams({
									base64image: base64_data,
									metadata: JSON.stringify(null),
								}),
							};
							var response2 = await fetch(
								"https://upgradestation.fracturedapes.com/uploadMetadataForMint",
								requestData
							);
							const res = await response2.json();

							const newTraitDocID = await writeAPI(
								publicKey?.toBase58()!,
								"addTrait",
								null,
								{
									costSOL: +costSOL,
									costMango: +costMango,
									costJelly: +costJelly,
									costPuff: +costPuff,
                  costNft: +costNft,
									cost: +cost,
									metadata: metadata,
									hashlist: hashlist,
									quantity: quantity,
									available: available,
									image: res.image || null,
								}
							);

							if (newTraitDocID) {
								setStoreItems([
									...storeItems,
									{
										id: newTraitDocID.info,
										data: {
											costSOL: +costSOL,
											costMango: +costMango,
											costJelly: +costJelly,
											costPuff: +costPuff,
                      costNft: +costNft,
											cost: +cost,
											metadata: metadata,
											hashlist: hashlist,
											quantity: quantity,
											available: available,
											image: res.image || null,
										},
									},
								]);
								setHashlist();
								setMetadata();
								setQuantity(0);
								setCost(0);
								setMango(0);
								setJelly(0);
								setPuff(0);
                setCostNft(0);
								setCostSOL(0);
								setLoading(false);
								setAvailable(false);
								setFile3(null);
								alert.removeAll();
								alert.success(`Success!`);
							}
						}
					};
				}
			};

			return (
				<div className="itemBox">
					<div className="row">
						<img
							src={
								metadata
									? JSON.parse(metadata).image
									: "/images/placeholder.png"
							}
							height="50"
							width="50"
						/>
						<div className="itemBoxInner">
							<div>
								<h1>Hashlist:</h1>
								<textarea
									value={hashlist}
									onChange={(e) => setHashlist(e.target.value)}
								/>
							</div>
							{/* <div>
                <h1>Metadata:</h1>
                <textarea
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                />
              </div> */}
							<div className="flex flex-row flex-wrap ">
								<h1>PLTMX Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={cost}
									onChange={(e) => setCost(+e.target.value)}
								/>

								<h1>Jelly Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={costJelly}
									onChange={(e) => setCost(+e.target.value)}
								/>

								<h1>Mango Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={costMango}
									onChange={(e) => setCost(+e.target.value)}
								/>

								<h1>Puff Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={costPuff}
									onChange={(e) => setCost(+e.target.value)}
								/>

								<h1>SOL Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={costSOL}
									onChange={(e) => setCostSOL(+e.target.value)}
								/>

								<h1>NFT Cost:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={costNft}
									onChange={(e) => setCostNft(+e.target.value)}
								/>

								<h1>Quantity:</h1>
								<input
									className="w-[3rem]"
									type="number"
									value={quantity}
									onChange={(e) => setQuantity(+e.target.value)}
								/>

								<h1>For Sale?</h1>
								<input
									style={{ width: "fit-content" }}
									type="checkbox"
									checked={available}
									onChange={(e) => setAvailable(!available)}
								/>
								<input
									id="imgUpload5"
									type="file"
									style={{ display: "none" }}
									onChange={(e) => setFile3(e.target.files[0])}
								/>
								<label htmlFor="imgUpload5" className="uploadImage">
									{file3 ? (
										<img src={URL.createObjectURL(file3)} />
									) : (
										<>
											<AiOutlineUpload />
											<h1>Upload Image Used For Generation</h1>
										</>
									)}
								</label>
							</div>
						</div>
					</div>
					<button className="addButton" onClick={() => submitItem()}>
						Add Item
					</button>
				</div>
			);
		};

		const AddItem = () => {
			const [name, setName] = useState<string>("");
			const [symbol, setSymbol] = useState<string>("");
			const [royalties, setRoyalties] = useState<number>(0);
			const [collection, setCollection] = useState<string>("");
			const [description, setDescription] = useState<string>("");
			const [attributes, setAttributes] = useState<
				{ trait_type: string; value: string }[]
			>([]);
			const [creators, setCreators] = useState<
				{ address: string; verified: number; share: number }[]
			>([
				{
					address: "FsZhojkEDJkn77G5GqmH799LRWQMgk5oxaG2r1G8vHWU",
					verified: 0,
					share: 100,
				},
			]);
			const [quantity, setQuantity] = useState<number>(0);
			const [cost, setCost]: any = useState(0);
			const [costMango, setMango]: any = useState(0);
			const [costPuff, setPuff]: any = useState(0);
			const [costJelly, setJelly]: any = useState(0);
			const [costSOL, setCostSOL]: any = useState(0);
			const [available, setAvailable]: any = useState(false);
			const [file, setFile] = useState<File>();
			const [file2, setFile2] = useState<File>();
			const [confirm, setConfirm] = useState<boolean>(false);

			const AddAttribute = () => {
				const [traitType, setTraitType] = useState<string>("");
				const [value, setValue] = useState<string>("");

				return (
					<div className="attributeRow">
						<input
							type="text"
							value={traitType}
							placeholder="Trait Type"
							onChange={(e) => setTraitType(e.target.value)}
						/>
						<input
							type="text"
							value={value}
							placeholder="Value"
							onChange={(e) => setValue(e.target.value)}
						/>
						<div className={`minusSign disabledSign`}>
							<AiOutlineMinus />
						</div>
						<div
							className={`plusSign ${
								traitType !== "" && value !== "" ? "" : "disabledSign"
							}`}
							onClick={() => {
								if (traitType !== "" && value !== "") {
									setAttributes((prev) => [
										...prev,
										{ trait_type: traitType, value: value },
									]);
								}
							}}>
							<AiOutlinePlus />
						</div>
					</div>
				);
			};

			const Attribute = ({
				attribute,
				index,
			}: {
				attribute: { trait_type: string; value: string };
				index: number;
			}) => {
				const [traitType, setTraitType] = useState<string>(
					attribute.trait_type
				);
				const [value, setValue] = useState<string>(attribute.value);

				const [edit, setEdit] = useState<boolean>(false);

				return (
					<div className="attributeRow">
						<input
							disabled={!edit}
							type="text"
							value={traitType}
							placeholder="Trait Type"
							onChange={(e) => setTraitType(e.target.value)}
						/>
						<input
							disabled={!edit}
							type="text"
							value={value}
							placeholder="Value"
							onChange={(e) => setValue(e.target.value)}
						/>
						<div
							className="minusSign"
							onClick={() => {
								setAttributes((prev) =>
									[...prev].filter((o, i) => i !== index)
								);
							}}>
							<AiOutlineMinus />
						</div>
						<div
							className="plusSign"
							onClick={() => {
								if (edit) {
									setAttributes((prev) =>
										[...prev].map((o, i) => {
											if (i === index) {
												return { trait_type: traitType, value: value };
											} else {
												return o;
											}
										})
									);
									setEdit(!edit);
								} else {
									setEdit(!edit);
								}
							}}>
							{edit ? <AiOutlineCheck /> : <AiOutlineEdit />}
						</div>
					</div>
				);
			};

			const AddCreator = () => {
				const [address, setAddress] = useState<string>("");
				const [share, setShare] = useState<number>(0);

				return (
					<div className="attributeRow">
						<input
							type="text"
							value={address}
							placeholder="Address"
							onChange={(e) => setAddress(e.target.value)}
						/>
						<input
							type="number"
							value={share}
							placeholder="Share"
							onChange={(e) => setShare(+e.target.value)}
						/>
						<div className="minusSign disabledSign">
							<AiOutlineMinus />
						</div>
						<div
							className={`plusSign ${
								address !== "" && share !== 0 ? "" : "disabledSign"
							}`}
							onClick={() => {
								if (address !== "" && share !== 0) {
									setCreators((prev) => [
										...prev,
										{ address: address, verified: 0, share: share },
									]);
								}
							}}>
							<AiOutlinePlus />
						</div>
					</div>
				);
			};

			const Creator = ({
				creator,
				index,
			}: {
				creator: { address: string; verified: number; share: number };
				index: number;
			}) => {
				const [address, setAddress] = useState<string>(creator.address);
				const [share, setShare] = useState<number>(creator.share);

				const [edit, setEdit] = useState<boolean>(false);

				return (
					<div className="attributeRow">
						<input
							disabled={!edit}
							type="text"
							value={address}
							placeholder="Address"
							onChange={(e) => setAddress(e.target.value)}
						/>
						<input
							disabled={!edit}
							type="number"
							value={share}
							placeholder="Share"
							onChange={(e) => setShare(+e.target.value)}
						/>
						<div
							className="minusSign"
							onClick={() => {
								setCreators((prev) => [...prev].filter((o, i) => i !== index));
							}}>
							<AiOutlineMinus />
						</div>
						<div
							className="plusSign"
							onClick={() => {
								if (edit) {
									setCreators((prev) =>
										[...prev].map((o, i) => {
											if (i === index) {
												return { address: address, verified: 0, share: share };
											} else {
												return o;
											}
										})
									);
									setEdit(!edit);
								} else {
									setEdit(!edit);
								}
							}}>
							{edit ? <AiOutlineCheck /> : <AiOutlineEdit />}
						</div>
					</div>
				);
			};

			const mintNFTs = async () => {
				//constructs base metadata file
				const metadataToUpload = {
					name: name,
					symbol: symbol,
					description: description,
					seller_fee_basis_points: royalties * 100,
					image: null,
					attributes: attributes,
					properties: {
						files: [
							{
								uri: null,
								type: "image/png",
							},
						],
						creators: creators,
						category: "image",
					},
				};

				//converting image to base64
				let reader = new FileReader();
				reader.onload = async function () {
					//@ts-ignore
					let base64_data = await window.btoa(reader.result!);
					if (base64_data) {
						//uploads metadata and image files to arweave
						alert.removeAll();
						alert.info("Uploading metadata...");
						const requestData = {
							method: "POST",
							header: {
								"Content-Type": "application/json",
							},
							body: new URLSearchParams({
								base64image: base64_data,
								metadata: JSON.stringify(metadataToUpload),
							}),
						};
						var response = await fetch(
							"https://upgradestation.fracturedapes.com/uploadMetadataForMint",
							requestData
						);
						const res = await response.json();
						console.log(res);

						//mints the corresponding amount of nfts
						const requestData2 = {
							method: "POST",
							header: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								metadata: {
									...metadataToUpload,
									image: res.image,
									properties: {
										files: [
											{
												uri: res.image,
												type: "image/png",
											},
										],
										creators: creators,
										category: "image",
									},
								},
								uri: res.json,
								collection: collection,
							}),
						};
						let nftsMinted: string[] = [];
						console.log(nftsMinted);
						for (let i = 0; i < quantity; i++) {
							alert.removeAll();
							alert.info(`Minting NFT #${i + 1}/${quantity}`);
							var response2 = await fetch("./api/mintNFT", requestData2);
							const res2 = await response2.json();
							if (res2.mint !== "failed") {
								nftsMinted.push(res2.mint);
							} else if (res2.mint === "failed") {
								try {
									await response2.json();
								} catch (e) {
									alert.removeAll();
									alert.info(
										"Failed to read a mint address, retrying the remaining balance..."
									);
									await wait(2000);
									alert.removeAll();
									alert.info(
										`Minting NFT #${i - nftsMinted?.length + 1}/${quantity}`
									);
									var response2 = await fetch("./api/mintNFT", requestData2);
									const res2 = await response2.json();
									if (res2.mint !== "failed") {
										nftsMinted.push(res2.mint);
									}
								}
							}
						}

						//if there is a special image just for store
						if (file2) {
							//gets base64 data for second image
							let reader2 = new FileReader();
							reader2.readAsBinaryString(file2);
							reader2.onload = async function () {
								//@ts-ignore
								let base64_data2 = await window.btoa(reader2.result!);
								if (base64_data2) {
									//uploads second image to arweave
									const requestData2 = {
										method: "POST",
										header: {
											"Content-Type": "application/json",
										},
										body: new URLSearchParams({
											base64image: base64_data2,
											metadata: JSON.stringify(null),
										}),
									};
									var response2 = await fetch(
										"https://upgradestation.fracturedapes.com/uploadMetadataForMint",
										requestData2
									);
									const res2 = await response2.json();

									console.log(nftsMinted);
									//writes new traits to database
									const newTraitDocID = await writeAPI(
										publicKey?.toBase58()!,
										"addTrait",
										null,
										{
											costSOL: +costSOL,
											costMango: +costMango,
											costJelly: +costJelly,
											costPuff: +costPuff,
											cost: +cost,
											metadata: JSON.stringify({
												...metadataToUpload,
												image: res.image,
												properties: {
													files: [
														{
															uri: res.image,
															type: "image/png",
														},
													],
													creators: creators,
													category: "image",
												},
											}),
											hashlist: JSON.stringify(nftsMinted),
											image: res2.image,
											quantity: quantity,
											available: available,
										}
									);
									if (newTraitDocID) {
										setStoreItems([
											...storeItems,
											{
												id: newTraitDocID.info,
												data: {
													costSOL: +costSOL,
													costMango: +costMango,
													costJelly: +costJelly,
													costPuff: +costPuff,
													cost: +cost,
													metadata: JSON.stringify({
														...metadataToUpload,
														image: res.image,
														properties: {
															files: [
																{
																	uri: res.image,
																	type: "image/png",
																},
															],
															creators: creators,
															category: "image",
														},
													}),
													hashlist: JSON.stringify(nftsMinted),
													image: res2.image,
													quantity: quantity,
													available: available,
												},
											},
										]);
										alert.removeAll();
										alert.success(`Success!`);
									}
								}
							};

							//does same exact thing as above, only it uses the on chain image for store
						} else {
							//construct json
							let localMetadata = {
								...metadataToUpload,
								image: res.image,
								properties: {
									creators: metadataToUpload.properties.creators,
									files: [{ uri: res.image, type: "image/png" }],
								},
							};

							//writes new traits to database
							console.log(nftsMinted);
							const newTraitDocID = await writeAPI(
								publicKey?.toBase58()!,
								"addTrait",
								null,
								{
									costSOL: +costSOL,
									costMango: +costMango,
									costJelly: +costJelly,
									costPuff: +costPuff,
									cost: +cost,
									metadata: JSON.stringify(localMetadata),
									hashlist: JSON.stringify(nftsMinted),
									image: res.image,
									quantity: quantity,
									available: available,
								}
							);
							if (newTraitDocID) {
								setStoreItems([
									...storeItems,
									{
										id: newTraitDocID.info,
										data: {
											costSOL: +costSOL,
											costMango: +costMango,
											costJelly: +costJelly,
											costPuff: +costPuff,
											cost: +cost,
											metadata: JSON.stringify(localMetadata),
											hashlist: JSON.stringify(nftsMinted),
											image: res.image,
											quantity: quantity,
											available: available,
										},
									},
								]);
								alert.removeAll();
								alert.success(`Success!`);
							}
						}
					}
				};
				reader.readAsBinaryString(file);
			};

			return (
				<div className="mintNFT">
					<div className="inputRow imagesRow">
						<input
							id="imgUpload"
							type="file"
							style={{ display: "none" }}
							onChange={(e) => setFile(e.target.files[0])}
						/>
						<label htmlFor="imgUpload" className="uploadImage">
							{file ? (
								<img src={URL.createObjectURL(file)} />
							) : (
								<>
									<AiOutlineUpload />
									<h1>Upload NFT Store Image</h1>
								</>
							)}
						</label>
						<input
							id="imgUpload2"
							type="file"
							style={{ display: "none" }}
							onChange={(e) => setFile2(e.target.files[0])}
						/>
						<label htmlFor="imgUpload2" className="uploadImage">
							{file2 ? (
								<img src={URL.createObjectURL(file2)} />
							) : (
								<>
									<AiOutlineUpload />
									<h1>Upload Image Used For Generation</h1>
								</>
							)}
						</label>
					</div>
					<div className="nftInformation">
						<div className="inputRow">
							<h1>Name</h1>
							<input
								type="text"
								value={name}
								placeholder="Name"
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="inputRow">
							<h1>Symbol</h1>
							<input
								type="text"
								value={symbol}
								placeholder="Symbol"
								onChange={(e) => setSymbol(e.target.value)}
							/>
						</div>
						<div className="inputRow">
							<h1>Royalty %</h1>
							<input
								type="number"
								step={0.1}
								min={0}
								placeholder="Royalty % (Max 50%)"
								onChange={(e) => setRoyalties(+e.target.value)}
							/>
						</div>
						<div className="inputRow">
							<h1>Collection</h1>
							<input
								type="text"
								value={collection}
								placeholder="Collection Address"
								onChange={(e) => setCollection(e.target.value)}
							/>
						</div>
						<div>
							<h1>Collection Address</h1>
							<ul>
								<li className="text-white">
									Chimps: BzNwS8jm41n9MPoqVxKmwDK27DaJkscfn66344eHLrGR
								</li>
								<li className="text-white">
									Time Devices: 9WYY1hsAgujj8jMHnmPbjAqHjnBXrMFETpBTgrhKSh1y
								</li>
								<li className="text-white">Lost Chimps:</li>
								<li className="text-white">
									Toybox: 8MguWvQQrqi2nqF2vLQGTMzoYjK9xSen8oqxPUQ89Jw6
								</li>
								<li className="text-white">
									Sci-Fi: 4TTf6hMf6NPsQFUfwNT957WgCC8pDpSGWxUycf3aivCP
								</li>
							</ul>
						</div>
						<div className="inputRow">
							<h1>Description</h1>
							<textarea
								value={description}
								placeholder="Description"
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
						<div className="inputRow">
							<h1>Attributes</h1>
							{attributes.map((o, index: number) => (
								<Attribute
									attribute={o}
									index={index}
									key={JSON.stringify(o) + Math.random().toFixed(10)}
								/>
							))}
							<AddAttribute />
						</div>
						<div className="inputRow">
							<h1>Creators</h1>
							{creators.map((o, index: number) => (
								<Creator
									creator={o}
									index={index}
									key={JSON.stringify(o) + Math.random().toFixed(10)}
								/>
							))}
							<AddCreator />
						</div>
						<div className="inputRow">
							<h1>Store Info</h1>
							<div className="attributeRow flex">
								<input
									className="w-[6rem]"
									type="number"
									step={1}
									min={0}
									placeholder="Quantity"
									onChange={(e) => setQuantity(+e.target.value)}
								/>
								<input
									className="w-[6rem]"
									type="number"
									step={0.1}
									min={0}
									placeholder="SOL Cost"
									onChange={(e) => setCostSOL(+e.target.value)}
								/>
								<input
									className="w-[6rem]"
									type="number"
									step={0.1}
									min={0}
									placeholder="PLTMX Cost"
									onChange={(e) => setCost(+e.target.value)}
								/>
								<input
									className="w-[6rem]"
									type="number"
									step={0.1}
									min={0}
									placeholder="Jelly Cost"
									onChange={(e) => setJelly(+e.target.value)}
								/>
								<input
									className="w-[6rem]"
									type="number"
									step={0.1}
									min={0}
									placeholder="Mango Cost"
									onChange={(e) => setMango(+e.target.value)}
								/>
								<input
									className="w-[6rem]"
									type="number"
									step={0.1}
									min={0}
									placeholder="Puff Cost"
									onChange={(e) => setPuff(+e.target.value)}
								/>
							</div>
						</div>
						<div className="inputRow">
							<h1>Available in store?</h1>
							<div className="attributeRow">
								<button
									onClick={() => setAvailable(true)}
									style={available ? {} : { opacity: 0.3 }}>
									Yes
								</button>
								<button
									onClick={() => setAvailable(false)}
									style={!available ? {} : { opacity: 0.3 }}>
									No
								</button>
							</div>
						</div>
						<button
							onClick={() => (confirm ? mintNFTs() : setConfirm(true))}
							className="mintNFTsButton">
							{confirm ? "Are you sure?" : "Mint & Add To Store"}
						</button>
					</div>
				</div>
			);
		};

		// const EditHashlist = () => {
		//     const [edit, setEdit]: any = useState(false)
		//     const [hashlist, setHashlist]: any = useState(smoothiesHashlist)

		//     const confirmChange = async() => {
		//         await writeAPI(publicKey?.toBase58()!, "editHashlist", null, hashlist)
		//         setSmoothiesHashlist(hashlist)
		//     }

		//     return (
		//         <>
		//             <button onClick={() => setEdit(!edit)} className="editSmoothie">Edit Smoothie Hashlist</button>
		//             {edit && (
		//                 <>
		//                     <div className="itemBox">
		//                         <div className="row">
		//                             <div className="itemBoxInner">
		//                                 <div><h1>* Hashlist (JSON Array):</h1><textarea value={hashlist} onChange={(e) => setHashlist(e.target.value)} /></div>
		//                             </div>
		//                         </div>
		//                         <button onClick={() => confirmChange()}>Confirm</button>
		//                     </div>
		//                 </>
		//             )}
		//         </>
		//     )
		// }

		return (
			<>
				<div className="addTraitItems">
					{/* <EditHashlist /> */}
					<h1 style={{ color: "#fff" }} className="traitTitle">
						Manually Add Item To the store
					</h1>
					<AddItem2 />
					<h1 style={{ color: "#fff" }} className="traitTitle">
						Mint New Item To the store
					</h1>
					<AddItem />
					<h1 style={{ color: "#fff" }} className="traitTitle">
						Edit Items
					</h1>
					<div className="traitGrid">
						{storeItems.map((item, index) => {
							return (
								<IndivItem key={item + index + 3} item={item} index={index} />
							);
						})}
					</div>
				</div>
			</>
		);
	};

	return (
		<>
			<Head>
				<title>Inventory Panel | TTCC </title>
				<link rel="shortcut icon" type="image/png" href="/logo.png" />
				<link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
				<link rel="apple-touch-icon" sizes="512x512" href="/logo.png" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#000000" />
				<meta name="fortmatic-site-verification" content="j93LgcVZk79qcgyo" />
			</Head>
			<div className="container">
				<div className={styles.main}>
					<div className="navbar">
						{publicKey ? (
							<div className="mr-2">
								<div className="selectSession">
									<button
										onClick={() => router.push("/")}
										style={{ background: "#FFFFFF", color: "#B7B7B7" }}
										className="bigButtons">
										Back to Home
									</button>
								</div>
							</div>
						) : null}
						<div className="flex">
							<WalletMultiButton />
						</div>
					</div>

					{authenticatedUser ? (
						<div className="adminScreen">
							<AddTraitItems />
						</div>
					) : (
						<div className="adminScreen">
							<h1 className="notAuthorized">Not Authorized</h1>
							<Login />
						</div>
					)}
				</div>
				{loading !== false && (
					<div className="loading">
						Adding hashlist to database... {loading}
					</div>
				)}
			</div>
		</>
	);
}
