require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Proper timeout usage in ethers v6:
const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL,
  "any", // Accept any network, avoids validation errors
  {
    fetchOptions: {
      timeout: 30000 // 30 seconds
    }
  }
);

const walletA = new ethers.Wallet(process.env.WALLET_A_PRIVATE_KEY, provider);
const walletB = new ethers.Wallet(process.env.WALLET_B_PRIVATE_KEY, provider);

const tokenAddress = "0x078D782b760474a361dDA0AF3839290b0EF57AD6"; // USDC on Unichain

const tokenAbi = [
  "function transfer(address to, uint256 value) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const tokenContractA = new ethers.Contract(tokenAddress, tokenAbi, walletA);
const tokenContractB = new ethers.Contract(tokenAddress, tokenAbi, walletB);

const tokenDecimals = 6;
const minUSD = 3;
const maxUSD = 7;
const minAmount = ethers.parseUnits(minUSD.toString(), tokenDecimals);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomTokenAmount() {
  const randomCents = Math.floor(Math.random() * ((maxUSD - minUSD) * 100 + 1)) + minUSD * 100;
  return ethers.parseUnits((randomCents / 100).toFixed(2), tokenDecimals);
}

async function getUSDCBalance(contract, address) {
  return await contract.balanceOf(address);
}

async function sendToken(fromWallet, toWallet, contract, txNum) {
  const amount = getRandomTokenAmount();
  const balance = await contract.balanceOf(fromWallet.address);

  if (balance < minAmount) {
    console.warn(`⚠️ TX ${txNum}: ${fromWallet.address.slice(0, 8)}... has < $3. Skipping.`);
    return "SKIP";
  }

  if (balance < amount) {
    console.warn(`⚠️ TX ${txNum}: Not enough for $${ethers.formatUnits(amount, tokenDecimals)}. Will try smaller amount next.`);
    return "SKIP";
  }

  try {
    const tx = await contract.transfer(toWallet.address, amount);
    console.log(`✅ TX ${txNum}: Sent $${ethers.formatUnits(amount, tokenDecimals)} USDC → ${toWallet.address.slice(0, 8)}..., Hash: ${tx.hash}`);
    await tx.wait();
    return "SENT";
  } catch (err) {
    if (err.code === 'TIMEOUT') {
      console.warn(`⏳ TX ${txNum} timeout. Retrying in 10s...`);
      await delay(10000);
      return await sendToken(fromWallet, toWallet, contract, txNum); // Retry
    }
    console.error(`❌ TX ${txNum} failed:`, err.message);
    return "FAIL";
  }
}

async function startPingPong() {
  console.log("🔁 Starting USDC back-and-forth between Wallet A and B...\n");

  let txCount = 1;

  while (true) {
    const aBalance = await getUSDCBalance(tokenContractA, walletA.address);
    const bBalance = await getUSDCBalance(tokenContractB, walletB.address);

    const aCanSend = aBalance >= minAmount;
    const bCanSend = bBalance >= minAmount;

    if (!aCanSend && !bCanSend) {
      console.log("🏁 Ping-pong ended — both wallets have < $3 USDC.");
      break;
    }

    if (aCanSend) {
      const result = await sendToken(walletA, walletB, tokenContractA, txCount++);
      if (result === "SENT") await delay(Math.random() * (40000 - 20000) + 20000);
    }

    if (bCanSend) {
      const result = await sendToken(walletB, walletA, tokenContractB, txCount++);
      if (result === "SENT") await delay(Math.random() * (40000 - 20000) + 20000);
    }
  }
}

startPingPong().catch(err => console.error("Script Error:", err));
