const express = require('express');
const router = express.Router();
const { ApiKeyVerification } = require("../middleware/verifyApiKey")
const { createTronWallet, WithdrawRequest, withdrawAction, claimTransaction, getAllLogsByUser, getAllRequestByUser, getUserWallet, clearDeposit, } = require("../controllers/walletController")



router.post("/generateTronWallet", ApiKeyVerification, createTronWallet)

router.post("/createWithdrawRequest", ApiKeyVerification, WithdrawRequest)

router.post("/clear-deposit", ApiKeyVerification, clearDeposit)

router.post("/withdrawAction-3y78f-348394ufj-jdfbvj", ApiKeyVerification, withdrawAction)

router.post("/claimTx", ApiKeyVerification, claimTransaction)

router.get("/getWalletbyUser", ApiKeyVerification, getUserWallet)

router.get("/getAllLogs", ApiKeyVerification, getAllLogsByUser)

router.get("/getAllRequests", ApiKeyVerification, getAllRequestByUser)



module.exports = router