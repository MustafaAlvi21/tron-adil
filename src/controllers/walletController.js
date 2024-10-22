const TronWeb = require('tronweb');
const { tronWeb, transferCoin } = require("../utils/tron")
const { checkUserWallet, createLog, getAllLog, getAllWithdrawRequest, checkLog, updateWithdraw, checkWithdrawRequest, AddUserWallet, updateWallet, createWithdrawRequest } = require("../services/wallet-services-MongoDB")





async function approveAdmin(_privateKey, amount) {
    try {
        const USDT_CONTRACT_ADDRESS = process.env.Contract_Address; // Replace with actual USDT contract address
        const adminAddress = process.env.ADMIN_WALLET_ADDRESS; // Replace with the admin's address

        // Initialize TronWeb for temporarily
        const __tronWeb = await new TronWeb({
            fullNode: process.env.NetworkURL, // Replace with your full node
            solidityNode: process.env.NetworkURL, // Replace with your solidity node
            eventServer: process.env.NetworkURL, // Replace with your event server
            headers: { 'TRON-PRO-API-KEY': process.env.TronApiKey },
            privateKey: _privateKey // User's private key
        });


        // Get the contract instance
        const contract = await __tronWeb.contract().at(USDT_CONTRACT_ADDRESS);

        // Approve admin to spend USDT tokens
        const result = await contract.methods.approve(adminAddress, amount.toString())
            .send({
                from: __tronWeb.address.fromPrivateKey(_privateKey)
            });

        console.log('Approval successful:', result);

    } catch (error) {
        console.error('Error approving admin:', error);
        throw error
    }
}

async function transferTRX(toAddress, amount) {
    try {
        // Convert amount to SUN (1 TRX = 1 * 10^6 SUN)
        const amountInSun = tronWeb.toSun(amount);

        // Send TRX
        const result = await tronWeb.trx.sendTransaction(toAddress, amountInSun);

        console.log('Transaction successful:', result);
    } catch (error) {
        console.error('Error transferring TRX:', error);
        throw error
    }
}

