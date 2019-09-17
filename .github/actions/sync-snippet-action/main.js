const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { promisify } = require('util');
const realPathSync = promisify(fs.realpath);

// read: https://github.com/actions/toolkit/tree/master/packages/github

console.log(process.env.TEST);
const run = async () => {
  const pwd = await realPathSync('.');
  const snippetText = fs.readFileSync(`${pwd}/src/snippet.js`, 'utf-8');
  console.log(snippetText);
}

run();