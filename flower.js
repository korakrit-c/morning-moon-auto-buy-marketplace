const ethers = require('ethers');
const { ABI_MarketPlace } = require("./abi.js")
const { Flower } = require("./FlowerList.js")

const hostIPFS = "https://ipfs.morningmoonvillage.com/ipfs/"
const HTTP_PROVIDER_LINK = "https://rpc.bitkubchain.io"
const provider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER_LINK);
const privateKey = "";

const wallet = new ethers.Wallet(privateKey, provider)

const ExchangeToken = {
    LUMI: new ethers.Contract("0x95013Dcb6A561e6C003AED9C43Fb8B64008aA361", [
        "function balanceOf(address account) external view returns (uint256)"
    ], wallet),
    KKUB: new ethers.Contract("0x67eBD850304c70d983B2d1b93ea79c7CD6c3F6b5", [
        "function balanceOf(address tokenOwner) external view returns (uint256 balance)"
    ], wallet)
}

const Contract = {
    MarketPlace: new ethers.Contract("0x874987257374cAE9E620988FdbEEa2bBBf757cA9", ABI_MarketPlace, wallet),
    MMI: new ethers.Contract("0xd08Ac40b3a0A7fb20b026A3b6Cd5D7cFadc3d6f5", [
        "function tokenURI(uint256 tokenId) external view returns (string memory)",
    ], wallet)
}

async function listingItem(address, tokenId, exchangeToken, price, isKAP) {
    return await Contract.MarketPlace.listingItem(address, tokenId, exchangeToken, price, isKAP);
}

async function tokenURI(tokenId) {
    return await Contract.MMI.tokenURI(tokenURI);
}

async function main() {

    let oldState = 0
    let newState = 0

    provider.on("block", async (blockNumber) => {
        //console.log(`Block Number : ${blockNumber}`)
        oldState = newState
        newState = await Contract.MarketPlace.allListingsCount()

        if (newState !== oldState && oldState !== 0) {
            for (let i = oldState; i < newState; i++) {
                console.log(`Checking on Listing ID [${i}]`)
                let toListing = await Contract.MarketPlace.idToListing(i)
                // Validate : Exit Item sold out
                if (toListing[9].toString() !== "0") return
                // Validate : Exit when the token is not LUMI
                if (toListing[3] !== "0x95013Dcb6A561e6C003AED9C43Fb8B64008aA361") return

                let getTokenURI = await Contract.MMI.tokenURI(toListing[2])
                let valuePrice = 1/toListing[4]
                // Primrose
                for (const [ItemKey, ItemValue] of Object.entries(Flower.Primrose)) {
                    if (ItemKey === getTokenURI.replace(hostIPFS, "")) {
                        if (ItemValue > valuePrice) {
                            let expectedPrice = (ItemValue-((ItemValue*5.5)/100))
                            if (expectedPrice > valuePrice) {
                                let trx = await listingItem(toListing[1], toListing[2], toListing[3], toListing[4], toListing[10])
                                console.log(`Sending...\n${trx.hash}`)
                            }
                        }
                        return
                    }
                }

                //Tulip
                for (const [ItemKey, ItemValue] of Object.entries(Flower.Tulip)) {
                    if (ItemKey === getTokenURI.replace(hostIPFS, "")) {
                        if (ItemValue > valuePrice) {
                            let expectedPrice = (ItemValue-((ItemValue*5.5)/100))
                            if (expectedPrice > valuePrice) {
                                let trx = await listingItem(toListing[1], toListing[2], toListing[3], toListing[4], toListing[10])
                                console.log(`Sending...\n${trx.hash}`)
                            }
                        }
                        return
                    }
                }
            }
        }
    })
}

main()
