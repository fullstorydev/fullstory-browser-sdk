const core = require('@actions/core'); // https://github.com/actions/toolkit
const github = require('@actions/github');
const fs = require('fs');
const crypto = require('crypto');

// read: https://github.com/actions/toolkit/tree/master/packages/github

console.log(process.env.TEST);
const run = async () => {
  const snippetText = fs.readFileSync(`./src/snippet.js`, 'utf-8');
  const localSnippetHash = crypto.createHash('md5').update(snippetText).digest('hex');
  console.log(localSnippetHash);

  // TODO:
  // 1. Request snippet from api.fullstory.com/code/v1/snippet
  // 2. md5 hash the snippet from step 1
  // 3. compare localSnippetHash with has from step 2
  // 4. if they are the same, exit, if they are different:
  // 5. update local snippet file with the content of the remote snippet
  // 6. create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  // 7. commit changes to the branch: https://octokit.github.io/rest.js/#octokit-routes-git-create-commit
  // 8. Create a PR: https://octokit.github.io/rest.js/#octokit-routes-pulls-create
}

run();