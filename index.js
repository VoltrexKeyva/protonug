#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command()
  .name('protonug')
  .description(
    'An installer/updater for the GE (GloriousEggroll) custom Steam Proton builds.'
  )
  .showHelpAfterError();

const command = program
  .command('update')
  .description('Update the GE Proton build.')
  .option('-c, --clean', 'Remove the older existing GE proton builds.');

program.parse();

const options = command.opts();

import fetch from 'node-fetch';
import semver from 'semver';
import { extract } from 'tar';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, createWriteStream } from 'node:fs';
import { mkdir, readdir, unlink, rm } from 'node:fs/promises';

process.stdout.write('Getting the latest release of GE Proton...');

const latestRelease = await fetch(
  'https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases/latest',
  { headers: { Accept: 'application/vnd.github+json' } }
)
  .then((res) => res.json())
  .catch((err) => {
    console.error(
      '\nAn error occured while getting the latest release of GE Proton: ',
      err
    );

    process.exit(1);
  });

process.stdout.write(' Done\n');

const geProtonFileNameReg = /^GE-Proton(\d+-\d+)\.tar\.gz$/;
const geProtonDirNameReg = /^GE-Proton(\d+-\d+)$/;
const latestGeProton = latestRelease.assets.find((asset) =>
  geProtonFileNameReg.test(asset.name)
);

if (latestGeProton === undefined) {
  console.error(
    'The latest release of GE Proton does not appear to have a valid GE Proton build tarball'
  );

  process.exit(1);
}

let firstCreation = false;

const steamCompatibilityToolsPath = join(
  homedir(),
  '.steam',
  'root',
  'compatibilitytools.d'
);

if (!existsSync(steamCompatibilityToolsPath)) {
  firstCreation = true;

  process.stdout.write(
    `Creating the Steam compatibility tools directory (${steamCompatibilityToolsPath})...`
  );

  await mkdir(steamCompatibilityToolsPath, { recursive: true });

  process.stdout.write(' Done\n');
}

const geProtonBuilds = firstCreation
  ? []
  : await readdir(steamCompatibilityToolsPath).then((entries) =>
      entries
        .map((entry) => ({
          entry,
          version: convertNameToVersion(entry, true)
        }))
        .sort((a, b) => semver.compare(b.version, a.version))
    );
const latestGeProtonName = latestGeProton.name;
const latestVersion = convertNameToVersion(latestGeProtonName);

let getLatestGeProton = false;
let install = false;
let removeGeProtonBuilds = false;

if (geProtonBuilds.length === 0) {
  install = true;
  getLatestGeProton = true;
} else {
  console.log('Found existing GE Proton builds');

  const latestExistingGeVer = geProtonBuilds[0].version;

  if (semver.gt(latestVersion, latestExistingGeVer)) {
    console.log(
      `Found a newer version of GE Proton! (${latestVersion} > ${latestExistingGeVer})`
    );

    getLatestGeProton = true;

    if (options.clean) {
      console.log('Deferring removal of the existing GE Proton builds...');

      removeGeProtonBuilds = true;
    }
  }
}

if (!getLatestGeProton) {
  console.log('GE Proton is up-to-date');

  process.exit(0);
}

const downloadLogPrefix = `Downloading the latest GE Proton build tarball... (${latestGeProtonName})`;

process.stdout.write(downloadLogPrefix);

const res = await fetch(latestGeProton.browser_download_url, {
  headers: { Accept: 'application/octet-stream' }
});
const geProtonStream = res.body.pipe(createWriteStream(latestGeProtonName));

const downloadSize = res.headers.get('content-length');
let downloadedSize = 0;

const loadingLines = ['\\', '|', '/', '-'];
const loadingLinesLen = loadingLines.length;
let loadingLineIndex = 0;

await new Promise((resolve) => {
  const loadingInterval = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${loadingLines[loadingLineIndex++]} ${downloadLogPrefix} (${Math.trunc(
        (downloadedSize / downloadSize) * 100
      )}% | ${Math.trunc(downloadedSize / 1_024 / 1_024).toLocaleString(
        'en-US'
      )}MB)`
    );

    if (downloadedSize >= downloadSize) {
      clearInterval(loadingInterval);

      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write('✓ Downloaded the latest GE Proton build tarball\n');
      resolve();
    }

    downloadedSize = geProtonStream.bytesWritten;

    loadingLineIndex %= loadingLinesLen;
  }, 250);
});

process.stdout.write('Extracting the latest GE Proton build from tarball...');

await extract({
  file: latestGeProtonName,
  C: steamCompatibilityToolsPath
});

process.stdout.write(' Done\n');

process.stdout.write(
  'Removing the downloaded GE Proton build tarball after extraction...'
);

await unlink(latestGeProtonName);

process.stdout.write(' Done\n');

if (removeGeProtonBuilds) {
  console.log('Removing existing older GE Proton builds:');

  for (const geProtonBuild of geProtonBuilds) {
    process.stdout.write(`Removing ${geProtonBuild.entry}...`);

    await rm(join(steamCompatibilityToolsPath, geProtonBuild.entry), {
      recursive: true
    });

    process.stdout.write(' Done\n');
  }
}

console.log(
  `Successfully ${
    install ? 'installed' : 'updated to'
  } GE Proton ${latestVersion}`
);

function convertNameToVersion(name, isDir = false) {
  return `${name
    .match(isDir ? geProtonDirNameReg : geProtonFileNameReg)[1]
    .replaceAll('-', '.')}.0`;
}
