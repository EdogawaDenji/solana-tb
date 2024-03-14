import bs58 from 'bs58';
import * as web3 from '@solana/web3.js';

import {
  createSignerFromKeypair,
  signerIdentity
} from '@metaplex-foundation/umi';
import {
  updateV1,
  fetchMetadataFromSeeds,
  mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

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
