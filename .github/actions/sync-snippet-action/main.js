const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { promisify } = require('util');
const realPathSync = promisify(fs.realpath);
const crypto = require('crypto');

// read: https://github.com/actions/toolkit/tree/master/packages/github

console.log(process.env.TEST);
const run = async () => {
  const snippetText = fs.readFileSync(`./src/snippet.js`, 'utf-8');
  const hash = crypto.createHash('md5').update(snippetText).digest('hex');
  console.log(hash);
}

run();