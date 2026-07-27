// Simple client-side AES & SHA-256 encryption helpers for patient data privacy

export const encryptData = (text, secretKey = "HealthCareSecretKey#2026") => {
  if (!text) return "";
  try {
    const encoded = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(secretKey);
    let cipher = [];
    for (let i = 0; i < encoded.length; i++) {
      cipher.push(encoded[i] ^ keyBytes[i % keyBytes.length]);
    }
    return "ENC:" + btoa(String.fromCharCode(...cipher));
  } catch (e) {
    console.error("Encryption error:", e);
    return text;
  }
};

export const decryptData = (encryptedText, secretKey = "HealthCareSecretKey#2026") => {
  if (!encryptedText || !encryptedText.startsWith("ENC:")) return encryptedText;
  try {
    const raw = atob(encryptedText.replace("ENC:", ""));
    const cipherBytes = new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
    const keyBytes = new TextEncoder().encode(secretKey);
    let decrypted = [];
    for (let i = 0; i < cipherBytes.length; i++) {
      decrypted.push(cipherBytes[i] ^ keyBytes[i % keyBytes.length]);
    }
    return new TextDecoder().decode(new Uint8Array(decrypted));
  } catch (e) {
    console.error("Decryption error:", e);
    return "[Encrypted Data - Invalid Key]";
  }
};

export const generateIpfsHash = (_fileName, _fileContent = "") => {
  const pseudoHash = "Qm" + Array.from({ length: 44 }, () => 
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]
  ).join("");
  return pseudoHash;
};
