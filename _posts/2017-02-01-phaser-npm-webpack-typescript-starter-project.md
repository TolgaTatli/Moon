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

[Link to GitHub Repo!][repo]

##### Hit the ground running and make some great games!

###### If you use this template/starter project in any capacity; I'd love to hear about your experience with it. Whether you continued with it or decided not too (I really want to hear why you made your decision).

# Setup
To use this you’ll need to install a few things before you have a working copy of the project. But once you have node.js installed it only takes a few seconds and a couple commands to get going.

## 1. Clone this repo:

Navigate into your workspace directory.

Run:

```git clone https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project.git```

## 2. Install node.js and npm (npm is included and installed with node.js):

https://nodejs.org/en/


## 3. Install dependencies:

Navigate to the cloned repo’s directory.

Run:

```npm install```

## 4. Run the dev server:

Run to use the dev build while developing:

```npm run server:dev```

Run to use the dist build while developing 

```npm run server:dist```

###### The only real reason I can think of to use the dist server is if the minification process is breaking something in your game and you need to test using the minified version, or something you excluded with the DEBUG flag shouldn't have been excluded.

This will run a server that serves your built game straight to the browser and will be built and reloaded automatically anytime a change is detected.

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

[Link to GitHub Repo!][repo]

[repo]: https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project
[issues]: https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/issues
[pulls]: https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/pulls
