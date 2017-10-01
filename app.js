const express = require('express');
const app = express();

const config = require('./config');

const pgp = require('pg-promise');
const db = pgp(config.db.pg.url);

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const HOST = 'localhost';
const PORT = 5000;
const BASE_URL = `http://${HOST}:${PORT}`;
const REDIRECT_PATH = '/auth/google/redirect';

const googleAuthClient = new OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  `${BASE_URL}${REDIRECT_PATH}`
);

const scope = [
  'https://www.googleapis.com/auth/userinfo.email'
];

const loginUrl = googleAuthClient.generateAuthUrl({
  access_type: 'offline',
  scope,
  state: {}
});

app.get('/', (req, res) => {
  res.send(`<a href="${loginUrl}">Login with Google</a>`);
});

app.get(REDIRECT_PATH, (req, res) => {
  const token = req.query.code;
  googleAuthClient.getToken(token, (err, tokens) => {
    googleAuthClient.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: (+ new Date() + (1000 * 60 * 60 * 24 * 7))
    });
  });
  res.send(token);
});

app.listen(PORT, () => {
  console.log(`Expresso istening on port ${PORT}...`);
});
