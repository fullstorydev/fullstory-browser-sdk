const core = require('@actions/core'); // https://github.com/actions/toolkit
const github = require('@actions/github'); // https://github.com/actions/toolkit/tree/master/packages/github
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios').default;

const SNIPPET_ENDPOINT = 'http://dev-fs-com.s3-website-us-east-1.amazonaws.com/snippet.js';
const SNIPPET_PATH = 'src/snippet.js';
const PR_TITLE = 'The FullStory snippet has been updated';

const md5Hash = (text) => {
  return crypto.createHash('md5').update(text).digest('hex');
}

const run = async () => {
  const localSnippetHash = md5Hash(fs.readFileSync(`./${SNIPPET_PATH}`, 'utf-8'));
  const maintainers = JSON.parse(fs.readFileSync('./MAINTAINERS.json'));

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

  const context = github.context;
  const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

  const repoInfo = {
    owner: context.payload.repository.owner.name,
    repo: context.payload.repository.name,
  };

  const openPRs = await octokit.pulls.list({
    ...repoInfo,
    state: 'open',
  });
  // console.log(`openPRs response: ${JSON.stringify(openPRs)}`);
  const existingPR = openPRs.data.filter(pr => pr.title === PR_TITLE && pr.user.login === 'github-actions[bot]');
  if (existingPR.length > 0) {
    core.setFailed(`There is already an open PR for snippet syncronization. Please close or merge this PR: ${existingPR[0].html_url}`);
  }

  const branchName = `refs/heads/snippetbot/updated-snippet-${Date.now()}`;  
  const getTreeResponse = await octokit.git.getTree({
    ...repoInfo,
    tree_sha: context.payload.head_commit.tree_id,
    recursive: 1,
  });
  // console.log(`getTree response: ${JSON.stringify(getTreeResponse)}`);

  const srcTree = getTreeResponse.data.tree.find(el => el.path === SNIPPET_PATH);
  // console.log(`srcTree: ${JSON.stringify(srcTree)}`);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-tree
  const treeResponse = await octokit.git.createTree({
    ...repoInfo,
    tree: [{
      path: SNIPPET_PATH,
      content: remoteSnippetText,
      mode: '100644',
      type: 'blob',
      base_tree: srcTree.sha,
    },
    ...getTreeResponse.data.tree.filter(el => el.type !== 'tree' && el.path !== SNIPPET_PATH)]
  });
  //console.log(`tree response: ${JSON.stringify(treeResponse)}`);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-commit
  const commitResponse = await octokit.git.createCommit({
    ...repoInfo,
    message: `updated ${SNIPPET_PATH}`,
    tree: treeResponse.data.sha,
    parents: [context.sha],
  });
  //console.log(`commit created: ${commitResponse.data.html_url}`);

  // create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  const createRefResponse = await octokit.git.createRef({
    ...repoInfo,
    ref: branchName,
    sha: commitResponse.data.sha,
  });
  //console.log(`create ref response: ${JSON.stringify(createRefResponse)}`);

  // https://octokit.github.io/rest.js/#octokit-routes-pulls-create
  const prResponse = await octokit.pulls.create({
    ...repoInfo,
    title: PR_TITLE,
    head: branchName,
    base: 'refs/heads/master'
  });
  //console.log(`create PR response: ${JSON.stringify(prResponse)}`);

  //TODO" add assignee using https://octokit.github.io/rest.js/#octokit-routes-issues-add-assignees
  const assigneeResponse = await octokit.issues.addAssignees({
    ...repoInfo,
    issue_number: prResponse.data.number,
    assignees: maintainers.filter(el => el !== prResponse.data.head.user.login), // avoid assigning the PR to the latest committer
  });
  //console.log(`asiignee response: ${JSON.stringify(assigneeResponse)}`);

  console.log(`created PR: ${prResponse.data.html_url}`);
}

run();