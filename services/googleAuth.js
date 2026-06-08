const { google } = require('googleapis');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

let _oauth2Client = null;

function getOAuth2Client() {
  if (!_oauth2Client) {
    _oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    _oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
  }
  return _oauth2Client;
}

function getDocs() {
  return google.docs({ version: 'v1', auth: getOAuth2Client() });
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getOAuth2Client() });
}

async function getAccessToken() {
  const { token } = await getOAuth2Client().getAccessToken();
  return token;
}

async function callAppsScript(scriptId, functionName, parameters) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://script.googleapis.com/v1/scripts/${scriptId}:run`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ function: functionName, parameters })
    }
  );
  const json = await res.json();
  if (json.error) {
    throw new Error(`Apps Script error in ${functionName}: ${JSON.stringify(json.error)}`);
  }
  return json;
}

module.exports = { getOAuth2Client, getDocs, getDrive, getAccessToken, callAppsScript };
