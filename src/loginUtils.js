import { decodeJwt, decodeProtectedHeader, jwtVerify } from 'jose';
import { fetchKeycloakPublicKey } from './keyCloakCerts';
import { fetchData } from './restCalls';

function getRealmName(url) {
  const n = url.lastIndexOf('/');
  return url.substring(n + 1);
}

function getRealmNameFromToken(claims) {
  return getRealmName(claims.iss);
}

export async function verifyToken(token, keycloakJSON) {
  const protectedHeader = decodeProtectedHeader(token);
  if (!protectedHeader) {
    throw new Error('invalid token (header part)');
  } else {
    const { kid, alg } = protectedHeader;
    const claims = decodeJwt(token);
    const realm = getRealmNameFromToken(claims);
    if (alg.toLowerCase() !== 'none' && !alg.toLowerCase().startsWith('hs') && kid) {
      // fetch the PEM Public Key
      try {
        const publicKey = await fetchKeycloakPublicKey(keycloakJSON['auth-server-url'],
          realm,
          kid);
        return jwtVerify(token, publicKey);
      } catch (e) {
        // Token is not valid
        throw new Error(`invalid token: ${e}`);
      }
    } else {
      throw new Error('invalid token');
    }
  }
}

export function getPassword(decodedToken) {
  return decodedToken[decodedToken.np || 'p'];
}

export function getUserName(decodedToken) {
  return decodedToken[decodedToken.n];
}

export function loadKeycloakJson() {
  return new Promise((resolve, reject) => {
    fetchData('/keycloak.json').then((r) => {
      resolve(JSON.parse(r.data));
    }).catch((e) => {
      if (e.response && e.response.status === 404) {
        reject('Cannot found /keycloak.json');
      } else {
        reject(e.response ? e.response.data : e);
      }
    });
  });
}
