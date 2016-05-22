---
layout: post
title: 'Setting up Acer CB3-531-C4A5 Chromebook for development'
date: 2016-05-13
excerpt: 'Setting up Acer CB3-531-C4A5 Chromebook for development'
tags: [post, chromebook, acer, CB3-531-C4A5, Intel Celeron N2830, crouton, linux, ubuntu, xenial, development, tutorial, sublime text, github, terminal, shell, crosh, developer mode]
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
2. Click '+ ADD TO CHROME' button in the top left of the popup
3. Click 'Add extension' in the next popup
4. After a few seconds you should see a new page open up saying 'Thank you for installing the crouton extension!'
5. You can now close those tabs and confirm that the extension is running by looking for the **C icon** in the top right of Chrome. 

The crouton integration extension is now installed and we can move on to actually installing Ubuntu.

{% capture images %}
	../assets/img/step2-1.png
	../assets/img/step2-2.png
	../assets/img/step2-3.png
	../assets/img/step2-4.png
{% endcapture %}
{% include gallery images=images caption='' cols=2 %}

##### Note: From this point on I assume that you haven't changed your default download location/ your crouton installer script is located in Downloads #####

##### Note 2: I recommend having a USB keyboard and mouse handy; as once crouton nears completion your Chromebooks keyboard and touchpad may be disabled due to a recent bug in ChromeOS. Plugging in the USB keyboard and mouse once your input is locked will allow you to complete the installation; at which point you can restart your Chromebook and input will be re-enabled. #####

#### Step 3: Download crouton ####

1. Navigate to [crouton download link](https://goo.gl/fd3zc) which will save the crouton installer script to your Downloads folder.

{% capture images %}
	../assets/img/step3.png
{% endcapture %}
{% include gallery images=images caption='' cols=1 %}

#### Step 4: Install Ubuntu #####

1. Anywhere inside ChromeOS press **ctrl+alt+t**; this opens up a crosh shell (Chrome OS developer shell).
2. Once the crosh shell is open type **'shell'** to get the shell prompt.
3. Next it's time to start the installation of Ubuntu; type the command **'sudo sh ~/Downloads/crouton -r xenial -t xfce,xiwi'** and hit enter to start the process.
	* The **'-r'** in the command specifies what distribution you want to install. By default crouton will install an older LTS version, we want the latest and greatest.
	* The **'-t'** in the command specifies what targets to install; xfce is the desktop envioronment and xiwi is what allows us to run the Ubuntu desktop or applications in a window within ChromeOS.
4. The installation will take a while; once it is done downloading and installing things it will prompt you for a username to use for Ubuntu. Enter whatever you want that to be and hit **enter**.
5. You now need to enter your password for Ubuntu; note that you can't not have a password, you must set something.
6. Give it another minute and once you see 'chronos@localhost / $' (the only green in the entire process) you're all done and ready to use Ubuntu on your Chromebook!

{% capture images %}
	../assets/img/step4-1.png
	../assets/img/step4-2.png
	../assets/img/step4-3.png
	../assets/img/step4-4.png
	../assets/img/step4-5.png
	../assets/img/step4-6.png
	../assets/img/step4-7.png
	../assets/img/step4-8.png
{% endcapture %}
{% include gallery images=images caption='' cols=3 %}

#### Step 5: Setup Ubuntu ####
1. Enter the command **'sudo startxfce4'**; this will start the xfce desktop environment that we installed.
	* You will need to open up the crosh shell, type **'shell'** and then **'sudo startxfce4'** everytime you reboot your Chromebook.
2. After a second or two Ubuntu should now start up fullscreen; click **'Use default config'** on the popup that appears and wait until the desktop fully loads.
3. You can now click the **fullscreen button on your Chromebook keybaord to put Ubuntu in windowed mode**
4. While in windowed mode, or minimized, we can now confirm that the **crouton integration extension** is functioning by looking at the **C icon** in Chrome; there should be a 1 badge and clicking on it should show Chrome OS and xenial.

{% capture images %}
	../assets/img/step5-1.png
	../assets/img/step5-2.png
	../assets/img/step5-3.png
	../assets/img/step5-4.png
{% endcapture %}
{% include gallery images=images caption='' cols=2 %}

#### Step 6: Setup Git ####
1. In Ubuntu open up a terminal by clicking the icon on the dock on the bottom of the screen.
2. We are going to use apt to download and install git; first you need to run the command **'sudo apt-get update'** to update the list of available packages. You will need to type the password you set back in the crouton setup to run the command using sudo (which is necessary).
3. Once that completes type the command **'sudo apt-get install git-all'**; you do not need your password this time because you already authenticated this session in the update command.
4. Once that completes you now have git cli installed and almost ready to use.
5. Lastly you need to set your email and name in the git config; run the command **'git config --global user.email 'your@email.com''** to set your email.
6. Now run the command **'git config --global user.name 'Name''** to set your name. You are now ready to use git to your hearts content.

{% capture images %}
	../assets/img/step6-1.png
	../assets/img/step6-2.png
	../assets/img/step6-3.png
	../assets/img/step6-4.png
	../assets/img/step6-5.png
	../assets/img/step6-6.png
	../assets/img/step6-7.png
{% endcapture %}
{% include gallery images=images caption='' cols=2 %}

