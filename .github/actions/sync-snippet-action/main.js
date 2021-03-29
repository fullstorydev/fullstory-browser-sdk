/* eslint-disable no-console */
const core = require('@actions/core'); // https://github.com/actions/toolkit
const github = require('@actions/github'); // https://github.com/actions/toolkit/tree/main/packages/github
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios').default;

const SNIPPET_PATH = 'src/snippet.js';
const PR_TITLE = 'The FullStory snippet has been updated';

const {
  SNIPPET_ENDPOINT,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
  GITHUB_SHA,
  GITHUB_REF,
} = process.env;

const hash = text => crypto.createHash('sha256').update(text).digest('hex');

const run = async () => {
  let remoteSnippetText;
  try {
    remoteSnippetText = (await axios.get(SNIPPET_ENDPOINT)).data;
  } catch (e) {
    core.setFailed(e.message);
    throw e;
  }

  const remoteSnippetHash = hash(remoteSnippetText);
  const localSnippetHash = hash(fs.readFileSync(`./${SNIPPET_PATH}`, 'utf-8'));

  if (localSnippetHash === remoteSnippetHash) {
    console.log('no changes to snippet');
    return;
  }

  const [owner, repo] = GITHUB_REPOSITORY.split('/');
  const repoInfo = { owner, repo };

  const octokit = new github.GitHub(GITHUB_TOKEN);

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

  console.log('getting source tree from current commit');
  const getCommitResponse = await octokit.git.getCommit({
    ...repoInfo,
    commit_sha: GITHUB_SHA,
  });

  const getTreeResponse = await octokit.git.getTree({
    ...repoInfo,
    tree_sha: getCommitResponse.data.tree.sha,
    recursive: 1,
  });

  const srcTree = getTreeResponse.data.tree.find(el => el.path === SNIPPET_PATH);

  // https://octokit.github.io/rest.js/#octokit-routes-git-create-tree
  console.log('creating updated source tree with new snippet file');
  const createTreeResponse = await octokit.git.createTree({
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
    tree: createTreeResponse.data.sha,
    parents: [GITHUB_SHA],
  });

  const branchName = `refs/heads/snippetbot/updated-snippet-${Date.now()}`;
  // create a branch https://octokit.github.io/rest.js/#octokit-routes-git-create-ref
  console.log(`creating new branch named ${branchName}`);
  await octokit.git.createRef({
    ...repoInfo,
    ref: branchName,
    sha: commitResponse.data.sha,
  });

  // https://octokit.github.io/rest.js/#octokit-routes-pulls-create
  console.log(`creating PR for branch ${branchName}`);
  const base = GITHUB_REF.split('/').pop();
  const prResponse = await octokit.pulls.create({
    ...repoInfo,
    title: PR_TITLE,
    head: branchName,
    base: base,
  });

  const maintainers = JSON.parse(fs.readFileSync('./MAINTAINERS.json'));
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
