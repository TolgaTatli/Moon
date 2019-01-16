
//
// Shape spawner
//

var pause = false;
var placed_elements = new Array();

var exportShapesMap = function() {
    if (pause) {
        return 0;
    }
    var map = '';
    jQuery('.wrapper .back-shapes img, .wrapper .back-shapes em').each(function(e) {
        var icon = jQuery(this).attr('src');
        var top = jQuery(this).css('top');
        var left = jQuery(this).css('left');
        top = ((100 * parseInt(top)) / window.innerHeight) + '%';
        left = ((100 * parseInt(left)) / window.innerWidth) + '%';
        var ti = ( 5 * parseInt(jQuery(this).attr('data-ti')) ) / 100;
        if (this.tagName == 'IMG') {
            map += '<img src="'+jQuery(this).attr('src')+'" class="floating" style="top:'+top+';left:'+left+';animation-delay:-'+ti+'s;"/>'+"\n";
        } else {
            map += '<em class="'+jQuery(this).attr('class')+'" style="top:'+top+';left:'+left+';animation-delay:-'+ti+'s;"></em>'+"\n";
        }
    });
    jQuery('#shape-spawner-map').val(map);
}

jQuery('.shape-spawner div img').click(function() {
    jQuery(this).parent().find('img').each(function() {
        jQuery(this).removeClass('active');
    });
    jQuery(this).parent().next().find('em').each(function() {
        jQuery(this).removeClass('active');
    });
    jQuery(this).addClass('active');
});

jQuery('.shape-spawner div em').click(function() {
    jQuery(this).parent().prev().find('img').each(function() {
        jQuery(this).removeClass('active');
    });
    jQuery(this).parent().find('em').each(function() {
        jQuery(this).removeClass('active');
    });
    jQuery(this).addClass('active');
});

jQuery('.wrapper').click(function(e) {
    var offset = {
        x : e.pageX - jQuery(this).offset().left,
        y : e.pageY - jQuery(this).offset().top
    };

    placed_elements.push( jQuery('.shape-spawner div .active').clone()
    .css({ left : offset.x - 19.5, top: offset.y - 19.5 })
    .addClass('floating')
    .attr('data-ti',0)
    .appendTo('.wrapper .back-shapes') );
    var elem = placed_elements[placed_elements.length-1];
    elem.css({
        left: ((100 * parseInt(elem.css('left'))) / window.innerWidth) + '%',
        top: ((100 * parseInt(elem.css('top'))) / window.innerHeight) + '%'
    });
});

jQuery('#export-map').click(function() {
    jQuery('#shape-spawner-map').toggle(300);
});

jQuery('#pause-refleshing').click(function() {
    if (pause == false) {
        pause = true;
        jQuery(this).html('Resume map refleshing');
    } else {
        pause = false;
        jQuery(this).html('Pause map refleshing');
    }
});

jQuery('#remove-last-placed').click(function() {
    jQuery(placed_elements.pop()).remove();
});

jQuery('#remove-all').click(function() {
    placed_elements = new Array();
    jQuery('.wrapper .back-shapes > *').each(function() {
        jQuery(this).remove();
    });
});

jQuery('#icon-selector-show').click(function() {
    jQuery('.icon-selector').toggle(300);
});

jQuery('#icon-selector-close').click(function() {
    jQuery(this).parent().toggle(300);
});

jQuery('.icon-selector #selectable-icon').click(function() {
    jQuery('.shape-spawner .active').removeClass('active');
    jQuery('#icon-placeholder > em').attr('class','active epic-icon ' + jQuery(this).attr('class'));
});

setInterval(exportShapesMap,100);
setInterval(function() {

    jQuery('.wrapper .back-shapes img, .wrapper .back-shapes em').each(function() {
        var ti = parseFloat(jQuery(this).attr('data-ti'));
        if (ti == 100) {
            jQuery(this).attr('data-ti','0');
        } else {
            jQuery(this).attr('data-ti', ti + 1);
        }
    });

}, (5000/100) );