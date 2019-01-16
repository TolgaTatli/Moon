jQuery(function ($) {
	
	

    /* ======= Full Screen BG ======= */
    (function () {

        $(".full-height").height($(window).height());
        $(window).resize(function(){
            $(".full-height").height($(window).height());
        });

    }());

    /* ======= particles js ======= */
    (function () {

        particlesJS("particles-js", {
          "particles": {
            "number": {
              "value": 100,
              "density": {
                "enable": true,
                "value_area":1000
              }
            },
            "color": {
              "value": ["#aa73ff", "#f8c210", "#83d238", "#33b1f8"]
            },

            "shape": {
              "type": "circle",
              "stroke": {
                "width": 0,
                "color": "#fff"
              }
            },
            "opacity": {
              "value": 0.6,
              "random": false,
              "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
              }
            },
            "size": {
              "value": 2,
              "random": true,
              "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
              }
            },
            "line_linked": {
              "enable": true,
              "distance": 120,
              "color": "#ffffff",
              "opacity": 0.4,
              "width": 1
            },
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": {
                "enable": true,
                "mode": "grab"
              },
              "onclick": {
                "enable": true
              },
              "resize": true
            },
            "modes": {
              "grab": {
                "distance": 140,
                "line_linked": {
                  "opacity": 1
                }
              },
              "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
              },
              "repulse": {
                "distance": 200,
                "duration": 0.4
              },
              "push": {
                "particles_nb": 4
              },
              "remove": {
                "particles_nb": 2
              }
            }
          },
          "retina_detect": true
        });

    }());



}); // JQuery end
