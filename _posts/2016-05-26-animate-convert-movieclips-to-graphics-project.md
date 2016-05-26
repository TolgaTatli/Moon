---
layout: post
title: "Adobe Animate CC (and probably Flash) Convert MovieClips in Scene to Graphics"
date: 2016-05-13
excerpt: "Converts all MovieClips (recursively) in an open scene to Graphics."
tags: [project, adobe, animate, flash, command, jsfl, script, javascript, movieclip, graphic]
project: true
comments: true
---

#### Adobe Animate CC (and probably Flash) Convert MovieClips in Scene to Graphics ####

I wrote up a little jsfl script to recursively go through an open scene and convert all the MovieClips to Graphics, I needed this for several FLAs I was getting as the artists liked to nest MovieClips in MovieClips in MovieClips and so on… and nested MovieClips do not export their animations (only the first frame is used) when using Export PNG Sequence or Generate Sprite Sheet, Graphics do not care if they are nested and export just fine.

Note that this should only be used in a scene that has the individual elements/animations on the stage ready for exporting, NOT a long complex animation with a bunch of layers and nested elements, as that will lock up Animate because there is so much going on.

The command is saved as a JavaScript file (with the extension .jsfl) in your Commands folder.

This folder is in the following locations;

* Windows: boot drive\Documents and Settings\<user>\AppData\Adobe\<Product (Flash or Animate)> \<language>\Configuration\Commands
* Mac OSX: Macintosh HD/Users/<username>/Library/Application Support/Adobe/<Product (Flash or Animate)> /<language>/Configuration/Commands. (not confirmed as I’m not on Mac)
