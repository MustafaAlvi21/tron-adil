const logModel = require("../models/logs")
const walletModel = require('../models/wallets');
const withdrawRequestModel = require('../models/withdrawRequest');


const getWallets = async (body, params={}) => {
    try {
        const response = await walletModel.find(body, params)
        return response
    }
    catch (e) {
        console.log(e);
        throw e
    }
}

const checkUserWallet = async (body) => {
    try {

        const response = await walletModel.findOne(body)
        return response
    }
    catch (e) {
        console.log(e);
        // return e
        throw e
    }
}


const updateWallet = async (condition, body) => {
    try {
        return await walletModel.findOneAndUpdate(condition, body)
    }
    catch (e) {
        console.log(e);
        throw e
    }
}


const AddUserWallet = async (body) => {
    try {
        const response = await walletModel.create(body)
        return
    }
    catch (e) {
        console.log(e);
        // return e
        throw e
    }
}

const createWithdrawRequest = async (body) => {
    try {
        return await withdrawRequestModel.create(body)
    }
    catch (e) {
        console.log(e);
        throw e
    }
}


const updateWithdraw = async (condition, body) => {
    try {
        return await withdrawRequestModel.findOneAndUpdate(condition, body)
    }
    catch (e) {
        console.log(e);
        throw e
    }
}


const checkWithdrawRequest = async (body) => {
    try {

        const response = await withdrawRequestModel.findOne(body)
        return response
    }
    catch (e) {
        console.log(e);
        // return e
        throw e
    }
}


const getAllWithdrawRequest = async (body) => {
    try {

        const response = await withdrawRequestModel.find(body)
        return response
    }
    catch (e) {
        console.log(e);
        // return e
        throw e
    }
}



const createLog = async (body) => {
    try {
        return await logModel.create(body)
    } catch (e) {
        console.log(e);
        throw e;
    }
};


const checkLog = async (condition) => {
    try {
        return await logModel.findOne(condition)
    } catch (e) {
        console.log(e);
        throw e;
    }
};


const getAllLog = async (condition) => {
    try {
        return await logModel.find(condition)
    } catch (e) {
        console.log(e);
        throw e;
    }
};


module.exports = {
    getWallets,
    checkUserWallet,
    AddUserWallet,
    updateWallet,
    createWithdrawRequest,
    updateWithdraw,
    checkWithdrawRequest,
    createLog,
    checkLog,
    getAllLog,
    getAllWithdrawRequest
}

