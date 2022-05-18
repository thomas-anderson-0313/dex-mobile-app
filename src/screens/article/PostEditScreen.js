import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, AsyncStorage, } from 'react-native';
import {
	actions,
	defaultActions,
	RichEditor,
	RichToolbar,
} from "react-native-pell-rich-editor";
import HTMLView from "react-native-htmlview";
import * as ImagePicker from 'expo-image-picker';
import * as VideoPicker from 'expo-image-picker';
import { block } from 'react-native-reanimated';
import { TextInput } from 'react-native-paper';

/*======for IPFS========*/
import { create } from "ipfs-http-client"
// const {create} = require('ipfs-http-client')

import { useSelector, useDispatch } from 'react-redux';
import slice from '../../../reducer';

import { getProfile } from '../../core/model';


const PostEditScreen = ({ navigation }) => {

	const dispatch = useDispatch();
	const update = (json) => dispatch(slice.actions.update(json));

	const G = useSelector(state => state)
	const strikethrough = require("../../assets/strikethrough.png"); //icon for strikethrough
	const RichText = useRef(); //reference to the RichEditor component
	const [articleContent, setArticleContent] = useState("");
	const [articleTitle, setArticleTitle] = useState("");
	const [topicImage, setTopicImage] = useState("");

	const { avatar, fullName } = useSelector(state => state);

	const pickTopicImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
			base64: true,
		});

		//   await AsyncStorage.setItem("desocial@0313/topicImageUri", result.uri)
		console.log(result);

		if (!result.cancelled) {
			setTopicImage(result.uri);
			// console.log(image)
		}
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [5, 4],
			quality: 1,
			base64: true,
			width: 0,
			height: 20
		})
		// let img = Image.resolveAssetSource({uri:result.uri, width:100, height:100}).uri;
		if (!result.cancelled) {
			RichText.current?.insertImage(
				// "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png"
				result.uri
			);
			console.log(result.uri)
		}
	};

	const pickVideo = async () => {
		let result = await VideoPicker.launchImageLibraryAsync({
			mediaTypes: VideoPicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
			base64: true,
		});
		// let img = Image.resolveAssetSource({uri:result.uri}).uri;

		if (!result.cancelled) {
			RichText.current?.insertVideo(
				// "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png"
				result.uri
			);
			console.log(result.uri)
		}
	};

	// this function will be called when the editor has been initialized
	function editorInitializedCallback() {
		RichText.current?.registerToolbar(function (items) {
			// items contain all the actions that are currently active
			console.log(
				"Toolbar click, selected items (insert end callback):",
				items,
			);
		});
	}
	function handleHeightChange(height) {
		// console.log("editor height change:", height);
	}

	//   function onPressAddImage() {
	//     // you can easily add images from your gallery
	//     RichText.current?.insertImage(
	//       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png"
	//     );
	//   }

	//   function insertVideo() {
	//     // you can easily add videos from your gallery
	//     RichText.current?.insertVideo(
	//       "https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4"
	//     );
	//   }

	const postArticle = async () => {
		if (!articleContent || !articleTitle || !topicImage) {
			if (!articleContent) {
				alert("Your Article is Empty now !")
				return
			}
			if (!articleTitle) {
				alert("Add your Title!")
				return
			}
			if (!topicImage) {
				alert("have to add an image for the topic!")
				return
			}
			return
		} else {
			const storedAmount = (await getProfile()).postsAmount;
			if (storedAmount === null) {
				await AsyncStorage.setItem("desocial@0313/postsAmount", "1")
			} else {
				const amount = !isNaN(storedAmount) ? Number(storedAmount) : 0;
				await AsyncStorage.setItem("desocial@0313/postsAmount", String(amount + 1))
				update({ postsAmount: String(amount + 1) })
			}
			const curTime = new Date().toLocaleString();
			const post = { title: articleTitle, topicImage: topicImage, content: articleContent, postedTime: curTime, authorPhoto: avatar, authorName: fullName, followingAmount: 0 };

			const articles = (G.articles).concat(post);

			/*==========================store datas to IPFS=====================*/
			// await AsyncStorage.setItem("desocial@0313/article", JSON.stringify(articles))
			const entryPoint = '/ip4/192.168.115.162/tcp/5001' // process.env.IPFS
			const client = await create(entryPoint)

			// const data = 
			// // G.articles
			// [
			// 	{
			// 		title: 'Kovan Testnet Ether 1500~3000 for online free crypto game', 
			// 		contents: `Hello dear
			// 		I’m blockchain and smart contract developer.
			// 		we are going to make the online free game that deposit kovan and ropstern ETH.
			// 		Our develop team has lots of experience in blockchain and smart contract.
			// 		Now, Dapp and lots of crypto gambling games exist, but it is not free so all people can’t enjoy it.
			// 		so our team will make the online free game that deposit kovan and ropstern ETH.`
			// 	},
			// 	{
			// 		title: 'I need 1000 KETH more, please help me', 
			// 		contents: `hello, man.
			// 		I had posted once for requesting 1000 KETH, so I have received and thanksful about it really.
			// 		by the way, I need 1000 more, so I wrote again, but not responding.
			// 		can you help me once more, then I will no need anymore.
			// 		because that’s enough for us.
			// 		please help me.
			// 		thanks`
			// 	}
			// ]

			// console.log("data:", data)
			const contents = JSON.stringify(articles)
			const cid = await client.add(contents)
			console.log(cid)
			alert(cid)

			update({ articles: articles })
			navigation.replace('PostViewScreen')
		}
	}

	return (
		<View>
			<View style={styles.topBar}>
				<TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
					<Image style={styles.image} source={require('../../assets/arrow_back.png')} />
				</TouchableOpacity>
				<Text style={styles.topBarText}>Write New Article</Text>
				<TouchableOpacity onPress={postArticle} style={{ marginLeft: "25%" }}>
					<Image source={require("../../assets/post.png")} style={{ width: 30, height: 30, }} />
				</TouchableOpacity>
			</View>
			<Text style={styles.text}>Draft for new article...</Text>
			<RichToolbar
				style={styles.richBar}
				editor={RichText}
				disabled={false}
				iconTint={"#333333"}
				selectedIconTint={"blue"}
				disabledIconTint={"grey"}
				onPressAddImage={pickImage}
				iconSize={25}
				actions={[
					actions.undo,
					actions.redo,
					actions.keyboard,
					// "insertVideo",
					actions.insertVideo,
					actions.insertImage,
					// ...defaultActions,
					actions.setBold,
					actions.setItalic,
					actions.setUnderline,
					actions.alignLeft,
					actions.alignCenter,
					actions.alignRight,
					actions.alignFull,
					actions.removeFormat,
					actions.insertOrderedList,
					actions.insertBulletsList,
					actions.indent,
					actions.outdent,
					actions.insertLink,
					actions.checkboxList,
					actions.setStrikethrough,
					actions.heading1,
					actions.heading3,
					actions.blockquote,
					actions.code,
					actions.setSuperscript,
					actions.setSubscript,
				]}
				// map icons for self made actions
				iconMap={{
					[actions.heading1]: ({ tintColor }) => (
						<Text style={[styles.tib, { color: tintColor }]}>H1</Text>
					),
					[actions.heading3]: ({ tintColor }) => (
						<Text style={[styles.tib, { color: tintColor }]}>H3</Text>
					),
					[actions.setStrikethrough]: strikethrough,
				}}
				insertVideo={pickVideo}
			/>
			{/* <RichEditor
										disabled={false}
										containerStyle={styles.editorTitle}
										// ref={RichText}
										style={styles.richTitle}
										placeholder={"Your title"}
										onChange={(text) => setArticleTitle(text)}
										editorInitializedCallback={editorInitializedCallback}
										onHeightChange={handleHeightChange}
								/> */}
			<TextInput
				value={articleTitle}
				onChangeText={(text) => setArticleTitle(text)}
				style={styles.richTitle}
				placeholder={"Your title"}
				placeholderTextColor="white"
			/>
			<ScrollView style={styles.container}>
				{topicImage ?
					<TouchableOpacity style={{ width: "70%", height: 180, marginLeft: "15%", marginTop: 15, }} onPress={pickTopicImage}>
						<Image source={{ uri: topicImage }} style={{ width: "100%", height: 180 }} />
					</TouchableOpacity> :
					<TouchableOpacity style={{ width: "70%", height: 180, backgroundColor: "#e6e6e6", marginLeft: "15%", marginTop: 15, }} onPress={pickTopicImage}>
						<Image source={require("../../assets/image.png")} style={{ width: 40, height: 40, marginTop: 50, marginLeft: "40%" }} />
						<Text style={{ textAlign: "center", fontSize: 12, }}>
							<Text style={{ textDecorationLine: "underline", color: "blue" }} onPress={pickTopicImage}>include</Text>
							<Text> an image to express the topic of your article.</Text>
						</Text>
					</TouchableOpacity>

				}
				<RichEditor
					disabled={false}
					containerStyle={styles.editorArticle}
					ref={RichText}
					style={styles.richArticle}
					placeholder={"Edit your Article..."}
					onChange={(text) => setArticleContent(text)}
					editorInitializedCallback={editorInitializedCallback}
					onHeightChange={handleHeightChange}
				/>
			</ScrollView>
		</View>
	);
}


