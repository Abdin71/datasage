// Simple encryption utilities for DataSage
// Note: This provides basic obfuscation for passwords in memory.
// For a production app with remote servers, use proper encryption libraries.

/**
 * Simple hash function for password obfuscation
 * Uses Web Crypto API for basic hashing
 */
async function hashPassword(password) {
  if (!password) return '';
  
  try {
    // Convert password to array buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    return password; // Fallback to plain text if hashing fails
  }
}

/**
 * Simple XOR-based encryption for session storage
 * This is NOT cryptographically secure but provides basic obfuscation
 * for passwords stored temporarily in session memory
 */
function encryptPassword(password) {
  if (!password) return '';
  
  // Simple XOR cipher with a static key
  // In production, use a proper encryption library with key management
  const key = 'DataSage2025SecureKey';
  let encrypted = '';
  
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode ^ keyChar);
  }
  
  // Base64 encode to make it storable
  return btoa(encrypted);
}

/**
 * Decrypt XOR-encrypted password
 */
function decryptPassword(encrypted) {
  if (!encrypted) return '';
  
  try {
    // Base64 decode
    const decrypted = atob(encrypted);
    
    // XOR decrypt (XOR is symmetric)
    const key = 'DataSage2025SecureKey';
    let password = '';
    
    for (let i = 0; i < decrypted.length; i++) {
      const charCode = decrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      password += String.fromCharCode(charCode ^ keyChar);
    }
    
    return password;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return encrypted; // Return as-is if decryption fails
  }
}
