
//wallets 

// CREATE TABLE wallets (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(255) NOT NULL,
//     publicKey VARCHAR(255) NOT NULL,
//     privateKey VARCHAR(255) NOT NULL,
//     address VARCHAR(255) NOT NULL,
//     depositedAmount DOUBLE NOT NULL DEFAULT 0,
//     timestamp BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
//     dateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
// );


//withdraw

// CREATE TABLE withdrawRequest (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(255) NOT NULL,
//     wallet VARCHAR(255) NOT NULL,
//     status VARCHAR(255) NOT NULL DEFAULT 'pending',
//     RequestedAmount DOUBLE NOT NULL,
//     timestamp BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
//     dateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
// );


// CREATE TABLE logs (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(255) NOT NULL,
//     wallet VARCHAR(255) NOT NULL,
//     tx VARCHAR(255) NOT NULL,
//     status VARCHAR(255) NOT NULL DEFAULT 'pending',
//     amount DOUBLE NOT NULL,
//     timestamp BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
//     dateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
// );