export default PostEditScreen;
const styles = StyleSheet.create({
	a: {
		fontWeight: "bold",
		color: "purple",
	},
	div: {
		fontFamily: "monospace",
	},
	p: {
		fontSize: 30,
	},
	container: {
		marginTop: 10,
		height: 350,
	},
	editorTitle: {
		borderBottomColor: "black",
		borderBottomWidth: 1,
		marginLeft: "5%",
		width: "90%",
	},
	editorArticle: {
		borderLeftColor: "black",
		borderLeftWidth: 1,
		marginLeft: "5%",
		width: "90%",
		marginTop: 10,
	},
	richTitle: {
		height: 60,
		fontSize: 30,
		textAlign: "center",
		backgroundColor: "#737373",
		color: "green",
		// flex: 1,
	},
	richArticle: {
		// minHeight: 1000,
		// height:2000,
		// flex: 1,
	},
	richBar: {
		height: 50,
		backgroundColor: "white",
	},
	text: {
		fontSize: 17,
		color: "grey",
		marginTop: 10,
	},
	tib: {
		textAlign: "center",
		color: "#515156",
	},
	image: {
		width: 24,
		height: 24,
		marginLeft: 15,
	},
	topBar: {
		flexDirection: "row",
		marginTop: 40,
	},
	topBarText: {
		marginLeft: 15,
		fontSize: 20,
	},
	submitIcon: {
		width: 24,
		height: 24,
	},
	title: {
		color: "red",
	}
})