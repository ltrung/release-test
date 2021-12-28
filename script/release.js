#!/usr/bin/env node

const { versionBump, currentVersion }  = require('./version-util');
const { logger, spawnOrFail, prompt, shouldContinuePrompt, quit, process, path } = require('./cli-utils');

const deployDemo = (version) => {
  const demo_name = `chime-sdk-demo-${version.replace(/\./g, "-")}`;
  logger.log(`Deploying ${demo_name} ...`);
  // process.chdir(path.join(__dirname, '../demos/serverless'));
  // spawnOrFail('npm', [`run deploy -- -b ${demo_name} -s ${demo_name} -o ${demo_name} -u false`], { printErr: true });
};

const release = async () => {
  spawnOrFail('git', ['fetch origin'], { skipOutput: true });
  const currentBranch = (spawnOrFail('git', [' branch --show-current'], { skipOutput: true })).trim();
  const remoteBranch = (spawnOrFail('git', ['for-each-ref --format="%(upstream:short)" "$(git symbolic-ref -q HEAD)"'], { skipOutput: true })).trim();
  if (!remoteBranch || (remoteBranch !== 'origin/main' && (/^origin\/release-[0-9]+\.x$/).test(remoteBranch))) {
    logger.error(`The local branch ${currentBranch} does not track either main or release-<version>.x branch`);
    quit(1);
  }
  logger.warn(`Warning: Resetting HEAD to ${remoteBranch}.\nAll current staged and local changes will be lost.`);
  await shouldContinuePrompt('Do you wish to continue\n');
  // spawnOrFail('git', [`reset --hard ${remoteBranch}`]);
  // spawnOrFail('git', [' clean -ffxd .']);

  logger.log('Building package...');
  spawnOrFail('npm', ['run build:release']);
  logger.log('Packaging ...');
  spawnOrFail('npm', ['pack --dry-run'], { printErr: true });
  logger.log('Do you want to upload these files to release branch');
  await shouldContinuePrompt('Type \'yes\' to continue\n');
  spawnOrFail('git', ['push origin HEAD:release -f']);
  deployDemo(currentVersion);

  //Bump next development version
  versionBump();
}

const main = async () => {
  logger.log('Choose one of the following options:');
  logger.log('  1. Release');
  logger.log('  2. Hotfix');
  logger.log('  3. Deploy demo');
  const option = await prompt('');
  
  switch (option) {
    case '1':
      release();
      break;
    default: 
      if (option) {
        logger.error('Invalid option');
      }
      quit(1);
  }
  // logger.log(`Resetting HEAD to origin/${currentBranch}`);
  // // spawnOrFail('git', [`reset --hard origin/${currentBranch}`]);
  // // spawnOrFail('git', [' clean -ffxd .']);

  // logger.log('Building package...');
  // spawnOrFail('npm', ['run build:release']);
  // logger.log('Packaging ...');
  // spawnOrFail('npm', ['pack --dry-run'], { printErr: true });

  // logger.log('Do you want to upload these files');
  // let cont = await shouldContinuePrompt('Type \'yes\' to continue\n');
  // if (!cont) {
  //   quit(0);
  // }
  // if (option === '1') { //Release
  //   spawnOrFail('git', ['push origin HEAD:release -f']);
  //   deployDemo(currentVersion);
  // } else if (option === '2') { //Hotfix
  //   spawnOrFail('git', ['push origin HEAD:hotfix -f']);
  // }
}

main();