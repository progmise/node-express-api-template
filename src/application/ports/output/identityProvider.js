// Output port: identity provider contract.
//
// Ports in JS are duck-typed — this file documents the shape the
// infrastructure adapter must implement (like a Java interface, without the
// ceremony). The implementation lives in
// infrastructure/adapters/output/githubIdentity.js.

/**
 * @typedef {object} IdentityUser
 * @property {string} login
 * @property {string} avatar_url
 */

/**
 * @typedef {object} IdentityProvider
 * @property {(code: string) => Promise<string|null>} exchangeCode
 *   Trades an OAuth code for an access token; null when the exchange fails.
 * @property {(token: string) => Promise<IdentityUser|null>} getUser
 *   Resolves the token's owner; null when the token is invalid.
 */
