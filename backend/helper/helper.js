/**
 * @description Public RSA key to decrypt the encrypted data from the server.
 * @type {string}
 */
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\n${process.env.PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

/**
 * @description Private RSA key to decrypt the encrypted data from the server.
 * @type {string}
 */
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${process.env.PRIVATE_KEY}\n-----END PRIVATE KEY-----`;
module.exports =  {PUBLIC_KEY, PRIVATE_KEY}
