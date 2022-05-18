require('dotenv').config()
const { expect } = require("chai");
const axios = require('axios') // 
const {create} = require('ipfs-http-client') // 
const entryPointHttp = 'http://127.0.0.1:8080/ipfs/' // process.env.IPFS
const entryPoint = '/ip4/127.0.0.1/tcp/5001' // process.env.IPFS
/* const ipfs = require("nano-ipfs-store").at("http://127.0.0.1:8080"); */

// const { useSelector } = require('react-redux') 


describe("test for ipfs", function () {
	it("put data", async function () {
		try {
			// const G = await useSelector(state => state) 
			const client = await create(entryPoint)
			
			const data = 
			// G.articles
			[
				{
					title: 'Kovan Testnet Ether 1500~3000 for online free crypto game', 
					contents: `Hello dear
					I’m blockchain and smart contract developer.
					we are going to make the online free game that deposit kovan and ropstern ETH.
					Our develop team has lots of experience in blockchain and smart contract.
					Now, Dapp and lots of crypto gambling games exist, but it is not free so all people can’t enjoy it.
					so our team will make the online free game that deposit kovan and ropstern ETH.`
				},
				{
					title: 'I need 1000 KETH more, please help me', 
					contents: `hello, man.
					I had posted once for requesting 1000 KETH, so I have received and thanksful about it really.
					by the way, I need 1000 more, so I wrote again, but not responding.
					can you help me once more, then I will no need anymore.
					because that’s enough for us.
					please help me.
					thanks`
				},
				{
					title:"hkjhkjhkjhkjh"
				}
			]
			
			console.log("data:", data)
			const contents = JSON.stringify(data)
			const cid = await client.add(contents)
			console.log(cid)
			const response = await axios(entryPointHttp + cid.path);
			const json = response.data
			console.log(json)
			/* const result = await client.get(cid.path)
			console.log(result)
			const buf = await result.get() */
			// create a string to append contents to
			/* let note = ""
			// loop over incoming data
			for await(const item of result){
				// turn string buffer to string and append to contents
				note += new TextDecoder().decode(item)
			}
			console.log(note) */

			/* console.log(await client.cat(cid)); */
			expect(cid!==null, "valid")
		} catch (err) {
			console(err)
		}
	})
});