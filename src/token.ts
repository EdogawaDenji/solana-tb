import {
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  getTokenMetadata,
  mintTo,
  updateTokenMetadata
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction
} from '@solana/web3.js';
import bs58 from 'bs58';
import * as web3 from '@solana/web3.js';

import {
  PublicKey,
  createSignerFromKeypair,
  publicKey,
  signerIdentity
} from '@metaplex-foundation/umi';
import {
  updateV1,
  fetchMetadataFromSeeds,
  mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey
} from '@metaplex-foundation/umi-web3js-adapters';

const WALLET_ADDRESS = '';
const WALLET_PRIVATE_KEY = '';
const secretKey = bs58.decode(WALLET_PRIVATE_KEY);
const FROM_KEY_PAIR = Keypair.fromSecretKey(secretKey);
const connection = new Connection(
  'https://api.mainnet-beta.solana.com',
  'confirmed'
);

const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
);
const umi = createUmi('https://api.devnet.solana.com', 'confirmed').use(
  mplTokenMetadata()
);
const myKeypair = umi.eddsa.createKeypairFromSecretKey(FROM_KEY_PAIR.secretKey);
const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
umi.use(signerIdentity(myKeypairSigner, true));

async function createSplToken() {
  const mintAuthority = Keypair.generate();
  const freezeAuthority = Keypair.generate();
  console.log('mint public', mintAuthority.publicKey.toString());
  console.log('feeze ', freezeAuthority.publicKey.toString());

  const mint = await createMint(
    connection,
    FROM_KEY_PAIR,
    FROM_KEY_PAIR.publicKey,
    freezeAuthority.publicKey,
    9
  );

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    FROM_KEY_PAIR,
    mint,
    FROM_KEY_PAIR.publicKey
  );
  console.log('address ', tokenAccount.address.toBase58());

  const tokenAccountInfo = await getAccount(connection, tokenAccount.address);
  console.log(tokenAccountInfo.amount);
  // 0
  await mintTo(
    connection,
    FROM_KEY_PAIR,
    mint,
    tokenAccount.address,
    FROM_KEY_PAIR,
    100000000000000
  );

  const mintInfo = await getMint(connection, mint);
  console.log('supply ', mintInfo.supply);
}

export async function updateMetadata(
  endpoint: string,
  tokenAddress: string,
  authorityPrivatekey: string,
  tokenName: string,
  tokenSymbol: string,
  uri: string
) {
  const umi = createUmi(endpoint, 'confirmed').use(mplTokenMetadata());

  const secretKey = bs58.decode(authorityPrivatekey);
  const FROM_KEY_PAIR = web3.Keypair.fromSecretKey(secretKey);

  const myKeypair = umi.eddsa.createKeypairFromSecretKey(
    FROM_KEY_PAIR.secretKey
  );
  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  umi.use(signerIdentity(myKeypairSigner, true));

  // token address
  const mint = new web3.PublicKey(tokenAddress);
  const initialMetadata = await fetchMetadataFromSeeds(umi, {
    mint: fromWeb3JsPublicKey(mint)
  });

  // uri: json metadata
  await updateV1(umi, {
    mint: fromWeb3JsPublicKey(mint),
    authority: myKeypairSigner,
    data: {
      ...initialMetadata,
      name: tokenName,
      symbol: tokenSymbol,
      uri: uri
    }
  }).sendAndConfirm(umi);
}
