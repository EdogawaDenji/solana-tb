import * as solanaWeb3 from '@solana/web3.js';
import {
  Keypair
} from '@solana/web3.js';
import bs58 from 'bs58';
const { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = solanaWeb3;

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function requestAirdrop(address: string) {
  const myAddress = new PublicKey(address);
  const signature = await connection.requestAirdrop(
    myAddress,
    LAMPORTS_PER_SOL
  );
  console.log('signature', signature);
  await connection.confirmTransaction(signature);
}

export function generateKey() {
  const keyPair = solanaWeb3.Keypair.generate();
  const publicKey = keyPair.publicKey.toString();
  const privateKey = bs58.encode(keyPair.secretKey);
  return { publicKey: publicKey, privateKey: privateKey };
}

export function restoreKeypair(secretKey: string) {
  const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
  return keypair;
}

export async function getWalletBalance(address: string) {
  const balance = await connection.getBalance(new PublicKey(address));
  console.log(balance);
  console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL}`);
  return balance / LAMPORTS_PER_SOL;
}

