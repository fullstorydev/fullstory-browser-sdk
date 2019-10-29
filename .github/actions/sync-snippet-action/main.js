/* eslint-disable no-console */
const core = require('@actions/core'); // https://github.com/actions/toolkit
const github = require('@actions/github'); // https://github.com/actions/toolkit/tree/master/packages/github
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios').default;

const SNIPPET_PATH = 'src/snippet.js';
const PR_TITLE = 'The FullStory snippet has been updated';

const md5Hash = text => crypto.createHash('md5').update(text).digest('hex');

const run = async () => {
  const localSnippetHash = md5Hash(fs.readFileSync(`./${SNIPPET_PATH}`, 'utf-8'));
  const maintainers = JSON.parse(fs.readFileSync('./MAINTAINERS.json'));

  let remoteSnippetText;
  try {
    remoteSnippetText = (await axios.get(process.env.SNIPPET_ENDPOINT)).data;
  } catch (e) {
    core.setFailed(e.message);
    throw e;
  }

  const remoteSnippetHash = md5Hash(remoteSnippetText);
  console.log(`remote snippet file hash: ${remoteSnippetHash}`);

  if (localSnippetHash === remoteSnippetHash) {
    console.log('no changes to snippet');
    return;
  }

  const branchName = `refs/heads/snippetbot/updated-snippet-${Date.now()}`;
  const { context } = github;
  const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

  const repoInfo = {
    owner: context.payload.repository.owner.name,
    repo: context.payload.repository.name,
  };

  const openPRs = await octokit.pulls.list({
    ...repoInfo,
    state: 'open',
  });

  console.log('checking for an on open snippet sync PR');
  // NOTE: possible that searching for github-actions[bot] user might be too greedy.
  // Assuming GH won't change this name.
  const existingPR = openPRs.data.filter(pr => pr.title === PR_TITLE && pr.user.login === 'github-actions[bot]');
  if (existingPR.length > 0) {
    core.setFailed(`There is already an open PR for snippet syncronization. Please close or merge this PR: ${existingPR[0].html_url}`);
    return;
  }

  console.log('getting source tree from master');
  const getTreeResponse = await octokit.git.getTree({
    ...repoInfo,
    tree_sha: context.payload.head_commit.tree_id,
    recursive: 1,
  });

  const srcTree = getTreeResponse.data.tree.find(el => el.path === SNIPPET_PATH);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-tree
  console.log('creating updated source tree with new snippet file');
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

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-commit
  console.log('committing new snippet file');
  const commitResponse = await octokit.git.createCommit({
    ...repoInfo,
    message: `updated ${SNIPPET_PATH}`,
    tree: treeResponse.data.sha,
    parents: [context.sha],
  });

  // create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  console.log(`creating new branch named ${branchName}`);
  await octokit.git.createRef({
    ...repoInfo,
    ref: branchName,
    sha: commitResponse.data.sha,
  });

  // https://octokit.github.io/rest.js/#octokit-routes-pulls-create
  console.log(`creating PR for branch ${branchName}`);
  const prResponse = await octokit.pulls.create({
    ...repoInfo,
    title: PR_TITLE,
    head: branchName,
    base: 'refs/heads/master'
  });

  // https://octokit.github.io/rest.js/#octokit-routes-issues-add-assignees
  console.log('assigning PR to reviewers');
  await octokit.issues.addAssignees({
    ...repoInfo,
    issue_number: prResponse.data.number,
    assignees: maintainers,
  });

  console.log(`created PR: ${prResponse.data.html_url}`);
};

run();
