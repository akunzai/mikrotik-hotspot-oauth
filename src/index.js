import md5 from 'blueimp-md5';
window.md5 = md5;
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

function setError(message) {
  const errorElement = document.getElementById('error');
  errorElement.innerHTML = `<br /><div style="color: #FF8080; font-size: 9px">${message}</div>`;
}

async function main() {
  const keycloak = new Keycloak("/keycloak.json");
  const authenticated = await keycloak.init({
    onLoad: 'login-required'
  });
  if (!authenticated) {
    setError('failed to initialize SSO, please check configuration');
    return;
  }
  const claims = await verifyToken(keycloak);
  const username = claims[claims.n];
  const password = claims[claims.np || 's'];
  if (!username || !password) {
    setError(`Client ${keycloak.clientId} is not configured. Please check client mapper.`);
    return;
  }
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = 'Please wait...';
  doLogin(username, password);
}

if (error) {
  setError(`${error}`);
} else {
  main()
    .catch((error) => {
      setError(`failed to initialize SSO, please check configuration: ${error}`);
    });
}
