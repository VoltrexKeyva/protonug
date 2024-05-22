# Protonug

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

An installer and updater for the [GE (GloriousEggroll) custom Steam Proton](https://github.com/GloriousEggroll/proton-ge-custom) builds.

⚠️ **Note: this currently only works on Linux.**

## Prerequisite

The Node.js runtime ([official website](https://nodejs.org/)).

## Installation

Install Protonug globally using npm with the `--global` flag:

```console
$ npm install --global protonug
```

## Usage

To run the installer/updater, simply run:

```console
$ protonug update
```

If you want Protonug to remove the older existing GE Proton builds after updating, you can run the `update` command with the `--clean` flag (`-c` for short):

```console
$ protonug update --clean
```

**Note: this will install GE Proton if the `~/.steam/root/compatibilitytools.d` directory either doesn't exist or is empty.**

# Uninstallation

You can uninstall Protonug using npm:

```console
$ npm remove --global protonug
```
