import * as solanaWeb3 from '@solana/web3.js';
import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';
const { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = solanaWeb3;

const QUICKNODE_RPC = 'https://example.solana.quiknode.pro/000000/';

// const connection = new Connection(QUICKNODE_RPC);
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const WALLET_ADDRESS = '7xGwzsVtRTvEArEU6z8KQE5dYZ7ogt6E7dH3nanbdpxH';
const WALLET_PRIVATE_KEY =
  '5KEb7Ro6N5WCspRvtkaMcgGuYZhHHz4kzcDkZjmmZ9sVhp1pQWCWVQKcjkrHwgeWtr37yQ6VU1FtbBj7cqTKUCcq';

export async function requestAirdrop(address: string) {
  const myAddress = new PublicKey(address);
  const signature = await connection.requestAirdrop(
    myAddress,
    LAMPORTS_PER_SOL * 2
  );
  console.log('signature', signature);
  await connection.confirmTransaction(signature);
}
// requestAirdrop(WALLET_ADDRESS);

export function generateKey() {
  const keyPair = Keypair.generate();
  const publicKey = keyPair.publicKey.toString();
  console.log('Public Key:', publicKey);

  const privateKey = bs58.encode(keyPair.secretKey);
  console.log('Private Key ', privateKey);
  // BMWovS6ifjGzL3FWT1Yq97mbYmQ6kjSbNTmPLMRcZ7js - 3bjrDxnpWCGSN7hPPSKRm7BwFrKt2Yz9CFCCCaYXxvQZ9h2TSNuQyvB9exP2j7b3VekFtR8uVJJm5YUW7vCUjaKf
  // 25ZXiD68zsxm7x1Se4fT4WjxHWgFobR3LFeRvwUG8Dv1 - 22oK73vuBCWJwx5AKWWxkSmV78DHCheaE5u3xQrauEWj2qcjtQRVASoRs5bfqv5SNw8baerQjexoJrmQWF3FR5Yd
  // 5SuX1J4RRSkuGffeD94fQQubnXuUhXzinuK3iwHprVMb - 3Ce5m8i3aDKaR2ZjaqSxG1LnYs6iWWKXjWmRwoitA7qJheSeWdWMYyimjHuxnkoLWMg7g4quYp8rd9KrtDMd4ZE9
  // 51i4ZVee98PJLU38wGhFysMGUjbowx8tXJw7zf6Jz6iE - 5mgTXg22JcVjCtMn9AXWcmwg1ZRRnjPmUstHZnJKYhAmrCxjd9UvPHZpmcKRh1GoN4DRD6qE7aZc8PmtaAmPiUnW
  return { publicKey: publicKey, privateKey: privateKey };
}
// generateKey();

export async function getWalletBalance(address: string) {
  const balance = await connection.getBalance(new PublicKey(address));
  console.log(balance);
  console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL}`);
}
// getWalletBalance(WALLET_ADDRESS);

export async function transfer(
  privateKey: string,
  toAddress: string,
  amount: number
) {
  const secretKey = bs58.decode(privateKey);
  const FROM_KEY_PAIR = Keypair.fromSecretKey(secretKey);

  const toPubkey = new PublicKey(toAddress);
  console.log('toPubkey ', toPubkey);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: FROM_KEY_PAIR.publicKey,
      toPubkey: toPubkey,
      lamports: LAMPORTS_PER_SOL * amount
    })
  );

  // Sign transaction, broadcast, and confirm
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [FROM_KEY_PAIR]
  );
  console.log('SIGNATURE', signature);
}
// transfer(WALLET_PRIVATE_KEY, 'BMWovS6ifjGzL3FWT1Yq97mbYmQ6kjSbNTmPLMRcZ7js', 3);

export interface Drop {
  walletAddress: string;
  amount: number;
}
const dropList: Drop[] = [
  {
    walletAddress: 'BMWovS6ifjGzL3FWT1Yq97mbYmQ6kjSbNTmPLMRcZ7js',
    amount: 0.0011
  },
  {
    walletAddress: '25ZXiD68zsxm7x1Se4fT4WjxHWgFobR3LFeRvwUG8Dv1',
    amount: 0.0021
  },
  {
    walletAddress: '5SuX1J4RRSkuGffeD94fQQubnXuUhXzinuK3iwHprVMb',
    amount: 0.0031
  },
  {
    walletAddress: '51i4ZVee98PJLU38wGhFysMGUjbowx8tXJw7zf6Jz6iE',
    amount: 0.0041
  }
];

function trim_amount(amount: string) {
  if (amount.indexOf('.') === -1) {
    return amount;
  }
  const fraction = amount.split('.')[0];
  return fraction;
}

async function buildBatchTransferTx(
  sender: solanaWeb3.Keypair,
  dropList: Drop[]
) {
  let transaction = new Transaction();
  for (let i = 0; i < dropList.length; i++) {
    const transfer = dropList[i];
    // console.log(transfer)
    // const str = (transfer.amount * LAMPORTS_PER_SOL).toString();
    // console.log(str);
    
    // const trimRes = trim_amount(str);

    transaction = transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new PublicKey(transfer.walletAddress),
        lamports: transfer.amount * LAMPORTS_PER_SOL
      })
    );
  }
  console.log(transaction);
  return transaction;
}

async function batchTransfer(privateKey?: string) {
  const FROM_KEY_PAIR = Keypair.fromSecretKey(
    bs58.decode(privateKey || WALLET_PRIVATE_KEY)
  );

  const tx = await buildBatchTransferTx(FROM_KEY_PAIR, dropList);
  //   const signature = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [
  //     FROM_KEY_PAIR
  //   ]);
  //   console.log('signature', signature);
}
batchTransfer();
// async function executeTransactions(
//   solanaConnection: solanaWeb3.Connection,
//   privateKey: string
// ): Promise<PromiseSettledResult<string>[]> {
//   const NUM_DROPS_PER_TX = 10;
//   const secretKey = bs58.decode(privateKey);
//   const FROM_KEY_PAIR = Keypair.fromSecretKey(secretKey);

//   const transactionList = generateTransactions(
//     NUM_DROPS_PER_TX,
//     dropList,
//     FROM_KEY_PAIR.publicKey
//   );

//   let result: PromiseSettledResult<string>[] = [];
//   let staggeredTransactions: Promise<string>[] = transactionList.map(
//     (transaction, i, allTx) => {
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
//           solanaConnection
//             .getLatestBlockhash()
//             .then(
//               (recentHash) =>
//                 (transaction.recentBlockhash = recentHash.blockhash)
//             )
//             .then(() =>
//               sendAndConfirmTransaction(solanaConnection, transaction, [
//                 FROM_KEY_PAIR
//               ])
//             )
//             .then(resolve);
//         }, i * 1000);
//       });
//     }
//   );
//   result = await Promise.allSettled(staggeredTransactions);
//   return result;
// }
