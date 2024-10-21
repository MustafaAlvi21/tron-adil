require("dotenv").config();


const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const { port } = require('./config/config')
// const db = require('./utils/db')
const { mongoose } = require("./utils/mongoose")
const flushUSDT = require("./controllers/flushUSDT");



// -----------------------------------
// CORS
// -----------------------------------
// Allow requests from specific origins
const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['PUT, POST, PATCH, DELETE, GET'], // Allow only specific methods
  allowedHeaders: ['Content-Type', 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, pk2'], // Allow only specific headers
};

app.use(cors({
  origin: function (origin, callback) {
    console.log(origin);
    if ((corsOptions.origin).includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, etc.) to be included
}));



// -----------------------------------
// MORGAN LOGGER
// -----------------------------------
app.use(morgan('dev'));


// -----------------------------------
// BODY PARSER
// -----------------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// -----------------------------------
// CRON JOB
// -----------------------------------
cron.schedule('0 0 * * *', async () => {

  flushUSDT()

})


// -----------------------------------
// ROUTES
// -----------------------------------
const walletRoutes = require("./routes/walletRoutes")
app.use("/wallet", walletRoutes)
// USERS ROUTE



// -----------------------------------
// ERROR HANDLING
// -----------------------------------
app.use((req, res, next) => {
  const error = new Error('Nothing Found Here!');
  error.status = 404;
  next(error);
});


app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
  console.log(error);
});




app.listen(port, () => {
  console.log("Server is runnig at Port: ", port);

  flushUSDT()

})







































































// -----------------------------------
// DEPOSIT LISTENER
// -----------------------------------

const TronWeb = require('tronweb');
const { checkUserWallet, createLog, getAllLog, getAllWithdrawRequest, checkLog, updateWithdraw, checkWithdrawRequest, AddUserWallet, updateWallet, createWithdrawRequest } = require("./services/wallet-services-MongoDB");

// NetworkURL = "https://api.shasta.trongrid.io"
// TronApiKey = "513b115f-2e7f-4a42-bbe4-d811d51c5b1d"
// ACCOUNT_PRIVATE_KEY = "c073a2b6aec3bddda54ae50de39900322a72203ac5eda9202b3d349587e371ec"
// Contract_Address = "TBTRLukGUhSuWT1yRNhFDJ3ZsqbXQ3bQSW"
// console.log(NetworkURL);

NetworkURL = process.env.NetworkURL;
TronApiKey = process.env.TronApiKey;
ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
Contract_Address = process.env.Contract_Address
CONFIRMATION_BLOCKS = 20; // Adjust as needed

console.log("NetworkURL", NetworkURL);
console.log("TronApiKey", TronApiKey);
console.log("ACCOUNT_PRIVATE_KEY", ACCOUNT_PRIVATE_KEY);
console.log("Contract_Address", Contract_Address);




const tronWeb = new TronWeb({
  fullHost: NetworkURL, // testnet
  headers: { 'TRON-PRO-API-KEY': TronApiKey },
  privateKey: ACCOUNT_PRIVATE_KEY
});


async function processTransaction(event) {
  try {
    const toAddress = tronWeb.address.fromHex(event.result.to);
    console.log(`Processing transaction to: ${toAddress} ${event.transaction}`);

    const checkAddress = await checkUserWallet({ address: toAddress });
    if (!checkAddress) {
      console.log('Wallet not found in database');
      return;
    }

    const tx = await tronWeb.trx.getTransaction(event.transaction);
    if (tx.ret[0].contractRet !== "SUCCESS") {
      console.log('Transaction failed');
      return;
    }

    const currentBlock = await tronWeb.trx.getCurrentBlock();
    if (currentBlock.block_header.raw_data.number - event.block < CONFIRMATION_BLOCKS) {
      console.log('Waiting for more confirmations');

      // Retry for confirmation without blocking other transactions
      setTimeout(() => {
        console.log("Checking TX state: ", event.transaction);
        processTransaction(event);
      }, 10000);

      return; // Exit for now, will retry this transaction later
    }

    // Check if the transaction has already been processed
    const isTxFound = await checkLog({ tx: event.transaction });
    if (isTxFound) {
      console.log("Tx is already added");
    } else {
      const prevAmount = checkAddress.depositedAmount;
      // const newAmount = parseFloat(prevAmount) + parseFloat(event.result.value) / 1e6; // Assuming 6 decimal places for USDT
      const newAmount = parseFloat(prevAmount) + parseFloat(event.result.value); // Assuming 6 decimal places for USDT
      await updateWallet({ address: toAddress }, { newDeposit: 1, depositedAmount: newAmount });
      await createLog({
        userId: checkAddress.userId,
        wallet: toAddress,
        tx: event.transaction,
        status: "success",
        // amount: event.result.value / 1e6
        amount: event.result.value
      });

      console.log(`Successfully processed transaction: ${event.transaction}`);
    }

  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}

async function startEventListener() {
  let contract;
  try {
    contract = await tronWeb.contract().at(Contract_Address);
  } catch (error) {
    console.error('Error initializing contract:', error);
    return;
  }

  console.log('Starting event listener...');

  contract.Transfer().watch(async (err, event) => {
    if (err) {
      console.error("Error in event listener:", err);
      return;
    }

    console.log(event);


    // Ensure multiple transactions in the same block are handled concurrently
    if (Array.isArray(event)) {
      console.log(`Processing multiple transactions in block ${event[0].block}`);
      await Promise.all(event.map(async (singleEvent) => {
        processTransaction(singleEvent);  // Process each transaction in the block
      }));
    } else {
      // If there's only one transaction, process it directly
      console.log(`Processing single transaction in block ${event.block}`);
      await processTransaction(event);
    }
  });
}

// Retry mechanism for starting the event listener
async function retryOperation(operation, maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Start the listener with retry mechanism
retryOperation(startEventListener)
  .then(() => console.log('Event listener started successfully'))
  .catch(error => console.error('Failed to start event listener:', error));

// Periodically check if listener is still active
setInterval(async () => {
  try {
    const latestBlock = await tronWeb.trx.getCurrentBlock();
    // console.log(`Latest block: ${latestBlock.block_header.raw_data.number}`);
  } catch (error) {
    console.error('Error checking latest block:', error);
    // Restart listener if there's an error
    retryOperation(startEventListener);
  }
}, 2000); // Check every minute
