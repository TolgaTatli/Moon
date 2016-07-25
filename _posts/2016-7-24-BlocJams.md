---
layout: post
title: Bloc Jams
excerpt: "Music player app built in Angular."
date:   2016-07-24
project: true
heroku-link: https://bloc-jams-foundation-app.herokuapp.com/
github-link: https://github.com/transplanar/bloc-jams-angular
tag:
- Bloc
- Frontend
- Angular
- Foundation

comments: true
---

# Jamming Out
*Bloc Jams is a music player app utilizing templates, responsive styling, and jQuery DOM manipulation. It was designed by Bloc as an in-depth tutorial to Frontend Web Development. It was designed in two parts - one focusing on Javascript and jQuery, and the other on Angular.*

### Tools
[Javascript](https://www.javascript.com/), [Angular](https://angularjs.org/), [UI-Router](https://github.com/angular-ui/ui-router), [jQuery](https://jquery.com/), [Grunt](http://gruntjs.com/), [Buzz](http://buzz.jaysalvat.com/), [Bootstrap](http://getbootstrap.com/), [Brackets](http://brackets.io/), [Ubuntu](http://www.ubuntu.com/)

# Starting Out
*Having just completed my Backend track for Bloc, I came into the Frontend side with a better understanding of web web development paradigms. Compared to Ruby, Javascript was much closer to languages I had worked with in the past, namely Actionscript 3.0.*

*While I had dabbled in some styling and JS scripting in Backend, it was with this project that I really got my feet wet with it.*

# Overview
*In Bloc Jams, users may view an index of albums, view the songs on that item, and then play any of the songs within the album. It features additional flourishes like icon fade-in when the user scrolls down the landing page and a music player bar docked at the bottom of the album view.*

# The Process
*As a Frontend project, work began first on creating a basic view. Outside of the familiar html formatting assisted by Bootstrap, I was introduced to responsive styling to allow my page to dynamically adjust based on the size of the viewing device. This was accomplished through media queries applied to my CSS classes.*

[CSS example]

*With a basic landing page set up, I moved on to the Collection view, which contained a grid of albums users can select from. To properly arrange the albums, I made use of Bootstrap's grid system to align the dynamically generated list of albums.*

*With that done, I moved on to the Album view, where the bulk of visual effects were implemented. The first effect was to have a play button replace the track number when a user hovers over the appropriate row. This was accomplished using psuedoclass selectors in CSS.*

[CSS hover]

*For the play button, the desired behavior was to have it remain in its "pause" state while a user hovers over other song rows, and upon clicking a new one, it should dismiss the previous play/pause button. To accomplish this, some Javascript logic was required.*

[JS for hover/click]

*The next step involved a refactor of my event listeners from straight Javascript to jQuery. This streamlined a lot of the code and allowed event listeners to be moved to the song row objects themselves, rather than in a generic ```document.ready``` function.*

*Finally, the Buzz library was implemented to allow for audio playback upon selecting a song. Play and pause functionality were integrated in with the existing button behaviors, and observer functions were used to sync volume and current song time with their appropriate seek bars.*

{% highlight Javascript %}
{% endhighlight %}

# Round 2
*Next came a bigger refactor - migrating my code to use Angular. I converted my pages into templates, and set up UI-Router to turn them into states. This allowed my app to become a Single Page Application, and thus much faster and responsive.*

*jQuery DOM manipulation and listeners were replaced with their equivalent Angular directives. Angular controllers took over for my JS scripts to more formally serve and render data onto my views. Album data was moved to a ```Fixtures``` service for my ```AlbumController``` to pull from.*

*Actions related to song playback were moved into a ```SongPlayer``` service, which interacted with both the Album and Player Bar controllers.*

*When it came to the Next and Previous buttons, I wanted to ensure that the list looped continuously as the user moved up or down the list, so I created my own utility function for looping array incrementation.*

{% highlight Javascript %}
(function(){
  function Utilities(){
    var Utilities = {};

    Utilities.loopIndex = function(index, collection, forward){
      var increment = forward ? 1 : -1;
      var newIndex;

      if( index >= (collection.length-1) && forward ){
        newIndex = 0;
      }else if (index <= 0 && !forward){
        newIndex = collection.length-1;
      }else {
        newIndex = index + increment;
      }

      return newIndex;
    }

    ...

    return Utilities;
  };

  angular
    .module('blocJams')
    .factory('Utilities', Utilities);
})();
{% endhighlight %}

*Refactoring the Seek Bar involved creating a custom directive to update the name and track times when a new song starts playing. To sync up the appearance of the playback seek bar with the audio, I used the seekbar directive's ```link``` attribute to produce functions for updating its bar and thumb. To ensure this was updated in realtime, an ```$observe``` function is used to continuously call those functions as music is played.*

*Finally, a custom Angular filter is used to format the time display for playback.*

# Takeaways
*While there was an initial learning curve, I took to Angular much quicker than I did to Rails. Much of its functionality was familiar to me from my days messing with Flash and AS3, so it was not too difficult to get it working. I found the manner in which Angular organizes code through directives and declarative DOM manipulation intuitive and easy to see how every piece fits together.*
