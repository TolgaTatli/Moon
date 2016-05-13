---
layout: post
title: "Phaser Tips & Tricks"
date: 2016-05-13
excerpt: "Some, hopefully, helpful tips & tricks for Phaser."
tags: [post, tips, tricks, phaser, javascript, code]
comments: true
---

#### What is Phaser ?
 
 Phaser is a fast, free and fun open source HTML5 game framework. It uses a custom build of [Pixi.js](https://github.com/GoodBoyDigital/pixi.js/) for WebGL and Canvas rendering across desktop and mobile web browsers. Games can be compiled to iOS, Android and desktop apps via 3rd party tools like Cocoon, Cordova and Electron.
 
 Along with the fantastic open source community Phaser is actively developed and maintained by [Photon Storm Limited](http://www.photonstorm.com). As a result of rapid support and a developer friendly API Phaser is currently one of the [most starred](https://github.com/showcases/javascript-game-engines) game frameworks on GitHub.
 
 Thousands of developers worldwide use it. From indies and multi-national digital agencies to schools and Universities. Each creating their own incredible games. Grab the source and join in the fun!

#### On to the Tips...

1. When using tweens, set the value to a string instead of a number to make the tween relative to the current value.
{% highlight javascript %}
    var style = { font: "65px Arial", fill: "#FF0000", align: "center" };
    var text = game.add.text(game.world.centerX, game.world.centerY, "PHASER !", style);
    text.anchor.set(0.5);
    text.alpha = 0.5;

    //This will tween the alpha to 1 since the alpha starts at 0.5 and the value was used as a string.
    game.add.tween(text).to( { alpha: "0.5" }, 2000, "Linear", true);
    //This will do nothing, since the alpha is already 0.5.
    game.add.tween(text).to( { alpha: 0.5 }, 2000, "Linear", true);
    //This will do tween the alpha to 1, but is more verbose than just using the string.
    game.add.tween(text).to( { alpha: text.alpha + 0.5 }, 2000, "Linear", true);
{% endhighlight %}
