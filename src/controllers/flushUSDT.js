const { BigNumber } = require('bignumber.js');
const { getWallets, updateWallet } = require("../services/wallet-services-MongoDB");
const { tronWeb } = require("../utils/tron")


const adminAddress = process.env.ADMIN_WALLET_ADDRESS; // Replace with the admin's address
const hotWallet = process.env.HOT_WALLET_ADDRESS; // Replace with the admin's address
const USDT_CONTRACT_ADDRESS = process.env.Contract_Address; // Replace with actual USDT contract address
let contract;




async function flushUSDT() {
    contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);

    const flushAbleWallets = await getWallets({ newDeposit: 1 }, { privateKey: 1, address: 1, userId: 1, newDeposit: 1 })
    console.log("flushAbleWallets", flushAbleWallets);

    // Call the async loop function with a limit of 5
    asyncLoop(flushAbleWallets.length, 0, flushAbleWallets);
}


async function asyncLoop(limit, i = 0, ___wallet) {
    if (i < limit) {
        const wallet = ___wallet[i]

        // Write your code here ⬇⬇⬇
        console.log("----------------------------------");


        const balance = await contract.methods.balanceOf(wallet.address).call()
        console.log("balance", balance);

        const balanceBN = BigNumber(balance._hex);

        const balanceDecimal = balanceBN.toString();
        console.log('Balance in Decimal:', balanceDecimal);



        await contract.methods.transferFrom(wallet.address, hotWallet, balanceDecimal).send({ from: adminAddress })
            .then(data => {
                console.log(data);
                checkTransactionStatus(data, wallet.address)

            })
            .catch(err => {
                console.log("error: ", err);
            })



        asyncLoop(limit, i + 1, ___wallet); // Recursive call with an incremented value
    }
}


// Function to check transaction status
async function checkTransactionStatus(txHash, userWallet) {
    try {

        setTimeout(async () => {

            const transaction = await tronWeb.trx.getTransaction(txHash);
            if (transaction && transaction.ret && transaction.ret[0].contractRet === 'SUCCESS') {
                console.log('Transaction successful:', transaction);
                await updateWallet({ address: userWallet }, { newDeposit: 0 })


            } else {
                console.log('Transaction failed:', transaction);
            }

        }, 20000);


    } catch (error) {
        console.error('Error fetching transaction status:', error);
    }
}



module.exports = flushUSDT