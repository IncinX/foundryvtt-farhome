# Farhome Game System

[Farhome](https://farhomerpg.com/) is a tabletop role-playing game created by Andrew Solheim. This repository contains the source code for the Farhome game system, which is a [Foundry VTT](https://foundryvtt.com/) module.

## Installation

In the FoundryVTT Configuration and Setup screen, select the *Game Systems* tab, click *Install System*, enter ```https://github.com/IncinX/foundryvtt-farhome/releases/latest/download/system.json``` in the Manifest URL field, and click *Install*.

Create a game world by picking the *Game Worlds* tab and clicking *Create World*, then select the *Farhome* from the *Game System* drop down menu. You can now start your game!

## Development

### Prerequisites

In order to build this system, recent versions of `node` and `npm` are
required. Most likely, using `yarn` also works, but only `npm` is officially
supported. We recommend using the latest lts version of `node`. If you use `nvm`
to manage your `node` versions, you can simply run

```
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```
npm install
```

### Building

You can build the project by running

```
npm run build
```

Alternatively, you can run

```
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built system to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```
{
  "dataPath": "/absolute/path/to/your/FoundryVTT"
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of
`/`)

Then run

```
npm run link-project
```

On Windows, creating symlinks requires administrator privileges, so unfortunately
you need to run the above command in an administrator terminal for it to work.

### Running lint

Modifications to the repository require it to pass a lint check which uses [prettier](https://prettier.io/).

```
npm lint
```

It is recommended to also use [Prettier code formatter for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to automatically format your code.

### Running the tests

You can run the tests with the following command:

```
npm test
```

### Creating a release

In the GitHub project, create a new release. The release name should be the version number of the release. The release tag should be the same as the release name. The release description should be the changelog for the release.

This can be done by selecting *Draft New Release* from the GitHub releases page. *Choose a tag*, and enter the release tag name. Choose *Generate release notes* to automatially generate a set of release notes and click *Publish release*.

GitHub Actions will automatically package the release and upload it to the new release page after a few minutes. Any errors will be displayed in the GitHub *Actions* tab.

## Licensing

This project is being developed under the terms of the [LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT](https://foundryvtt.com/article/license/) for [Foundry Virtual Tabletop](https://foundryvtt.com/).

The source code for this project is MIT licensed. See [LICENSE](/LICENSE.md) for detailed source code licensing terms.

This project was started using the [League Basic JS Module Template](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template).