const createTronWallet = async (req, res) => {
    try {
        const data = req.body

        if (!data.userId || data.userId == null || data.userId == "" || typeof data.userId == undefined) throw "User Id is required"

        const checkUser = await checkUserWallet({ userId: data.userId })


        if (checkUser !== null) throw "User Wallet Already Exist"

        // 1: new wallet created
        const account = await tronWeb.createAccount();


        // 2: here trx will transfers to "new wallet"
        await transferTRX(account.address.base58, 50);


        // 3: here "new wallet" will approve admin wallet as a delegate
        await approveAdmin(account.privateKey, tronWeb.toSun(10000000000)); // Amount in SUN (1 USDT = 1 * 10^6 SUN)


        // 4: now new user will create in db and "new account" is linked with it.
        await AddUserWallet({
            userId: data.userId,
            privateKey: account.privateKey,
            publicKey: account.publicKey,
            address: account.address.base58,
        })



        return res.status(200).json({
            success: true, publicKey: account.publicKey, address: account.address.base58,
        })

    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}

const clearDeposit = async (req, res) => {
    try {
        const data = req.body

        if (!data.userId || data.userId == null || data.userId == "" || typeof data.userId == undefined) throw "User Id is required"

        const checkUser = await checkUserWallet({ userId: data.userId })
        if (checkUser == null) throw "User not found"

        await updateWallet({ userId: checkUser.userId }, { depositedAmount: 0 })

        return res.status(200).json({
            success: true, meesage: "Deposit is now zero",
        })

    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





const getUserWallet = async (req, res) => {
    try {
        const { userId } = req.query

        if (!userId || userId == null || userId == "" || typeof userId == undefined) {
            throw "User Id is required"
        }

        const checkUser = await checkUserWallet({ userId: userId })

        if (checkUser === null) {
            throw "No Wallet Found!"
        }
        return res.status(200).json({ success: true, message: checkUser })
    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





const WithdrawRequest = async (req, res) => {
    try {
        const data = req.body

        if (!data.userId || data.userId == "" || data.userId == null || typeof data.userId == undefined) {
            throw "User Id is required !"
        }

        // receiveraddress
        if (!data.wallet || data.wallet == "" || data.wallet == null || typeof data.wallet == undefined) {
            throw "Wallet Address is required !"
        }

        if (!data.RequestedAmount || data.RequestedAmount == "" || data.RequestedAmount == null || parseInt(data.RequestedAmount) < 0 || typeof data.RequestedAmount == undefined) {
            throw "Amount is required !"
        }

        const checkAmount = await checkUserWallet({ userId: data.userId })

        console.log("checkAmount", checkAmount);

        if (checkAmount == null) throw "Invalid user Id"

        if (checkAmount.depositedAmount < parseInt(data.RequestedAmount)) throw "Insufficient Amount"

        await createWithdrawRequest(data)
        return res.status(200).json({ success: true, message: "Withdraw request submitted" })

    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





const withdrawAction = async (req, res) => {
    try {
        const data = req.body;

        if (!data.receipientWallet || !data.receipientWallet.trim()) throw "receipient wallet is required!";
        if (!data.requestedAmount || !data.requestedAmount.trim()) throw "requested amount is required!";

        const tranferToken = await transferCoin(data.receipientWallet, data.requestedAmount);
        console.log("tranferToken", tranferToken);

        if (tranferToken.success) {
            let retryCount = 0;
            const maxRetries = 4;
            let transactionDetails;

            while (retryCount < maxRetries) {
                try {
                    transactionDetails = await tronWeb.trx.getTransaction(tranferToken.message);
                    break; // Break out of loop if successful

                } catch (err) {
                    console.error(`Error fetching transaction details (Attempt ${retryCount + 1}):`, err);
                    retryCount++;
                }
            }

            if (!transactionDetails) throw "Transaction details not found after retries";
            console.log("Transaction Details:", transactionDetails);

            if (transactionDetails.ret[0].contractRet === "SUCCESS") {
                return res.status(200).json({ success: true, message: "Request Approved" });

            } else {
                throw "Transaction Failed";
            }

        } else {
            throw "Error in Transfer Coin";
        }

    } catch (e) {
        console.error("Error: ", e);
        return res.status(400).json({ success: false, message: e });
    }
};





// const withdrawAction = async (req, res) => {
//     try {
//         const data = req.body;

//         if (!data.action || !data.action.trim()) throw "Action is required!";

//         if (!data.withdrawId || !data.withdrawId.trim()) throw "Withdraw Id is required!";

//         const checkRequest = await checkWithdrawRequest({ _id: data.withdrawId });
//         if (!checkRequest) throw "Invalid Request!";

//         if (checkRequest.status === "approve" || checkRequest.status === "reject") throw "Request Already Processed";

//         if (data.action === "reject") {
//             const response = await updateWithdraw({ _id: data.withdrawId }, { status: "reject" });
//             return res.status(200).json({ success: true, message: "Request Rejected" });
//         }

//         if (data.action === "approve") {
//             const checkWallet = await checkUserWallet({ userId: checkRequest.userId });

//             if (checkRequest.RequestedAmount > checkWallet.depositedAmount) throw "Insufficient Amount";

//             const tranferToken = await transferCoin(checkRequest.wallet, checkRequest.RequestedAmount);
//             // const tranferToken = await transferCoin("TBjHv78TgWkCq1N4VpmFRTtZmG8sJjqgCB", 100);

//             console.log("tranferToken", tranferToken);

//             if (tranferToken.success) {
//                 let retryCount = 0;
//                 const maxRetries = 4;
//                 let transactionDetails;

//                 while (retryCount < maxRetries) {
//                     try {
//                         transactionDetails = await tronWeb.trx.getTransaction(tranferToken.message);
//                         break; // Break out of loop if successful

//                     } catch (err) {
//                         console.error(`Error fetching transaction details (Attempt ${retryCount + 1}):`, err);
//                         retryCount++;
//                     }
//                 }

//                 if (!transactionDetails) throw "Transaction details not found after retries";
//                 console.log("Transaction Details:", transactionDetails);

//                 if (transactionDetails.ret[0].contractRet === "SUCCESS") {
//                     const getPrevAmount = await checkUserWallet({ userId: checkRequest.userId })
//                     const update = await updateWallet({ userId: checkRequest.userId }, { depositedAmount: parseFloat(getPrevAmount.depositedAmount) - parseFloat(checkRequest.RequestedAmount) })
//                     // const updateUserWallet = await updateWallet({ userId: checkRequest.userId }, { $inc: { depositedAmount: - parseFloat(checkRequest.RequestedAmount) } });
//                     const updateWithdrawRequest = await updateWithdraw({ _id: data.withdrawId }, { status: "approve" });
//                     return res.status(200).json({ success: true, message: "Request Approved" });

//                 } else {
//                     throw "Transaction Failed";
//                 }

//             } else {
//                 throw "Error in Transfer Coin";
//             }
//         }

//     } catch (e) {
//         console.error("Error: ", e);
//         return res.status(400).json({ success: false, message: e });
//     }
// };





async function getUSDTTransferDetails(txHash) {
    try {
        const tx = await tronWeb.trx.getTransaction(txHash);

        if (tx.raw_data && tx.raw_data.contract && tx.raw_data.contract.length > 0) {
            const contractData = tx.raw_data.contract[0];

            if (contractData.type === 'TriggerSmartContract') {
                const inputData = contractData.parameter.value.data;

                // Check if it's a transfer function (function signature for transfer: a9059cbb)
                if (inputData.startsWith('a9059cbb')) {
                    const toAddress = '41' + inputData.substr(32, 40);
                    const amount = BigInt('0x' + inputData.substr(72));

                    return {
                        from: tronWeb.address.fromHex(contractData.parameter.value.owner_address),
                        to: tronWeb.address.fromHex(toAddress),
                        amount: amount.toString()
                    };
                }
            }
        }

        throw new Error('Not a valid USDT transfer transaction');
    } catch (error) {
        console.error('Error decoding transaction:', error);
        throw error;
    }
}

const claimTransaction = async (req, res) => {

    try {
        const data = req.body
        if (!data.tx || data.tx == "" || data.tx == null || typeof data.tx == undefined) throw "Tx Id is required"
        if (!data.wallet || data.wallet == "" || data.wallet == null || typeof data.wallet == undefined) throw "Wallet Id is required"

        // Check if the transaction has already been processed
        const isTxFound = await checkLog({ tx: data.tx, wallet: data.wallet });
        if (isTxFound) {
            console.log("Tx is already added");
            return res.status(200).json({ success: true, message: "Tx is already added" })

        } else {

            const checkUser = await checkUserWallet({ address: data.wallet })
            if (checkUser == null) throw "user not found"

            // Usage
            const txDetails = await getUSDTTransferDetails(data.tx)
                .then(details => {
                    console.log('Transfer Details:');
                    console.log('From:', details.from);
                    console.log('To:', details.to);
                    console.log('Amount:', tronWeb.fromSun(details.amount));

                    return details;
                })
                .catch(error => {
                    console.error('Error:', error)
                    throw error
                });


            if (data.wallet == txDetails.to) {
                await createLog({
                    userId: checkUser.userId,
                    wallet: data.wallet,
                    tx: data.tx,
                    status: "success",
                    amount: tronWeb.fromSun(txDetails.amount)
                })

                await updateWallet({ address: data.wallet }, { newDeposit: 1, depositedAmount: parseFloat(checkUser.depositedAmount) + parseFloat(tronWeb.fromSun(txDetails.amount)) })
                return res.status(200).json({ success: true, message: "Tx deposited" })

            } else {
                return res.status(400).json({ success: false, message: "Invalid request" })

            }
        }
    }

    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





const getAllLogsByUser = async (req, res) => {
    try {
        const { userId } = req.query
        let p = {}

        if (userId && userId !== null && userId !== "" && typeof userId !== undefined) {
            p.userId = userId
        }

        const allLogs = await getAllLog(p)
        if (allLogs.length == 0) throw "No logs Found"

        return res.status(200).json({ success: true, message: allLogs })

    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





const getAllRequestByUser = async (req, res) => {
    try {
        const { userId } = req.query

        let p = {}

        if (userId && userId !== null && userId !== "" && typeof userId !== undefined) {
            p.userId = userId
        }


        const allLogs = await getAllWithdrawRequest(p)

        if (allLogs.length == 0) {
            throw "No requests found"
        }

        return res.status(200).json({ success: true, message: allLogs })
    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e })
    }
}





module.exports = {
    createTronWallet,
    clearDeposit,
    WithdrawRequest,
    withdrawAction,
    claimTransaction,
    getAllLogsByUser,
    getAllRequestByUser,
    getUserWallet,
}