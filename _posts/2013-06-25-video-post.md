---
layout: post
title:  "A Post with a Video"
date:   2016-03-15
excerpt: "Custom written post descriptions are the way to go... if you're not lazy."
tag:
- sample
- post
- video
comments: true
---
<iframe width="560" height="315" src="//www.youtube.com/embed/SU3kYxJmWuQ" frameborder="0"> </iframe>

Video embeds are responsive and scale with the width of the main content block with the help of [FitVids](http://fitvidsjs.com/).

Not sure if this only effects Kramdown or if it's an issue with Markdown in general. But adding YouTube video embeds causes errors when building your Jekyll site. To fix add a space between the `<iframe>` tags and remove `allowfullscreen`. Example below:

{% highlight html %}
<iframe width="560" height="315" src="//www.youtube.com/embed/SU3kYxJmWuQ" frameborder="0"> </iframe>
{% endhighlight %}
