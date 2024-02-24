# BBKIsERC20

This project implements a standard ERC20 token with an additional whitelisting feature based on a Merkle tree for initial token distribution.

## Features

- **ERC20 Standard**: Implements all standard functionalities of an ERC20 token.
- **Whitelist**: Allows only whitelisted addresses to mint tokens, using a Merkle proof mechanism.
- **One-time Mint**: Whitelisted users can mint tokens only once.

## Technologies Used

- Solidity ^0.8.24
- Hardhat
- OpenZeppelin Contracts
- @openzeppelin/merkle-tree
- Chai for testing

## Installation

To get started with this project, follow the steps below:

### 1. Clone this repository.

```bash
git clone repository_url
```

### 2. Install dependencies.

```bash
yarn install
```

### 3. Compile the contracts.

```bash
yarn hardhat compile
```

### 4. Testing

To run the tests:

```bash
yarn hardhat test
```

This will execute all tests defined in the test/ folder.

### 5. Deployment

To deploy this contract to a network (e.g., Sepolia testnet), configure your hardhat.config.js with network information and run:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Make sure to replace "sepolia" with the name of your chosen network configured in hardhat.config.js.

### 6. Contribution

Contributions are welcome! 


### 7. License

Distributed under the MIT License. See LICENSE for more information.