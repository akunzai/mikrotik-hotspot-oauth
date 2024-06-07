import { createRemoteJWKSet, jwtVerify } from 'jose';
import Keycloak from 'keycloak-js';

async function verifyToken(keycloak) {
  try {
    const jwkSet = createRemoteJWKSet(new URL(`${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/certs`));
    const { payload } = await jwtVerify(keycloak.token, jwkSet);
    return payload;
  } catch (e) {
    throw new Error(`invalid token: ${e}`);
  }
}

function updateInfo(message, hasError) {
  hasError = hasError ?? false;
  const infoElement = document.querySelector('p.info');
  infoElement.classList.toggle('alert', hasError)
  infoElement.innerText = message;
}

async function main() {
  const keycloak = new Keycloak("/keycloak.json");
  const authenticated = await keycloak.init({
    onLoad: 'login-required'
  });
  if (!authenticated) {
    updateInfo('failed to initialize SSO, please check configuration', true);
    return;
  }
  const claims = await verifyToken(keycloak);
  const username = claims[claims.n];
  const password = claims[claims.np || 's'];
  if (!username || !password) {
    updateInfo(`Client ${keycloak.clientId} is not configured. Please check client mapper.`, true);
    return;
  }
  updateInfo('Please wait...');
  doLogin(username, password);
}

if (error) {
  updateInfo(error, true);
} else {
  main()
    .catch((reason) => {
      if (typeof reason === 'object') {
        if (typeof reason['error'] === 'string') {
          reason = reason['error']
        } else if (typeof reason['message'] === 'string') {
          reason = reason['message']
        } else {
          reason = JSON.stringify(reason);
        }
      }
      updateInfo(`failed to initialize SSO: ${reason}`, true);
    });
}
