#!/usr/bin/env node

const { logger, spawnOrFail, prompt, shouldContinuePrompt, quit, fs, process, path } = require('./cli-utils');
// process.chdir(path.join(__dirname, '..'));
const currentVersion = require('../package.json').version;

const isPreRelease = (version) => {
  return version.split('.')[3] >0;
};

const getNewVersion = (currentVersion, versionIncrement) => {
  const verArr = currentVersion.split('.');
  const isBeta = isPreRelease(currentVersion);
  switch (versionIncrement) {
    case 1: //Patch
      if (isBeta) {
        logger.error(`ERROR: Cannot increase patch in pre-release version `);
        return undefined;
      }  
      verArr[2] = Number(verArr[2]) + 1;
      return verArr.join('.');
    case 2: // Minor
      if (isBeta) {
        logger.error(`ERROR: Cannot increase patch in pre-release version `);
        return undefined;
      }  
      verArr[1] = Number(verArr[1]) + 1;
      return verArr.join('.');
    case 3: //Major
      if (isBeta) {
        return currentVersion.split('-')[0];
      }  
      verArr[0] = Number(verArr[0]) + 1;
      return verArr.join('.');
    case 4: // Beta
      if (isBeta) { //Existing beta
        verArr[3] = Number(verArr[3]) + 1;
        return verArr.join('.');
      }
      verArr[0] = Number(verArr[0]) + 1;
      return verArr.join('.') + '-beta.0';
    default:
      logger.error(`ERROR: Invalid input: ${versionIncrement}`); 
      return undefined;
  }
};

const updateChangelog = (newVersion) => {
  logger.log(`Updating CHANGELOG.md with a new release entry - ${newVersion}`);
  const filePath = path.resolve(__dirname, '../CHANGELOG.md');
  let changeLog = fs.readFileSync(filePath).toString();
  const latestEntryIndex = changeLog.indexOf('## [');
  const newEntry = `## [${newVersion}] - ${new Date().toISOString().slice(0, 10)}
    \n### Added
    \n### Removed
    \n### Changed
    \n### Fixed
    \n`;
  changeLog = changeLog.substring(0, latestEntryIndex) + newEntry + changeLog.substring(latestEntryIndex);
  fs.writeFileSync(filePath, changeLog);
};

const versionBump = async (option, branchName) => {
  if (!option) {
    logger.log('Choose one of the following options to bump the next version:');
    logger.log('  1. Patch');
    logger.log('  2. Minor');
    logger.log('  3. Major');
    logger.log('  4. Beta');
    const option = Number(await prompt(''));
  }
  const newVersion = getNewVersion(currentVersion, option);
  if (!newVersion) {
    quit(1);
  }

  branchName = branchName ? branchName : 'version-bump';

  const prevReleaseBranch = !isPreRelease(currentVersion) && (option === 3 || option === 4) 
    ? `release-${currentVersion.split('.')[0]}.x`
    : '';

  logger.warn('Warning: you are bumping the version\n');
  logger.warn(`  From: ${currentVersion}\n`);
  logger.warn(`  To: ${newVersion}\n`);
  if (prevReleaseBranch) {
    logger.warn(`  This will also create ${prevReleaseBranch} branch.`);
  }
  await shouldContinuePrompt('Type \'yes\' to continue\n');

  if (prevReleaseBranch) {
    spawnOrFail('git', [`push origin HEAD:${prevReleaseBranch} -f`]);
    logger.log(`Branch ${prevReleaseBranch} is created. Please make sure to set branch protection.`);
  }

  spawnOrFail('npm', [`version ${newVersion} --no-git-tag-version`]);
  updateChangelog(newVersion);

  logger.log('Committing version bump...');
  spawnOrFail('git', ['add -A']);
  spawnOrFail('git', [`commit -m "Version bump for amazon-chime-sdk-js@${newVersion}"`]);
  await shouldContinuePrompt(`Do you want to upload these files to ${branchName} branch?\n`);
  spawnOrFail('git', [`push origin HEAD:${branchName} -f`]);
  logger.log('Please create a pull request to merge the version bump to main.');
};

module.exports = {
  versionBump,
  currentVersion,
};