#!/usr/bin/env node

const { logger, spawnOrFail, prompt, shouldContinuePrompt, quit, fs, process, path } = require('./cli-utils');
// process.chdir(path.join(__dirname, '..'));
const currentVersion = require('../package.json').version;

const getNewVersion = (currentVersion, versionIncrement) => {
  const ver_arr = currentVersion.split('.');
  switch (versionIncrement) {
    case 1: //Patch
      if (ver_arr[3]) {
        logger.error(`ERROR: Cannot increase patch in pre-release version `);
        return undefined;
      }  
      ver_arr[2] = Number(ver_arr[2]) + 1;
      return ver_arr.join('.');
    case 2: // Minor
      if (ver_arr[3]) {
        logger.error(`ERROR: Cannot increase patch in pre-release version `);
        return undefined;
      }  
      ver_arr[1] = Number(ver_arr[1]) + 1;
      return ver_arr.join('.');
    case 3: //Major
      if (ver_arr[3]) {
        return currentVersion.split('-')[0];
      }  
      ver_arr[0] = Number(ver_arr[0]) + 1;
      return ver_arr.join('.');
    case 4: // Beta
      if (ver_arr[3]) { //Existing beta
        ver_arr[3] = Number(ver_arr[3]) + 1;
        return ver_arr.join('.');
      }
      ver_arr[0] = Number(ver_arr[0]) + 1;
      return ver_arr.join('.') + '-beta.0';
    default:
      logger.error(`ERROR: Invalid input: ${versionIncrement}`); 
      return undefined;
  }
}

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
}

const versionBump = async () => {
  logger.log('Choose one of the following options to bump the next version:');
  logger.log('  1. Patch');
  logger.log('  2. Minor');
  logger.log('  3. Major');
  logger.log('  4. Beta');
  const option = await prompt('');
  const newVersion = getNewVersion(currentVersion, Number(option));
  if (!newVersion) {
    quit(1);
  }
  logger.warn('Warning: you are bumping the version\n');
  logger.warn(`  From: ${currentVersion}\n`);
  logger.warn(`  To: ${newVersion}\n`);
  await shouldContinuePrompt('Type \'yes\' to continue\n');
  spawnOrFail('npm', [`version ${newVersion} --no-git-tag-version`]);
  updateChangelog(newVersion);

  logger.log('Committing version bump...');
  spawnOrFail('git', ['add -A']);
  spawnOrFail('git', [`commit -m "Version bump for amazon-chime-sdk-js@${newVersion}"`]);
  logger.log('Do you want to upload these files to version-bump branch');
  await shouldContinuePrompt('Type \'yes\' to continue\n');
  spawnOrFail('git', ['push origin HEAD:version-bump -f']);
}

module.exports = {
  versionBump,
  currentVersion,
}