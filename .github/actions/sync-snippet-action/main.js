const core = require('@actions/core'); // https://github.com/actions/toolkit
const github = require('@actions/github'); // https://github.com/actions/toolkit/tree/master/packages/github
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios').default;

// read: https://github.com/actions/toolkit/tree/master/packages/github
// and: https://developer.github.com/v3/git/trees/#create-a-tree
// 1. create a tree
// 2. create a commit
// 3. update a reference

const SNIPPET_ENDPOINT = 'http://dev-fs-com.s3-website-us-east-1.amazonaws.com/snippet.js';
const LOCAL_SNIPPET = `./src/snippet.js`;

const md5Hash = (text) => {
  return crypto.createHash('md5').update(text).digest('hex');
}
const run = async () => {
  const localSnippetText = fs.readFileSync(LOCAL_SNIPPET, 'utf-8');
  const localSnippetHash = md5Hash(localSnippetText);
  console.log(`local snippet file hash: ${localSnippetHash}`);

  let remoteSnippetText;
  try {
    remoteSnippetText = (await axios.get(SNIPPET_ENDPOINT)).data
  } catch (e) {
    core.setFailed(e.message);
  }

  const remoteSnippetHash = md5Hash(remoteSnippetText);
  console.log(`remote snippet file hash: ${remoteSnippetHash}`);
  
  if (localSnippetHash === remoteSnippetHash)  {
    console.log('no changes to snippet'); 
    return;
  }

  const branchName = `refs/heads/snippetbot/updated-snippet-${Date.now()}`;

  const context = github.context;
  console.log(`current commit on refs/heads/master: ${context.sha}`);

  const repoInfo = {
    owner: context.payload.repository.owner.name,
    repo: context.payload.repository.name,
  }
  
  const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-tree
  const treeResponse = await octokit.git.createTree({
    ...repoInfo,
    tree: [{
      path: 'src/snippet.js',
      content: remoteSnippetText,
      mode: '100644',
      type: 'blob',
      base_tree: context.sha,
    }]
  });
  // console.log(`tree response: ${JSON.stringify(treeResponse)}`);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-commit
  const commitResponse = await octokit.git.createCommit({
    ...repoInfo,
    message: 'updated snippet.js',
    tree: treeResponse.data.tree[0].sha,
    parents: [context.sha],
  });
  // console.log(`commit response: ${JSON.stringify(commitResponse)}`);

  // create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  const createRefResponse = await octokit.git.createRef({
    ...repoInfo,
    ref: branchName,
    sha: commitResponse.data.sha,
  }); // thie creates a ref using the current master commit - will need to update ref
  console.log(`create ref response: ${JSON.stringify(createRefResponse)}`);

  // TODO: overwrite local snippet.js

  // https://octokit.github.io/rest.js/#octokit-routes-pulls-create
  /* 
  octokit.pulls.create({
    owner,
    repo,
    title,
    head,
    base
  })
  */

  

  // TODO:
  // 1. Request snippet from api.fullstory.com/code/v1/snippet
  // 2. md5 hash the snippet from step 1
  // 3. compare localSnippetHash with has from step 2
  // 4. if they are the same, exit, if they are different:
  // 5. update local snippet file with the content of the remote snippet
  // 6. create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  // 7. commit changes to the branch: https://octokit.github.io/rest.js/#octokit-routes-git-create-commit
  // 8. Create a PR: https://octokit.github.io/rest.js/#octokit-routes-pulls-create

  //fake endpoint: http://dev-fs-com.s3-website-us-east-1.amazonaws.com/snippet.js
}

run();