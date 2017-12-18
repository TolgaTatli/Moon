---
title: "Shell Basics- Part 1"
author: "NOWHERE"
date: "2017-08-16"
description: "This post introduces frequently used shell commands (#part 1)."
tags: [Shell Programming]
categories: [programming]
permalink: /:categories/:title
---
- [1. Introduction](#1)
- [2. pwd](#2)
- [3. date](#3)
- [4. chmod](#4)
- [5. wc](#5)
- [6. sort](#6)
- [7. cut](#7)
- [8. dd](#8)
- [9. compress](#9)

<h2 id="1">Introduction</h2>
From my perspectives, shell/Bash script is a very light-weighted programming script and if you have tried different flavoured Linux systems, you must be familiar with it.

There are many software developing and IT operation and maintenance activities happen on Linux systems, since shell/Bash is the command to be used to interact with such systems, it is popular among developers.

In the recent 10 years, with the development of big data processing techniques, shell programming has become more popular, since those techniques such as Hadoop and its eco-systems naturally/prioritizedly support Linux systems.

Thus, learning how to write basic shell scripts is very important. In this blog, I will introduce some basic and useful shell commands that I know.

<h2 id="2">pwd</h2>

First thing first, shell can only recognize the command in **lower case**.

Actually, no matter you logged on a linux system, macos system or windows system, you can always type `pwd` to get your current working directory.

{% highlight Bash linenos %}

nowhere@DESKTOP-FGKJ8NU:/mnt/c/Users/nowhere$ pwd
/mnt/c/Users/nowhere

{% endhighlight %}

<h2 id="3">date</h2>

If you want to check the date of your system, you could simply use `date`.

{% highlight Bash linenos %}

nowhere@DESKTOP-FGKJ8NU:/mnt/c/Users/nowhere$  date
Monday 7 August  01:07:10 DST 2017

# customize the output format

nowhere@DESKTOP-FGKJ8NU:/mnt/c/Users/nowhere$  `date +DATE:%m-%y%nTIME:%h:%M:%S'
DATE:08-17
TIME:01:08:44

{% endhighlight %}

<h2 id="4">date</h2>
In Linux systems, there are basically three actions:
- r -- read
- w -- write
- x -- execute

also, there three kinds of roles:
- owner
- group
- others

Thus, if you want to change the permission of one/specific files, you could use `chmod`

{% highlight Bash linenos %}
# create a testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat > eps-10-chmod
this is test for chmod

# show permission of all files under the current working directory
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ ll
total 14514
...
-rwxrwxrwx 1 root root    23 Aug 16 03:20 eps-10-chmod*
...

# change the permission of eps-10-chmod
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ chmod 444 eps-10-chmod

# show permission again
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ ll
total 14514
...
-r-xr-xr-x 1 root root    23 Aug 16 03:20 eps-10-chmod*
...

{% endhighlight %}

<h2 id="5">wc</h2>
When using shell to process strings, `wc` is a very convenient command, which could count lines/words/characters for you of you input strings.

{% highlight Bash linenos %}

# show content of the testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat eps-11-countwc
This is a test file for practice the wc.
Just make.
One more line.

# show number of lines/words/characters of testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ wc eps-11-countwc
 4 14 68 eps-11-countwc

# show number of lines in the testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ wc -l eps-11-countwc
4 eps-11-countwc

# show number of words in the testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ wc -w eps-11-countwc
14 eps-11-countwc

# show number of characters of testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ wc -c eps-11-countwc
68 eps-11-countwc

{% endhighlight %}

<h2 id="6">sort</h2>
`sort` is also a very important command and it deserved one blog to specifically introduce in the future. Here just simply illustrate its default.

{% highlight Bash linenos %}

# show the content of testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat eps-12-sort
chicken
dog
cat
frog
goose
cow
people
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$

# using sort to sort the words based on the alphabetical order
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ sort eps-12-sort
cat
chicken
cow
dog
frog
goose
people

{% endhighlight %}

<h2 id="7">cut</h2>
`cut` can help you to print the selected content in one file.

{% highlight Bash linenos %}

# show the content of the testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat > eps-13-cut
Name-Sport-Age
Roger-Tennis-30
Rafel-Tennis-25
Tiger-Golf-37
Michael-Baller-50
Kobe-Baller-38

# print the first column- the deliminator is "-"
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cut -d"-" -f 1 eps-13-cut
Name
Roger
Rafel
Tiger
Michael
Kobe

# print the first and the third column- the deliminator is "-"
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cut -d"-" -f 1,3 eps-13-cut
Name-Age
Roger-30
Rafel-25
Tiger-37
Michael-50
Kobe-38

{% endhighlight %}

<h2 id="8">dd</h2>
`dd` can be used to convert files into different format or contents.

{% highlight Bash linenos %}

# create a testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat > eps-14-dd
This is an ascii text file.

# convert if (input file) into of (output file), here jsut make all the letters upper case (ucase)
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ dd if=eps-14-dd of=eps-14-dd-of conv=ucase
0+1 records in
0+1 records out
28 bytes copied, 0.006968 s, 4.0 kB/s

# make another testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat eps-14-dd-of
THIS IS AN ASCII TEXT FILE.

# convert the ASCII file into EBCDIC encoding method
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ dd if=eps-14-dd of=eps-14-dd-of conv=ebcdic
0+1 records in
0+1 records out
28 bytes copied, 0.00698 s, 4.0 kB/s

nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ cat eps-14-dd-of
㈉@@@@@K%

nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ file *
...
eps-14-dd-of:   Non-ISO extended-ASCII text, with NEL line terminators
...

{% endhighlight %}

<h2 id="9">compress</h2>
Once you have a large size file and you want to reduce its size, `compress` will be a very useful tool.

{% highlight Bash linenos %}

# compress the testing file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ compress -v eps-15-compress
eps-15-compress:  -- replaced with eps-15-compress.Z Compression: 88.65%
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ ls -sh
total 6.6M
...  353K eps-15-compress.Z  ...

# show the content of the compressed file
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ zcat eps-15-compress.Z | head -10
hello world
test '-compress'
hello world
test '-compress'
hello world
test '-compress'
hello world
test '-compress'
hello world
test '-compress'

# convert the compressed file back
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ uncompress eps-15-compress.Z
nowhere@DESKTOP-FGKJ8NU:/mnt/d/Github/Shell7Days$ ls -sh
total 11M
...   4.1M eps-15-compress  ...

{% endhighlight %}
