---
layout: post
title: "Phaser NPM Webpack TypeScript Starter Project"
date: 2017-02-1-01
excerpt: "Hit the ground running and make some great games with my Phaser NPM Webpack TypeScript Starter Project!"
tags: [project, phaser, typescript, npm, webpack, live-server, template, boilerplate]
project: true
comments: true
---

# Phaser NPM Webpack TypeScript Starter Project (catchy name, isn't it?)

##### Hit the ground running and make some great games!

###### If you use this template/starter project in any capacity; I'd love to hear about your experience with it. Whether you continued with it or decided not too (I really want to hear why you made your decision).

# Setup
To use this you’ll need to install a few things before you have a working copy of the project. But once you have node.js installed it only takes a few seconds and a couple commands to get going.

## 1. Clone this repo:

Navigate into your workspace directory.

Run:

```git clone git@github.com:rroylance/phaser-npm-webpack-typescript-starter-project.git```

## 2. Install node.js and npm:

https://nodejs.org/en/


## 3. Install dependencies:

Navigate to the cloned repo’s directory.

Run:

```npm install```

## 4. Run the watch process:

Run:

```npm run watch```

This will start a watch process, so you can change the source and the process will recompile and refresh the browser. Any changes to any files in assets/ or src/ will trigger the game to be recompiled which will cause the game to be reloaded in the browser to show your changes.

## 5. Run the development server:

Run:

```npm run live-server```

This will run a server so you can run the game in a browser.

Open your browser and enter localhost:9000/dist/ into the address bar (if it didn't open automatically/you closed the tab or window).

## Build for testing/developing/debugging:

Run:

```npm run build:dev```

This will build the game with a few caveats;
- A compile time flag, DEBUG, set to true; allowing you to include or not include certain code depending on if it's DEBUG build or not.
- The resulting game.js will not be minified and will include source maps

## Build for release:

Run:

```npm run build:dist```

This will build the game with a few caveats;
- The compile time flag, DEBUG, set to false; allowing you to include or not include certain code depending on if it's DEBUG build or not.
- The resulting game.min.js will be minified and will not include source maps

## Bugs/Issues?

If you have any issues please let me know via [GitHub Issues][issues]!

## Requests/Suggestions?

If you have any requests or suggestion for the project please let me know via [GitHub Issues][issues]!

## Contributing Code?

If you would like to have some of your code included; whether a new feature, a cleaned up feature, a bugfix, or whatever. Please open up a [Pull Request][pulls]!

[issues]: https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/issues
[pulls]: https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/pulls
