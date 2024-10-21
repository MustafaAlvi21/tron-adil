const TronWeb = require('tronweb');


const tronWeb = new TronWeb({
    fullHost: process.env.NetworkURL, // testnet
    headers: { 'TRON-PRO-API-KEY': process.env.TronApiKey },
    privateKey: process.env.ACCOUNT_PRIVATE_KEY
});





const contractAddress = process.env.Contract_Address;
const contractABI = [
    { "inputs": [{ "name": "_initialSupply", "type": "uint256" }], "stateMutability": "Nonpayable", "type": "Constructor" },
    { "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "Approval", "type": "Event" },
    { "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "Transfer", "type": "Event" },
    { "outputs": [{ "type": "uint256" }], "inputs": [{ "type": "address" }, { "type": "address" }], "name": "allowance", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "name": "success", "type": "bool" }], "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "stateMutability": "nonpayable", "type": "function" },
    { "outputs": [{ "type": "uint256" }], "inputs": [{ "type": "address" }], "name": "balanceOf", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "uint8" }], "name": "decimals", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "uint256" }], "inputs": [{ "name": "_owner", "type": "address" }], "name": "getBalanceOf", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "uint256" }], "name": "getTotalSupply", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "string" }], "name": "name", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "string" }], "name": "symbol", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "type": "uint256" }], "name": "totalSupply", "stateMutability": "view", "type": "function" },
    { "outputs": [{ "name": "success", "type": "bool" }], "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "stateMutability": "nonpayable", "type": "function" },
    { "outputs": [{ "name": "success", "type": "bool" }], "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "stateMutability": "nonpayable", "type": "function" }
];

// const transferCoin = async (toAddress, amount) => {
//     try {
//         const contractInstance = await tronWeb.contract(contractABI, contractAddress);

//         const transaction = await contractInstance.methods.transfer(toAddress, amount).send();
//         console.log('Transaction:', transaction);
//         return { success: true, message: transaction }
//     } catch (error) {
//         console.error('Error:', error);
//         return { success: false, message: error }
//     }
// }









const myAccount = tronWeb.address.fromPrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
// console.log("myAccount", myAccount);

const tokenAddress = process.env.Contract_Address; // Replace with the SAIM token contract address

async function transferCoin(toAddress, amount) {
    try {
        const contract = await tronWeb.contract().at(tokenAddress);

        const tokenDecimals = 18; // Assuming SAIM token has 18 decimals
        // const tokenAmount = amount * Math.pow(10, tokenDecimals); // Convert amount to token units

        const transaction = await contract.methods.transfer(toAddress, amount.toString()).send({
            from: myAccount,
            // feeLimit: 1_000_000, // Set fee limit based on your transaction needs
        });

        console.log('Transaction ID:', transaction);
        return { success: true, message: transaction }        
    } catch (error) {
        console.error('Error transferring tokens:', error);
        return { success: false, message: error }
    }
}


module.exports = {
    tronWeb,
    transferCoin
}