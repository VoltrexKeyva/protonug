# Protonug

An installer and updater for the [GE (GloriousEggroll) custom Steam Proton](https://github.com/GloriousEggroll/proton-ge-custom) builds.

⚠️ **Note: this currently only works on Linux, if you wish to add support for other operating systems, open a pull request!**

## Prerequisites

1. The Git CLI ([official website](https://git-scm.com/)).
2. The Node.js runtime ([official website](https://nodejs.org/)).

## Setup

First, clone this repository using the Git CLI:

```console
$ git clone https://github.com/VoltrexMaster/protonug
```

Then change the current working directory to the root directory of this repository you just cloned:

```console
$ cd protonug
```

And finally, install the dependencies of the installer/updater using the npm CLI normally bundled with the Node.js runtime:

```console
$ npm install
```

## Usage

To run the installer/updater, simply run `npm run update` in the root directory of the repository.

If you want the updater to remove the older existing GE Proton builds after updating, you can run `npm run update-clean` instead.

**Note: this will install GE Proton if the `~/.steam/root/compatibilitytools.d` directory either doesn't exist or is empty.**
