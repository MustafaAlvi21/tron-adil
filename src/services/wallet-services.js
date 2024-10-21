const pool = require('../utils/db');

const checkUserWallet = async (condition) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM wallets WHERE ?', condition);
        return rows[0] || null;

    } catch (e) {
        console.log(e);
        throw e;
    }
};

const updateWallet = async (condition, body) => {
    try {
        const [result, fields] = await pool.query('UPDATE wallets SET ? WHERE ?', [body, condition]);
        return result;

    } catch (e) {
        console.log(e);
        throw e;
    }
};

const AddUserWallet = async (body) => {
    try {
        const [result, fields] = await pool.query('INSERT INTO wallets SET ?', body);
        return result;
        
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const createWithdrawRequest = async (body) => {
    try {
        const [result, fields] = await pool.query('INSERT INTO withdrawRequest SET ?', body);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const updateWithdraw = async (condition, body) => {
    try {
        const [result, fields] = await pool.query('UPDATE withdrawRequest SET ? WHERE ?', [body, condition]);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const checkWithdrawRequest = async (condition) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM withdrawRequest WHERE ?', condition);
        return rows[0] || null;
    } catch (e) {
        console.log(e);
        throw e;
    }
};




const createLog = async (body) => {
    try {
        const [result, fields] = await pool.query('INSERT INTO logs SET ?', body);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
};


const checkLog = async (condition) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM logs WHERE ?', condition);
        return rows[0] || null;
    } catch (e) {
        console.log(e);
        throw e;
    }
};


module.exports = {
    checkUserWallet,
    AddUserWallet,
    updateWallet,
    createWithdrawRequest,
    updateWithdraw,
    checkWithdrawRequest,
    createLog,
    checkLog
};
