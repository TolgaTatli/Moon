---
layout: post
title: "Phaser Tips & Tricks"
date: 2016-05-13
excerpt: "Some, hopefully, helpful tips & tricks for Phaser."
tags: [post, tips, tricks, phaser, javascript, code]
comments: true
---

##### Do you have a tip you'd like added ? Post in the comments below or [send me an email](mailto:roylance.richard+phasertips@gmail.com?Subject=Phaser%20Tip%20Suggestion "EMAIL ME!").

=====

#### What is Phaser?

 Phaser is a fast, free and fun open source HTML5 game framework. It uses a custom build of [Pixi.js](https://github.com/GoodBoyDigital/pixi.js/) for WebGL and Canvas rendering across desktop and mobile web browsers. Games can be compiled to iOS, Android and desktop apps via 3rd party tools like Cocoon, Cordova and Electron.

 Along with the fantastic open source community Phaser is actively developed and maintained by [Photon Storm Limited](http://www.photonstorm.com). As a result of rapid support and a developer friendly API Phaser is currently one of the [most starred](https://github.com/showcases/javascript-game-engines) game frameworks on GitHub.

 Thousands of developers worldwide use it. From indies and multi-national digital agencies to schools and Universities. Each creating their own incredible games. Grab the source and join in the fun!

#### On to the Tips...

-  When using tweens, set the value to a string instead of a number to make the tween relative to the current value.
{% highlight javascript %}
    var style = { font: "65px Arial", fill: "#FF0000", align: "center" };
    var text = game.add.text(game.world.centerX, game.world.centerY, "PHASER!", style);
    text.anchor.set(0.5);
    text.alpha = 0.5;

    //This will tween the alpha to 1 since the alpha starts at 0.5 and the value was used as a string.
    game.add.tween(text).to( { alpha: "0.5" }, 2000, "Linear", true);
    //This will do nothing, since the alpha is already 0.5.
    game.add.tween(text).to( { alpha: 0.5 }, 2000, "Linear", true);
    //This will do tween the alpha to 1, but is more verbose than just using the string.
    game.add.tween(text).to( { alpha: text.alpha + 0.5 }, 2000, "Linear", true);
{% endhighlight %}

- When working with pixel art set roundPixels to true to prevent Phaser from rendering graphics at sub pixel locations (which causes blurring)
{% highlight javascript %}
    game.renderer.renderSession.roundPixels = true;
{% endhighlight %}

- When you need to set a property on all children in a Group, don't use a loop, simply use setAll.
{% highlight javascript %}
    group.setAll("property.evenSubPropertiesAreSupported", value);
{% endhighlight %}

- Need the benefits of using a sprite as a container and a group just wont cut it? Use a blank sprite!
{% highlight javascript %}
    //This leaves the sprite frame, sprite sheet ID, and parent group blank;
    //Adding the sprite to the world.
    var sprite = game.add.sprite(0, 0);

    //This leaves the sprite frame, and sprite sheet ID blank;
    //Adds the sprite to the specified group.
    var sprite = game.add.sprite(0, 0, undefined, undefined, group);
{% endhighlight %}

- Destroying an object in the onComplete callback of a tween being performed on the object will cause errors. You can either kill the object (does not destroy the object or remove it from memory), or delay the destroy call by one frame.
{% highlight javascript %}
    //Causes errors
    game.add.tween(sprite).to({ alpha: 0 }, 1000, 'Linear', true).onComplete.addOnce(sprite.destroy, this);

    //Kill method
    game.add.tween(sprite).to({ alpha: 0 }, 1000, 'Linear', true).onComplete.addOnce(sprite.kill, this);

    //Timeout method
    game.add.tween(sprite).to({ alpha: 0 }, 1000, 'Linear', true).onComplete.addOnce(function () {
        sprite.exists = false;
        setTimeout(sprite.destroy, 0);
    }, this);
{% endhighlight %}
