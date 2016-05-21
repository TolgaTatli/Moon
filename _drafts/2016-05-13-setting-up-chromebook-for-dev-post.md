---
layout: post
title: 'Setting up Acer CB3-531-C4A5 Chromebook for development'
date: 2016-05-13
excerpt: 'Setting up Acer CB3-531-C4A5 Chromebook for development'
tags: [post, chromebook, acer, CB3-531-C4A5, Intel Celeron N2830, crouton, linux, ubuntu, xenial, development]
comments: true,
feature: /assets/img/chromebook-ubuntu.jpg
---

Back at the end of March I saw the [Acer CB3-531-C4A5 Chromebook was on sale on Newegg](http://www.newegg.ca/Product/Product.aspx?Item=N82E16834315227) for the pretty decent price of $170 CAD (as of writing this, still on sale for $200 CAD), so I thought 'What the hell, let's see what we can do with these Chromebook things'. I was pleasently surprised and love my Chromebook, this post will take you step by step from factory fresh to running the latest and greatest Ubuntu 16.04 LTS codename 'Xenial Xerus' along side the latest Chrome OS with the ability to run Ubuntu Desktop (XFCE in this case) or even specific programs in a window within Chrome OS !
 
#### Step 1: Set your Chromebook to Developer Mode

1. Press and hold the **esc+refresh** keys, then press the **power** key (while still holding the other two). This will reboot your Chromebook into Recovery Mode.
2. As soon as you see Recovery Mode pop up (the screen with the yellow exclamation point) press **ctrl+d**. This will bring up a prompt asking if you want to turn on Developer Mode.
3. Press **enter** to continue, then give it some time. It'll pop up with a new screen for a few moments, then reboot and go through the process of enabling Developer Mode.
4. When it's done, it will return to the screen with the red exclamation point. Press **ctrl+d** or leave it alone for 30 seconds and it will boot into Chrome OS, now in Developer Mode.

#### Step 2: Install crouton extension ####

1. Navigate to [crouton integration Extension @ Chrome Webstore](https://goo.gl/OVQOEt)
2. Click 'ADD TO CHROME' button in the top left of the popup
3. Click 'Add extension' in the next popup
4. After a few seconds you should see a new page open up saying 'Thank you for installing the crouton extension!'
5. You can now close those tabs and confirm that the extension is running by looking for the C icon in the top right of Chrome. 

The crouton integration extension is now installed and we can move on to actually installing Ubuntu.

{% capture images %}
	assets/img/step2.1.png
	assets/img/step2.2.png
	assets/img/step2.3.png
	assets/img/step2.4.png
{% endcapture %}
{% include gallery images=images caption='' cols=4 %}