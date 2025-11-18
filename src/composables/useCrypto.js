import CryptoJS from 'crypto-js'

// 🔐 AES secret key (keep it safe)
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

// Encrypts a PIN
export const encryptPin = (pin) => {
  return CryptoJS.AES.encrypt(pin, SECRET_KEY).toString()
}

// Decrypts a PIN
export const decryptPin = (encryptedPin) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPin, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
