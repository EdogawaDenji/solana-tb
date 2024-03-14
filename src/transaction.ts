import bs58 from 'bs58';
import * as solanaWeb3 from '@solana/web3.js';

const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl('testnet'),
  'confirmed'
);
const programId = '';

export async function reward(privateKey: string, programId: string) {
  const secretKey = bs58.decode(privateKey);
  const FROM_KEY_PAIR = solanaWeb3.Keypair.fromSecretKey(secretKey);
  console.log(FROM_KEY_PAIR.publicKey.toString());

  const transaction = new solanaWeb3.Transaction();
  transaction.add(
    new solanaWeb3.TransactionInstruction({
      keys: [],
      programId: new solanaWeb3.PublicKey(programId)
    })
  );
  console.log('Sending transaction...');
  const txHash = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [FROM_KEY_PAIR]
  );
  console.log('Transaction sent with hash:', txHash);
}

export async function transfer(
  privateKey: string,
  toAddress: string,
  amount: number
) {
  const secretKey = bs58.decode(privateKey);
  const FROM_KEY_PAIR = solanaWeb3.Keypair.fromSecretKey(secretKey);

  const toPubkey = new solanaWeb3.PublicKey(toAddress);
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: FROM_KEY_PAIR.publicKey,
      toPubkey: toPubkey,
      lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
    })
  );

  // Sign transaction, broadcast, and confirm
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [FROM_KEY_PAIR]
  );
  console.log('SIGNATURE', signature);
  return signature;
}

export interface Drop {
  walletAddress: string;
  amount: number;
}
const dropList: Drop[] = [];

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
  let transaction = new solanaWeb3.Transaction();
  for (let i = 0; i < dropList.length; i++) {
    const transfer = dropList[i];
    // console.log(transfer)
    // const str = (transfer.amount * LAMPORTS_PER_SOL).toString();
    // console.log(str);

    // const trimRes = trim_amount(str);

    transaction = transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new solanaWeb3.PublicKey(transfer.walletAddress),
        lamports: transfer.amount * solanaWeb3.LAMPORTS_PER_SOL
      })
    );
  }
  console.log(transaction);
  return transaction;
}

export async function batchTransfer(privateKey: string) {
  const FROM_KEY_PAIR = solanaWeb3.Keypair.fromSecretKey(
    bs58.decode(privateKey)
  );

  const tx = await buildBatchTransferTx(FROM_KEY_PAIR, dropList);
  const signature = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [
    FROM_KEY_PAIR
  ]);
  console.log('signature', signature);
}
