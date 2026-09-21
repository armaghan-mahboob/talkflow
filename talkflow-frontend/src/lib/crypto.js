import nacl from "tweetnacl";
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from "tweetnacl-util";

const PRIVATE_KEY_STORAGE_KEY = "talkflow_privateKey";
const PUBLIC_KEY_STORAGE_KEY = "talkflow_publicKey";

export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey),
  };
};

export const storeKeyPair = ({ publicKey, privateKey }) => {
  localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, publicKey);
  localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKey);
};

export const getStoredPrivateKey = () => {
  return localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
};

export const getStoredPublicKey = () => {
  return localStorage.getItem(PUBLIC_KEY_STORAGE_KEY);
};

export const hasKeyPair = () => {
  return Boolean(getStoredPrivateKey() && getStoredPublicKey());
};

export const encryptMessage = (
  plaintext,
  otherPublicKeyBase64,
  myPrivateKeyBase64,
) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = decodeUTF8(plaintext);
  const otherPublicKey = decodeBase64(otherPublicKeyBase64);
  const myPrivateKey = decodeBase64(myPrivateKeyBase64);

  const encrypted = nacl.box(messageUint8, nonce, otherPublicKey, myPrivateKey);

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
};

export const decryptMessage = (
  ciphertextBase64,
  nonceBase64,
  otherPublicKeyBase64,
  myPrivateKeyBase64,
) => {
  const ciphertext = decodeBase64(ciphertextBase64);
  const nonce = decodeBase64(nonceBase64);
  const otherPublicKey = decodeBase64(otherPublicKeyBase64);
  const myPrivateKey = decodeBase64(myPrivateKeyBase64);

  const decrypted = nacl.box.open(
    ciphertext,
    nonce,
    otherPublicKey,
    myPrivateKey,
  );

  if (!decrypted) {
    return null;
  }

  return encodeUTF8(decrypted);
};
