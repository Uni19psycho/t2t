# 🏓 t2t – ERC20 Token Ping-Pong Script

[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)](https://github.com/uni19psycho)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A lightweight, automated script to transfer USDC tokens back and forth between two wallets on the blockchain using `ethers.js`.

---

## 📌 Table of Contents

- [Features](#-features)
- [Setup](#-setup)
- [Usage](#-usage)
- [Customization](#-customization)
- [Security](#-security)
- [Contributors](#-contributors)
- [Support for Other Networks](#-support-for-other-networks)

---

## 💡 Features

- 🔁 Bi-directional USDC transfers (wallet A ↔ wallet B)
- 🎲 Random amounts ($3–$7) for each transaction
- ⏱ Random delays (20–40s) to simulate human behavior
- 🛑 Auto-halts when either wallet has < $3 USDC
- 🔐 Uses `.env` to securely manage keys and RPC

---

## 🔧 Setup

```bash
git clone git@github.com:uni19psycho/t2t.git
cd t2t
npm install

🔐 .env File Setup
Create a .env file in the root directory:
touch .env
Paste the following:
WALLET_A_PRIVATE_KEY=0xYourWalletAPrivateKey
WALLET_B_PRIVATE_KEY=0xYourWalletBPrivateKey
RPC_URL=https://unichain-rpc.publicnode.com
⚠️ Your .env is private and ignored by Git — never commit it.

🚀 Usage
Run the script with:
node pingpong.js

You’ll see output like:
✅ TX 1: Sent $4.58 USDC → Wallet B
✅ TX 2: Sent $3.94 USDC → Wallet A
⏳ Waiting 26s...

⚙️ Customization
You can change behavior in pingpong.js:
const minUSD = 3;
const maxUSD = 7;

To reduce the delay or widen the range, adjust:
Math.random() * (40000 - 20000) + 20000;

🔐 Security
Always keep .env out of version control
Regenerate your private key if it was exposed
Only test with small amounts ($5 USDC per wallet is fine)

🌐 Support for Other Networks
This script works with any EVM-compatible chain.
Just replace the RPC_URL and tokenAddress in .env and pingpong.js.

Example:

Polygon
Avalanche
Fantom
Ethereum mainnet/testnets
and other L2s
Need help adapting it? Open an issue or reach out.

