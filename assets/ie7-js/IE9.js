/*
  IE7/IE8/IE9.js - copyright 2004-2010, Dean Edwards
  http://code.google.com/p/ie7-js/
  http://www.opensource.org/licenses/mit-license.php
*/

/* W3C compliance for Microsoft Internet Explorer */

/* credits/thanks:
  Shaggy, Martijn Wargers, Jimmy Cerra, Mark D Anderson,
  Lars Dieckow, Erik Arvidsson, Gellért Gyuris, James Denny,
  Unknown W Brackets, Benjamin Westfarer, Rob Eberhardt,
  Bill Edney, Kevin Newman, James Crompton, Matthew Mastracci,
  Doug Wright, Richard York, Kenneth Kolano, MegaZone,
  Thomas Verelst, Mark 'Tarquin' Wilton-Jones, Rainer Åhlfors,
  David Zulaica, Ken Kolano, Kevin Newman, Sjoerd Visscher,
  Ingo Chao
*/

// timestamp: Fri, 30 Apr 2010 20:59:18

(function(window, document) {

var IE7 = window.IE7 = {
  version: "2.1(beta4)",
  toString: K("[IE7]")
};
IE7.compat = 9;
var appVersion = IE7.appVersion = navigator.appVersion.match(/MSIE (\d\.\d)/)[1] - 0;

if (/ie7_off/.test(top.location.search) || appVersion < 5.5 || appVersion >= IE7.compat) return;

var MSIE5 = appVersion < 6;

var Undefined = K();
var documentElement = document.documentElement, body, viewport;
var ANON = "!";
var HEADER = ":link{ie7-link:link}:visited{ie7-link:visited}";

// -----------------------------------------------------------------------
// external
// -----------------------------------------------------------------------

var RELATIVE = /^[\w\.]+[^:]*$/;
function makePath(href, path) {
  if (RELATIVE.test(href)) href = (path || "") + href;
  return href;
};

function getPath(href, path) {
  href = makePath(href, path);
  return href.slice(0, href.lastIndexOf("/") + 1);
};

// Get the path to this script
var script = document.scripts[document.scripts.length - 1];
var path = getPath(script.src);

// Use microsoft's http request object to load external files
try {
  var httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
} catch (ex) {
  // ActiveX disabled
}

var fileCache = {};
function loadFile(href, path) {
  try {
    href = makePath(href, path);
    if (!fileCache[href]) {
      httpRequest.open("GET", href, false);
      httpRequest.send();
      if (httpRequest.status == 0 || httpRequest.status == 200) {
        fileCache[href] = httpRequest.responseText;
      }
    }
  } catch (ex) {
    // ignore errors
  }
  return fileCache[href] || "";
};

// -----------------------------------------------------------------------
// OO support
// -----------------------------------------------------------------------


// This is a cut-down version of base2 (http://code.google.com/p/base2/)

var _slice = Array.prototype.slice;

// private
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;           // safe regular expressions
var _BASE = /\bbase\b/;
var _HIDDEN = ["constructor", "toString"];            // only override these when prototyping

var prototyping;

function Base(){};
Base.extend = function(_instance, _static) {
  // Build the prototype.
  prototyping = true;
  var _prototype = new this;
  extend(_prototype, _instance);
  prototyping = false;

  // Create the wrapper for the constructor function.
  var _constructor = _prototype.constructor;
  function klass() {
    // Don't call the constructor function when prototyping.
    if (!prototyping) _constructor.apply(this, arguments);
  };
  _prototype.constructor = klass;

  // Build the static interface.
  klass.extend = arguments.callee;
  extend(klass, _static);
  klass.prototype = _prototype;
  return klass;
};
Base.prototype.extend = function(source) {
  return extend(this, source);
};


// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var HASH     = "#";
var ITEMS    = "#";
var KEYS     = ".";
var COMPILED = "/";

var REGGRP_BACK_REF        = /\\(\d+)/g,
    REGGRP_ESCAPE_COUNT    = /\[(\\.|[^\]\\])+\]|\\.|\(\?/g,
    REGGRP_PAREN           = /\(/g,
    REGGRP_LOOKUP          = /\$(\d+)/,
    REGGRP_LOOKUP_SIMPLE   = /^\$\d+$/,
    REGGRP_LOOKUPS         = /(\[(\\.|[^\]\\])+\]|\\.|\(\?)|\(/g,
    REGGRP_DICT_ENTRY      = /^<#\w+>$/,
    REGGRP_DICT_ENTRIES    = /<#(\w+)>/g;

var RegGrp = Base.extend({
  constructor: function(values) {
    this[KEYS] = [];
    this[ITEMS] = {};
    this.merge(values);
  },

  //dictionary: null,
  //ignoreCase: false,

  add: function(expression, replacement) {
    delete this[COMPILED];
    if (expression instanceof RegExp) {
      expression = expression.source;
    }
    if (!this[HASH + expression]) this[KEYS].push(String(expression));
    return this[ITEMS][HASH + expression] = new RegGrp.Item(expression, replacement, this);
  },

  compile: function(recompile) {
    if (recompile || !this[COMPILED]) {
      this[COMPILED] = new RegExp(this, this.ignoreCase ? "gi" : "g");
    }
    return this[COMPILED];
  },

  merge: function(values) {
    for (var i in values) this.add(i, values[i]);
  },

  exec: function(string) {
    var group = this,
        patterns = group[KEYS],
        items = group[ITEMS], item;
    var result = this.compile(true).exec(string);
    if (result) {
      // Loop through the RegGrp items.
      var i = 0, offset = 1;
      while ((item = items[HASH + patterns[i++]])) {
        var next = offset + item.length + 1;
        if (result[offset]) { // do we have a result?
          if (item.replacement === 0) {
            return group.exec(string);
          } else {
            var args = result.slice(offset, next), j = args.length;
            while (--j) args[j] = args[j] || ""; // some platforms return null/undefined for non-matching sub-expressions
            args[0] = {match: args[0], item: item};
            return args;
          }
        }
        offset = next;
      }
    }
    return null;
  },

  parse: function(string) {
    string += ""; // type safe
    var group = this,
        patterns = group[KEYS],
        items = group[ITEMS];
    return string.replace(this.compile(), function(match) {
      var args = [], item, offset = 1, i = arguments.length;
      while (--i) args[i] = arguments[i] || ""; // some platforms return null/undefined for non-matching sub-expressions
      // Loop through the RegGrp items.
      while ((item = items[HASH + patterns[i++]])) {
        var next = offset + item.length + 1;
        if (args[offset]) { // do we have a result?
          var replacement = item.replacement;
          switch (typeof replacement) {
            case "function":
              return replacement.apply(group, args.slice(offset, next));
            case "number":
              return args[offset + replacement];
            default:
              return replacement;
          }
        }
        offset = next;
      }
      return match;
    });
  },

  toString: function() {
    var strings = [],
        keys = this[KEYS],
        items = this[ITEMS], item;
    for (var i = 0; item = items[HASH + keys[i]]; i++) {
      strings[i] = item.source;
    }
    return "(" + strings.join(")|(") + ")";
  }
}, {
  IGNORE: null, // a null replacement value means that there is no replacement.

  Item: Base.extend({
    constructor: function(source, replacement, owner) {
      var length = source.indexOf("(") === -1 ? 0 : RegGrp.count(source);

      var dictionary = owner.dictionary;
      if (dictionary && source.indexOf("<#") !== -1) {
        if (REGGRP_DICT_ENTRY.test(source)) {
          var entry = dictionary[ITEMS][HASH + source.slice(2, -1)];
          source = entry.replacement;
          length = entry._length;
        } else {
          source = dictionary.parse(source);
        }
      }

      if (typeof replacement == "number") replacement = String(replacement);
      else if (replacement == null) replacement = 0;

      // Does the expression use sub-expression lookups?
      if (typeof replacement == "string" && REGGRP_LOOKUP.test(replacement)) {
        if (REGGRP_LOOKUP_SIMPLE.test(replacement)) { // A simple lookup? (e.g. "$2").
          // Store the index (used for fast retrieval of matched strings).
          var index = replacement.slice(1) - 0;
          if (index && index <= length) replacement = index;
        } else {
          // A complicated lookup (e.g. "Hello $2 $1.").
          var lookup = replacement, regexp;
          replacement = function(match) {
            if (!regexp) {
              regexp = new RegExp(source, "g" + (this.ignoreCase ? "i": ""));
            }
            return match.replace(regexp, lookup);
          };
        }
      }

      this.length = length;
      this.source = String(source);
      this.replacement = replacement;
    }
  }),

  count: function(expression) {
    return (String(expression).replace(REGGRP_ESCAPE_COUNT, "").match(REGGRP_PAREN) || "").length;
  }
});

var Dictionary = RegGrp.extend({
  parse: function(phrase) {
    // Prevent sub-expressions in dictionary entries from capturing.
    var entries = this[ITEMS];
    return phrase.replace(REGGRP_DICT_ENTRIES, function(match, entry) {
      entry = entries[HASH + entry];
      return entry ? entry._nonCapturing : match;
    });
  },

  add: function(expression, replacement) {
    // Get the underlying replacement value.
    if (replacement instanceof RegExp) {
      replacement = replacement.source;
    }
    // Translate the replacement.
    // The result is the original replacement recursively parsed by this dictionary.
    var nonCapturing = replacement.replace(REGGRP_LOOKUPS, _nonCapture);
    if (replacement.indexOf("(") !== -1) {
      var realLength = RegGrp.count(replacement);
    }
    if (replacement.indexOf("<#") !== -1) {
      replacement = this.parse(replacement);
      nonCapturing = this.parse(nonCapturing);
    }
    var item = this.base(expression, replacement);
    item._nonCapturing = nonCapturing;
    item._length = realLength || item.length; // underlying number of sub-groups
    return item;
  },

  toString: function() {
    return "(<#" + this[PATTERNS].join(">)|(<#") + ">)";
  }
});

function _nonCapture(match, escaped) {
  return escaped || "(?:"; // non-capturing
};

// =========================================================================
// lang/extend.js
// =========================================================================

function extend(object, source) { // or extend(object, key, value)
  if (object && source) {
    var proto = (typeof source == "function" ? Function : Object).prototype;
    // Add constructor, toString etc
    var i = _HIDDEN.length, key;
    if (prototyping) while (key = _HIDDEN[--i]) {
      var value = source[key];
      if (value != proto[key]) {
        if (_BASE.test(value)) {
          _override(object, key, value)
        } else {
          object[key] = value;
        }
      }
    }
    // Copy each of the source object's properties to the target object.
    for (key in source) if (typeof proto[key] == "undefined") {
      var value = source[key];
      // Check for method overriding.
      if (object[key] && typeof value == "function" && _BASE.test(value)) {
        _override(object, key, value);
      } else {
        object[key] = value;
      }
    }
  }
  return object;
};

function _override(object, name, method) {
  // Override an existing method.
  var ancestor = object[name];
  object[name] = function() {
    var previous = this.base;
    this.base = ancestor;
    var returnValue = method.apply(this, arguments);
    this.base = previous;
    return returnValue;
  };
};

function combine(keys, values) {
  // Combine two arrays to make a hash.
  if (!values) values = keys;
  var hash = {};
  for (var i in keys) hash[i] = values[i];
  return hash;
};

function format(string) {
  // Replace %n with arguments[n].
  // e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
  // ==> "she sells sea shells"
  // Only %1 - %9 supported.
  var args = arguments;
  var _FORMAT = new RegExp("%([1-" + arguments.length + "])", "g");
  return String(string).replace(_FORMAT, function(match, index) {
    return index < args.length ? args[index] : match;
  });
};

function match(string, expression) {
  // Same as String.match() except that this function will return an empty
  // array if there is no match.
  return String(string).match(expression) || [];
};

function rescape(string) {
  // Make a string safe for creating a RegExp.
  return String(string).replace(_RESCAPE, "\\$1");
};

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
  return String(string).replace(_LTRIM, "").replace(_RTRIM, "");
};

function K(k) {
  return function() {
    return k;
  };
};

// -----------------------------------------------------------------------
// parsing
// -----------------------------------------------------------------------

var Parser = RegGrp.extend({ignoreCase: true});

var SINGLE_QUOTES       = /'/g,
    ESCAPED             = /'(\d+)'/g,
    ESCAPE              = /\\/g,
    UNESCAPE            = /\\([nrtf'"])/g;

var strings = [];

var encoder = new Parser({
  // comments
  "<!\\-\\-|\\-\\->": "",
  "\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/": "",
  // get rid
  "@(namespace|import)[^;\\n]+[;\\n]": "",
  // strings
  "'(\\\\.|[^'\\\\])*'": encodeString,
  '"(\\\\.|[^"\\\\])*"': encodeString,
  // white space
  "\\s+": " "
});

function encode(selector) {
  return encoder.parse(selector).replace(UNESCAPE, "$1");
};

function decode(query) {
  // put string values back
  return query.replace(ESCAPED, decodeString);
};

function encodeString(string) {
  var index = strings.length;
  strings[index] = string.slice(1, -1)
    .replace(UNESCAPE, "$1")
    .replace(SINGLE_QUOTES, "\\'");
  return "'" + index + "'";
};

function decodeString(match, index) {
  var string = strings[index];
  if (string == null) return match;
  return "'" + strings[index] + "'";
};

function getString(value) {
  return value.indexOf("'") === 0 ? strings[value.slice(1, - 1)] : value;
};

// clone a "width" function to create a "height" function
var rotater = new RegGrp({
  Width: "Height",
  width: "height",
  Left:  "Top",
  left:  "top",
  Right: "Bottom",
  right: "bottom",
  onX:   "onY"
});

function rotate(fn) {
  return rotater.parse(fn);
};

// -----------------------------------------------------------------------
// event handling
// -----------------------------------------------------------------------

var eventHandlers = [];

function addResize(handler) {
  addRecalc(handler);
  addEventHandler(window, "onresize", handler);
};

// add an event handler (function) to an element
function addEventHandler(element, type, handler) {
  element.attachEvent(type, handler);
  // store the handler so it can be detached later
  eventHandlers.push(arguments);
};

// remove an event handler assigned to an element by IE7
function removeEventHandler(element, type, handler) {
  try {
    element.detachEvent(type, handler);
  } catch (ex) {
    // write a letter of complaint to microsoft..
  }
};

// remove event handlers (they eat memory)
addEventHandler(window, "onunload", function() {
  var handler;
  while (handler = eventHandlers.pop()) {
    removeEventHandler(handler[0], handler[1], handler[2]);
  }
});

function register(handler, element, condition) { // -@DRE
  //var set = handler[element.uniqueID];
  if (!handler.elements) handler.elements = {};
  if (condition) handler.elements[element.uniqueID] = element;
  else delete handler.elements[element.uniqueID];
  //return !set && condition;
  return condition;
};

addEventHandler(window, "onbeforeprint", function() {
  if (!IE7.CSS.print) new StyleSheet("print");
  IE7.CSS.print.recalc();
});

// -----------------------------------------------------------------------
// pixel conversion
// -----------------------------------------------------------------------

// this is handy because it means that web developers can mix and match
//  measurement units in their style sheets. it is not uncommon to
//  express something like padding in "em" units whilst border thickness
//  is most often expressed in pixels.

var PIXEL = /^\d+(px)?$/i;
var PERCENT = /^\d+%$/;
var getPixelValue = function(element, value) {
  if (PIXEL.test(value)) return parseInt(value);
  var style = element.style.left;
  var runtimeStyle = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value || 0;
  value = element.style.pixelLeft;
  element.style.left = style;
  element.runtimeStyle.left = runtimeStyle;
  return value;
};

// -----------------------------------------------------------------------
// generic
// -----------------------------------------------------------------------

var $IE7 = "ie7-";

var Fix = Base.extend({
  constructor: function() {
    this.fixes = [];
    this.recalcs = [];
  },
  init: Undefined
});

// a store for functions that will be called when refreshing IE7
var recalcs = [];
function addRecalc(recalc) {
  recalcs.push(recalc);
};

IE7.recalc = function() {
  IE7.HTML.recalc();
  // re-apply style sheet rules (re-calculate ie7 classes)
  IE7.CSS.recalc();
  // apply global fixes to the document
  for (var i = 0; i < recalcs.length; i++) recalcs[i]();
};

function isFixed(element) {
  return element.currentStyle["ie7-position"] == "fixed";
};

// original style
function getDefinedStyle(element, propertyName) {
  return element.currentStyle[$IE7 + propertyName] || element.currentStyle[propertyName];
};

function setOverrideStyle(element, propertyName, value) {
  if (element.currentStyle[$IE7 + propertyName] == null) {
    element.runtimeStyle[$IE7 + propertyName] = element.currentStyle[propertyName];
  }
  element.runtimeStyle[propertyName] = value;
};

// Create a temporary element which is used to inherit styles
// from the target element.
function createTempElement(tagName) {
  var element = document.createElement(tagName || "object");
  element.style.cssText = "position:absolute;padding:0;display:block;border:none;clip:rect(0 0 0 0);left:-9999";
  element.ie7_anon = true;
  return element;
};


// =========================================================================
// ie7-css.js
// =========================================================================

var NEXT_SIBLING        = "(e.nextSibling&&IE7._getElementSibling(e,'next'))",
    PREVIOUS_SIBLING    = NEXT_SIBLING.replace(/next/g, "previous"),
    IS_ELEMENT          = "e.nodeName>'@'",
    IF_ELEMENT          = "if(" + IS_ELEMENT + "){";

var ID_ATTRIBUTE  = "(e.nodeName==='FORM'?IE7._getAttribute(e,'id'):e.id)";

var HYPERLINK = /a(#[\w-]+)?(\.[\w-]+)?:(hover|active)/i;
var FIRST_LINE_LETTER = /(.*)(:first-(line|letter))/;
var SPACE = /\s/;
var RULE = /((?:\\.|[^{\\])+)\{((?:\\.|[^}\\])+)\}/g;
var SELECTOR = /(?:\\.|[^,\\])+/g;

var styleSheets = document.styleSheets;

var inheritedProperties = [];

IE7.CSS = new (Fix.extend({ // single instance
  parser: new Parser,
  screen: "",
  print: "",
  styles: [],
  rules: [],
  pseudoClasses: appVersion < 7 ? "first\\-child" : "",
  dynamicPseudoClasses: {
    toString: function() {
      var strings = [];
      for (var pseudoClass in this) strings.push(pseudoClass);
      return strings.join("|");
    }
  },
  
  init: function() {
    var NONE = "^\x01$";
    var CLASS = "\\[class=?[^\\]]*\\]";
    var pseudoClasses = [];
    if (this.pseudoClasses) pseudoClasses.push(this.pseudoClasses);
    var dynamicPseudoClasses = this.dynamicPseudoClasses.toString(); 
    if (dynamicPseudoClasses) pseudoClasses.push(dynamicPseudoClasses);
    pseudoClasses = pseudoClasses.join("|");
    var unknown = appVersion < 7 ? ["[>+~\\[(]|([:.])[\\w-]+\\1"] : [CLASS];
    if (pseudoClasses) unknown.push(":(" + pseudoClasses + ")");
    this.UNKNOWN = new RegExp(unknown.join("|") || NONE, "i");
    var complex = appVersion < 7 ? ["\\[[^\\]]+\\]|[^\\s(\\[]+\\s*[+~]"] : [CLASS];
    var complexRule = complex.concat();
    if (pseudoClasses) complexRule.push(":(" + pseudoClasses + ")");
    Rule.COMPLEX = new RegExp(complexRule.join("|") || NONE, "ig");
    if (this.pseudoClasses) complex.push(":(" + this.pseudoClasses + ")");
    DynamicRule.COMPLEX = new RegExp(complex.join("|") || NONE, "i");
    dynamicPseudoClasses = "not\\(:" + dynamicPseudoClasses.split("|").join("\\)|not\\(:") + "\\)|" + dynamicPseudoClasses;
    DynamicRule.MATCH = new RegExp(dynamicPseudoClasses ? "(.*?):(" + dynamicPseudoClasses + ")(.*)" : NONE, "i");
    
    this.createStyleSheet();
    this.refresh();
  },
  
	addEventHandler: function() {
		addEventHandler.apply(null, arguments);
	},
  
  addFix: function(expression, replacement) {
    this.parser.add(expression, replacement);
  },
  
  addRecalc: function(propertyName, test, handler, replacement) {
    // recalcs occur whenever the document is refreshed using document.recalc()
    propertyName = propertyName.source || propertyName;
    test = new RegExp("([{;\\s])" + propertyName + "\\s*:\\s*" + test + "[^;}]*");
    var id = this.recalcs.length;
    if (typeof replacement == "string") replacement = propertyName + ":" + replacement;
    this.addFix(test, function(match) {
      if (typeof replacement == "function") replacement = replacement(match);
      return (replacement ? replacement : match) + ";ie7-" + match.slice(1) + ";ie7_recalc" + id + ":1";
    });
    this.recalcs.push(arguments);
    return id;
  },
  
  apply: function() {
    this.getInlineCSS();
    new StyleSheet("screen");
    this.trash();
  },
  
  createStyleSheet: function() {
    // create the IE7 style sheet
    document.getElementsByTagName("head")[0].appendChild(document.createElement("style"));
    this.styleSheet = styleSheets[styleSheets.length - 1];
    // flag it so we can ignore it during parsing
    this.styleSheet.ie7 = true;
    this.styleSheet.owningElement.ie7 = true;
    this.styleSheet.cssText = HEADER;
  },
  
  getInlineCSS: function() {// load inline styles
    var styleSheets = document.getElementsByTagName("style"), styleSheet;
    for (var i = styleSheets.length - 1; styleSheet = styleSheets[i]; i--) {
      if (!styleSheet.disabled && !styleSheet.ie7) {
        styleSheet._cssText = styleSheet.innerHTML;
      }
    }
  },
  
  getText: function(styleSheet, path) {
    // Internet Explorer will trash unknown selectors (it converts them to "UNKNOWN").
    // So we must reload external style sheets (internal style sheets can have their text
    // extracted through the innerHTML property).

    // load the style sheet text from an external file
    try {
      var cssText = styleSheet.cssText;
    } catch (e) {
      cssText = "";
    }
    if (httpRequest) cssText = loadFile(styleSheet.href, path) || cssText;
    return cssText;
  },
  
  recalc: function() {
    this.screen.recalc();
    // we're going to read through all style rules.
    //  certain rules have had ie7 properties added to them.
    //   e.g. p{top:0; ie7_recalc2:1; left:0}
    //  this flags a property in the rule as needing a fix.
    //  the selector text is then used to query the document.
    //  we can then loop through the results of the query
    //  and fix the elements.
    // we ignore the IE7 rules - so count them in the header
    var RECALCS = /ie7_recalc\d+/g;
    var start = HEADER.match(/[{,]/g).length;
    // only calculate screen fixes. print fixes don't show up anyway
    var rules = this.styleSheet.rules, rule;
    var calcs, calc, elements, element, i, j, k, id;
    // loop through all rules
    for (i = start; rule = rules[i]; i++) {
      var cssText = rule.style.cssText;
      // search for the "ie7_recalc" flag (there may be more than one)
      if (calcs = cssText.match(RECALCS)) {
        // use the selector text to query the document
        elements = cssQuery(rule.selectorText);
        // if there are matching elements then loop
        //  through the recalc functions and apply them
        //  to each element
        if (elements.length) for (j = 0; j < calcs.length; j++) {
          // get the matching flag (e.g. ie7_recalc3)
          id = calcs[j];
          // extract the numeric id from the end of the flag
          //  and use it to index the collection of recalc
          //  functions
          calc = IE7.CSS.recalcs[id.slice(10)][2];
          for (k = 0; (element = elements[k]); k++) {
            // apply the fix
            if (element.currentStyle[id]) calc(element, cssText);
          }
        }
      }
    }
  },
  
  refresh: function() {
    this.styleSheet.cssText = HEADER + this.screen + this.print;
  },
  
  trash: function() {
    // trash the old style sheets
    for (var i = 0; i < styleSheets.length; i++) {
      if (!styleSheets[i].ie7) {
        try {
          var cssText = styleSheets[i].cssText;
        } catch (e) {
          cssText = "";
        }
        if (cssText) styleSheets[i].cssText = "";
      }
    }
  }
}));

// -----------------------------------------------------------------------
//  IE7 StyleSheet class
// -----------------------------------------------------------------------

var StyleSheet = Base.extend({
  constructor: function(media) {
    this.media = media;
    this.load();
    IE7.CSS[media] = this;
    IE7.CSS.refresh();
  },
  
  createRule: function(selector, cssText) {
    var match;
    if (PseudoElement && (match = selector.match(PseudoElement.MATCH))) {
      return new PseudoElement(match[1], match[2], cssText);
    } else if (match = selector.match(DynamicRule.MATCH)) {
      if (!HYPERLINK.test(match[0]) || DynamicRule.COMPLEX.test(match[0])) {
        return new DynamicRule(selector, match[1], match[2], match[3], cssText);
      }
    } else {
      return new Rule(selector, cssText);
    }
    return selector + " {" + cssText + "}";
  },
  
  getText: function() {
    // store for style sheet text
    // parse media decalarations
    var MEDIA        = /@media\s+([^{]+?)\s*\{([^@]+\})\s*\}/gi;
    var IMPORTS      = /@import[^;\n]+/gi;
    var TRIM_IMPORTS = /@import\s+url\s*\(\s*["']?|["']?\s*\)\s*/gi;
    var URL          = /(url\s*\(\s*['"]?)([\w\.]+[^:\)]*['"]?\))/gi;

    var self = this;
    
    // Store loaded cssText URLs
    var fileCache = {};
    
    function getCSSText(styleSheet, path, media, level) {
      var cssText = "";
      if (!level) {
        media = toSimpleMedia(styleSheet.media);
        level = 0;
      }
      if (media === "none") {
        styleSheet.disabled = true;
        return "";
      }
      if (media === "all" || media === self.media) {
        // IE only allows importing style sheets three levels deep.
        // it will crash if you try to access a level below this
        try {
          var canAcess = !!styleSheet.cssText;
        } catch (exe) {}
        if (level < 3 && canAcess) {
          var hrefs = styleSheet.cssText.match(IMPORTS);
          // loop through imported style sheets
          for (var i = 0, imported; i < styleSheet.imports.length; i++) {
            var imported = styleSheet.imports[i];
            var href = styleSheet._href || styleSheet.href;
            imported._href = hrefs[i].replace(TRIM_IMPORTS, "");
            // call this function recursively to get all imported style sheets
            cssText += getCSSText(imported, getPath(href, path), media, level + 1);
          }
        }
        // retrieve inline style or load an external style sheet
        cssText += encode(styleSheet.href ? loadStyleSheet(styleSheet, path) : styleSheet.owningElement._cssText);
        cssText = parseMedia(cssText, self.media);
      }
      return cssText;
    };

    // Load all style sheets in the document
    for (var i = 0; i < styleSheets.length; i++) {
      var styleSheet = styleSheets[i];
      if (!styleSheet.disabled && !styleSheet.ie7) this.cssText += getCSSText(styleSheet);
    }
    
    // helper functions
    function parseMedia(cssText, media) {
      filterMedia.value = media;
      return cssText.replace(MEDIA, filterMedia);
    };
    
    function filterMedia(match, media, cssText) {
      media = toSimpleMedia(media);
      switch (media) {
        case "screen":
        case "print":
          if (media !== filterMedia.value) return "";
        case "all":
          return cssText;
      }
      return "";
    };
    
    function toSimpleMedia(media) {
      if (!media) return "all";
      var split = media.toLowerCase().split(/\s*,\s*/);
      media = "none";
      for (var i = 0; i < split.length; i++) {
        if (split[i] === "all") return "all";
        if (split[i] === "screen") {
          if (media === "print") return "all";
          media = "screen";
        } else if (split[i] === "print") {
          if (media === "screen") return "all";
          media = "print";
        }
      }
      return media;
    };
    
    // Load an external style sheet
    function loadStyleSheet(styleSheet, path) {
      var href = styleSheet._href || styleSheet.href;
      var url = makePath(href, path);
      // If the style sheet has already loaded then don't reload it
      if (fileCache[url]) return "";
      // Load from source
      fileCache[url] = styleSheet.disabled ? "" :
        fixUrls(IE7.CSS.getText(styleSheet, path), getPath(href, path));
      return fileCache[url];
    };

    // Fix CSS paths.
    // We're lumping all css text into one big style sheet so relative
    // paths have to be fixed. This is necessary anyway because of other
    // Internet Explorer bugs.
    function fixUrls(cssText, pathname) {
      // hack & slash
      return cssText.replace(URL, "$1" + pathname.slice(0, pathname.lastIndexOf("/") + 1) + "$2");
    };
  },
  
  load: function() {
    this.cssText = "";
    this.getText();
    this.parse();
    if (inheritedProperties.length) {
      this.cssText = parseInherited(this.cssText);
    }
    this.cssText = decode(this.cssText);
    fileCache = {};
  },
  
  parse: function() {
    var cssText = IE7.CSS.parser.parse(this.cssText);
    
    var declarations = "";
    this.cssText = cssText.replace(/@charset[^;]+;|@font\-face[^\}]+\}/g, function(match) {
      declarations += match + "\n";
      return "";
    });
    this.declarations = decode(declarations);
    
    // Parse the style sheet
    var offset = IE7.CSS.rules.length;
    var rules = [], rule;
    while ((rule = RULE.exec(this.cssText))) {
      var cssText = rule[2];
      if (cssText) {
        var fixDescendants = appVersion < 7 && cssText.indexOf("AlphaImageLoader") !== -1;
        var selectors = rule[1].match(SELECTOR), selector;
        for (var i = 0; selector = selectors[i]; i++) {
          selector = trim(selector);
          var isUnknown = IE7.CSS.UNKNOWN.test(selector);
          selectors[i] = isUnknown ? this.createRule(selector, cssText) : selector + "{" + cssText + "}";
          if (fixDescendants) selectors[i] += this.createRule(selector + ">*", "position:relative");
        }
        rules.push(selectors.join("\n"));
      }
    }
    this.cssText = rules.join("\n");
    this.rules = IE7.CSS.rules.slice(offset);
  },
  
  recalc: function() {
    var rule, i;
    for (i = 0; (rule = this.rules[i]); i++) rule.recalc();
  },
  
  toString: function() {
    return this.declarations + "@media " + this.media + "{" + this.cssText + "}";
  }
});

var PseudoElement;

// -----------------------------------------------------------------------
// IE7 style rules
// -----------------------------------------------------------------------

var Rule = IE7.Rule = Base.extend({
  constructor: function(selector, cssText) {
    this.id = IE7.CSS.rules.length;
    this.className = Rule.PREFIX + this.id;
    var pseudoElement = selector.match(FIRST_LINE_LETTER);
    this.selector = (pseudoElement ? pseudoElement[1] : selector) || "*";
    this.selectorText = this.parse(this.selector) + (pseudoElement ? pseudoElement[2] : "");
    this.cssText = cssText;
    this.MATCH = new RegExp("\\s" + this.className + "(\\s|$)", "g");
    IE7.CSS.rules.push(this);
    this.init();
  },
  
  init: Undefined,
  
  add: function(element) {
    // allocate this class
    element.className += " " + this.className;
  },
  
  recalc: function() {
    // execute the underlying css query for this class
    var match = cssQuery(this.selector);
    // add the class name for all matching elements
    for (var i = 0; i < match.length; i++) this.add(match[i]);
  },

  parse: function(selector) {
    // attempt to preserve specificity for "loose" parsing by
    //  removing unknown tokens from a css selector but keep as
    //  much as we can..
    var simple = selector.replace(Rule.CHILD, " ").replace(Rule.COMPLEX, "");
    if (appVersion < 7) simple = simple.replace(Rule.MULTI, "");
    var tags = match(simple, Rule.TAGS).length - match(selector, Rule.TAGS).length;
    var classes = match(simple, Rule.CLASSES).length - match(selector, Rule.CLASSES).length + 1;
    while (classes > 0 && Rule.CLASS.test(simple)) {
      simple = simple.replace(Rule.CLASS, "");
      classes--;
    }
    while (tags > 0 && Rule.TAG.test(simple)) {
      simple = simple.replace(Rule.TAG, "$1*");
      tags--;
    }
    simple += "." + this.className;
    classes = Math.min(classes, 2);
    tags = Math.min(tags, 2);
    var score = -10 * classes - tags;
    if (score > 0) {
      simple = simple + "," + Rule.MAP[score] + " " + simple;
    }
    return simple;
  },
  
  remove: function(element) {
    // deallocate this class
    element.className = element.className.replace(this.MATCH, "$1");
  },
  
  toString: function() {
    return format("%1 {%2}", this.selectorText, this.cssText);
  }
}, {
  CHILD: />/g,
  CLASS: /\.[\w-]+/,
  CLASSES: /[.:\[]/g,
  MULTI: /(\.[\w-]+)+/g,
  PREFIX: "ie7_class",
  TAG: /^\w+|([\s>+~])\w+/,
  TAGS: /^\w|[\s>+~]\w/g,
  MAP: {
    "1":  "html",
    "2":  "html body",
    "10": ".ie7_html",
    "11": "html.ie7_html",
    "12": "html.ie7_html body",
    "20": ".ie7_html .ie7_body",
    "21": "html.ie7_html .ie7_body",
    "22": "html.ie7_html body.ie7_body"
  }
});

// -----------------------------------------------------------------------
// IE7 dynamic style
// -----------------------------------------------------------------------

// object properties:
// attach: the element that an event handler will be attached to
// target: the element that will have the IE7 class applied

var DynamicRule = Rule.extend({
  // properties
  constructor: function(selector, attach, dynamicPseudoClass, target, cssText) {
    this.negated = dynamicPseudoClass.indexOf("not") === 0;
    if (this.negated) dynamicPseudoClass = dynamicPseudoClass.slice(5, -1);
    // initialise object properties
    this.attach = attach || "*";
    this.dynamicPseudoClass = IE7.CSS.dynamicPseudoClasses[dynamicPseudoClass];
    this.target = target;
    this.base(selector, cssText);
  },
  
  recalc: function() {
    // execute the underlying css query for this class
    var attaches = cssQuery(this.attach), attach;
    // process results
    for (var i = 0; attach = attaches[i]; i++) {
      // retrieve the event handler's target element(s)
      var target = this.target ? cssQuery(this.target, attach) : [attach];
      // attach event handlers for dynamic pseudo-classes
      if (target.length) this.dynamicPseudoClass.apply(attach, target, this);
    }
  }
});

// -----------------------------------------------------------------------
//  IE7 dynamic pseudo-classes
// -----------------------------------------------------------------------

var DynamicPseudoClass = Base.extend({
  constructor: function(name, apply) {
    this.name = name;
    this.apply = apply;
    this.instances = {};
    IE7.CSS.dynamicPseudoClasses[name] = this;
  },
  
  register: function(instance, negated) {
    // an "instance" is actually an Arguments object
    var _class = instance[2];
    if (!negated && _class.negated) {
      this.unregister(instance, true);
    } else {
      instance.id = _class.id + instance[0].uniqueID;
      if (!this.instances[instance.id]) {
        var target = instance[1], j;
        for (j = 0; j < target.length; j++) _class.add(target[j]);
        this.instances[instance.id] = instance;
      }
    }
  },
  
  unregister: function(instance, negated) {
    var _class = instance[2];
    if (!negated && _class.negated) {
      this.register(instance, true);
    } else {
      if (this.instances[instance.id]) {
        var target = instance[1], j;
        for (j = 0; j < target.length; j++) _class.remove(target[j]);
        delete this.instances[instance.id];
      }
    }
  }
});
  
// -----------------------------------------------------------------------
// dynamic pseudo-classes
// -----------------------------------------------------------------------

var Hover = new DynamicPseudoClass("hover", function(element) {
  var instance = arguments;
  IE7.CSS.addEventHandler(element, "onmouseenter", function() {
    Hover.register(instance);
  });
  IE7.CSS.addEventHandler(element, "onmouseleave", function() {
    Hover.unregister(instance);
  });
});

// globally trap the mouseup event (thanks Martijn!)
addEventHandler(document, "onmouseup", function() {
  var instances = Hover.instances;
  for (var i in instances)
    if (!instances[i][0].contains(event.srcElement))
      Hover.unregister(instances[i]);
});

var ATTR = {
  "=":  "%1==='%2'",                           // "[@%1='%2']"
  "~=": "(' '+%1+' ').indexOf(' %2 ')!==-1",   // "[contains(concat(' ',@%1,' '),' %2 ')]",
  "|=": "%1==='%2'||%1.indexOf('%2-')===0",    // "[@%1='%2' or starts-with(@%1,'%2-')]",
  "^=": "%1.indexOf('%2')===0",                // "[starts-with(@%1,'%2')]",
  "$=": "%1.slice(-'%2'.length)==='%2'",       // "[ends-with(@%1,'%2')]",
  "*=": "%1.indexOf('%2')!==-1"                // "[contains(@%1,'%2')]"
};
ATTR[""] = "%1!=null";                         // "[@%1]"

var FILTER = {
  "<#attr>": function(match, name, operator, value) {
    var attr = "IE7._getAttribute(e,'" + name + "')";
    value = getString(value);
    if (operator.length > 1) {
      if (!value || operator === "~=" && SPACE.test(value)) {
        return "false&&";
      }
      attr = "(" + attr + "||'')";
    }
    return "(" + format(ATTR[operator], attr, value) + ")&&";
  },

  "<#id>":    ID_ATTRIBUTE + "==='$1'&&",

  "<#class>": "e.className&&(' '+e.className+' ').indexOf(' $1 ')!==-1&&",

  // PSEDUO
  ":first-child":     "!" + PREVIOUS_SIBLING + "&&",
  ":link":           "e.currentStyle['ie7-link']=='link'&&",
  ":visited":        "e.currentStyle['ie7-link']=='visited'&&"
};

// =========================================================================
// ie7-html.js
// =========================================================================

// default font-sizes
//HEADER += "h1{font-size:2em}h2{font-size:1.5em;}h3{font-size:1.17em;}h4{font-size:1em}h5{font-size:.83em}h6{font-size:.67em}";

IE7.HTML = new (Fix.extend({ // single instance  
  fixed: {},
  
  init: Undefined,
  
  addFix: function() {
    // fixes are a one-off, they are applied when the document is loaded
    this.fixes.push(arguments);
  },
  
  apply: function() {
    for (var i = 0; i < this.fixes.length; i++) {
      var match = cssQuery(this.fixes[i][0]);
      var fix = this.fixes[i][1];
      for (var j = 0; j < match.length; j++) fix(match[j]);
    }
  },
  
  addRecalc: function() {
    // recalcs occur whenever the document is refreshed using document.recalc()
    this.recalcs.push(arguments);
  },
  
  recalc: function() {
    // loop through the fixes
    for (var i = 0; i < this.recalcs.length; i++) {
      var match = cssQuery(this.recalcs[i][0]);
      var recalc = this.recalcs[i][1], element;
      var key = Math.pow(2, i);
      for (var j = 0; (element = match[j]); j++) {
        var uniqueID = element.uniqueID;
        if ((this.fixed[uniqueID] & key) === 0) {
          element = recalc(element) || element;
          this.fixed[uniqueID] |= key;
        }
      }
    }
  }
}));

if (appVersion < 7) {  
  // provide support for the <abbr> tag.
  document.createElement("abbr");
  
  // bind to the first child control
  IE7.HTML.addRecalc("label", function(label) {
    if (!label.htmlFor) {
      var firstChildControl = cssQuery("input,textarea", label, true);
      if (firstChildControl) {
        addEventHandler(label, "onclick", function() {
          firstChildControl.click();
        });
      }
    }
  });
}

// =========================================================================
// ie7-layout.js
// =========================================================================

var NUMERIC = "[.\\d]";

(function() {
  var layout = IE7.Layout = {};

  // big, ugly box-model hack + min/max stuff

  // #tantek > #erik > #dean { voice-family: hacker; }

  // -----------------------------------------------------------------------
  // "layout"
  // -----------------------------------------------------------------------

  HEADER += "*{boxSizing:content-box}";

  // give an element "layout"
  layout.boxSizing = function(element) {
    if (!element.currentStyle.hasLayout) {
    //#  element.runtimeStyle.fixedHeight =
      element.style.height = "0cm";
      if (element.currentStyle.verticalAlign === "auto")
        element.runtimeStyle.verticalAlign = "top";
      // when an element acquires "layout", margins no longer collapse correctly
      collapseMargins(element);
    }
  };

  // -----------------------------------------------------------------------
  // Margin Collapse
  // -----------------------------------------------------------------------

  function collapseMargins(element) {
    if (element != viewport && element.currentStyle.position !== "absolute") {
      collapseMargin(element, "marginTop");
      collapseMargin(element, "marginBottom");
    }
  };

  function collapseMargin(element, type) {
    if (!element.runtimeStyle[type]) {
      var parentElement = element.parentElement;
      var isTopMargin = type === "marginTop";
      if (parentElement && parentElement.currentStyle.hasLayout && !IE7._getElementSibling(element, isTopMargin ? "previous" : "next")) return;
      var child = element[isTopMargin ? "firstChild" : "lastChild"];
      if (child && child.nodeName < "@") child = IE7._getElementSibling(child, isTopMargin ? "next" : "previous");
      if (child && child.currentStyle.styleFloat === "none" && child.currentStyle.hasLayout) {
        collapseMargin(child, type);
        margin = _getMargin(element, element.currentStyle[type]);
        childMargin = _getMargin(child, child.currentStyle[type]);
        if (margin < 0 || childMargin < 0) {
          element.runtimeStyle[type] = margin + childMargin;
        } else {
          element.runtimeStyle[type] = Math.max(childMargin, margin);
        }
        child.runtimeStyle[type] = "0px";
      }
    }
  };

  function _getMargin(element, value) {
    return value === "auto" ? 0 : getPixelValue(element, value);
  };

  // -----------------------------------------------------------------------
  // box-model
  // -----------------------------------------------------------------------

  // constants
  var UNIT = /^[.\d][\w]*$/, AUTO = /^(auto|0cm)$/;

  var apply = {};
  layout.borderBox = function(element){
    apply.Width(element);
    apply.Height(element);
  };

  var _fixWidth = function(HEIGHT) {
    apply.Width = function(element) {
      if (!PERCENT.test(element.currentStyle.width)) _fixWidth(element);
      if (HEIGHT) collapseMargins(element);
    };

    function _fixWidth(element, value) {
      if (!element.runtimeStyle.fixedWidth) {
        if (!value) value = element.currentStyle.width;
        element.runtimeStyle.fixedWidth = UNIT.test(value) ? Math.max(0, getFixedWidth(element, value)) + "px" : value;
        setOverrideStyle(element, "width", element.runtimeStyle.fixedWidth);
      }
    };

    function layoutWidth(element) {
      if (!isFixed(element)) {
        var layoutParent = element.offsetParent;
        while (layoutParent && !layoutParent.currentStyle.hasLayout) layoutParent = layoutParent.offsetParent;
      }
      return (layoutParent || viewport).clientWidth;
    };

    function getPixelWidth(element, value) {
      if (PERCENT.test(value)) return parseInt(parseFloat(value) / 100 * layoutWidth(element));
      return getPixelValue(element, value);
    };

    var getFixedWidth = function(element, value) {
      var borderBox = element.currentStyle["ie7-box-sizing"] === "border-box";
      var adjustment = 0;
      if (MSIE5 && !borderBox)
        adjustment += getBorderWidth(element) + getWidth(element, "padding");
      else if (!MSIE5 && borderBox)
        adjustment -= getBorderWidth(element) + getWidth(element, "padding");
      return getPixelWidth(element, value) + adjustment;
    };

    // easy way to get border thickness for elements with "layout"
    function getBorderWidth(element) {
      return element.offsetWidth - element.clientWidth;
    };

    // have to do some pixel conversion to get padding/margin thickness :-(
    function getWidth(element, type) {
      return getPixelWidth(element, element.currentStyle[type + "Left"]) + getPixelWidth(element, element.currentStyle[type + "Right"]);
    };

    // -----------------------------------------------------------------------
    // min/max
    // -----------------------------------------------------------------------

    HEADER += "*{minWidth:none;maxWidth:none;min-width:none;max-width:none}";

    // handle min-width property
    layout.minWidth = function(element) {
      // IE6 supports min-height so we frig it here
      //#if (element.currentStyle.minHeight === "auto") element.runtimeStyle.minHeight = 0;
      if (element.currentStyle["min-width"] != null) {
        element.style.minWidth = element.currentStyle["min-width"];
      }
      if (register(arguments.callee, element, element.currentStyle.minWidth !== "none")) {
        layout.boxSizing(element);
        _fixWidth(element);
        resizeWidth(element);
      }
    };

    // clone the minWidth function to make a maxWidth function
    eval("IE7.Layout.maxWidth=" + String(layout.minWidth).replace(/min/g, "max"));

    // apply min/max restrictions
    function resizeWidth(element) {
      // check boundaries
      if (element == document.body) {
        var width = element.clientWidth;
      } else {
        var rect = element.getBoundingClientRect();
        width = rect.right - rect.left;
      }
      if (element.currentStyle.minWidth !== "none" && width < getFixedWidth(element, element.currentStyle.minWidth)) {
        element.runtimeStyle.width = element.currentStyle.minWidth;
      } else if (element.currentStyle.maxWidth !== "none" && width >= getFixedWidth(element, element.currentStyle.maxWidth)) {
        element.runtimeStyle.width = element.currentStyle.maxWidth;
      } else {
        element.runtimeStyle.width = element.runtimeStyle.fixedWidth;
      }
    };

    // -----------------------------------------------------------------------
    // right/bottom
    // -----------------------------------------------------------------------

    function fixRight(element) {
      if (register(fixRight, element, /^(fixed|absolute)$/.test(element.currentStyle.position) &&
        getDefinedStyle(element, "left") !== "auto" &&
        getDefinedStyle(element, "right") !== "auto" &&
        AUTO.test(getDefinedStyle(element, "width")))) {
          resizeRight(element);
          layout.boxSizing(element);
      }
    };
    layout.fixRight = fixRight;

    function resizeRight(element) {
      var left = getPixelWidth(element, element.runtimeStyle._left || element.currentStyle.left);
      var width = layoutWidth(element) - getPixelWidth(element, element.currentStyle.right) -  left - getWidth(element, "margin");
      if (parseInt(element.runtimeStyle.width) === width) return;
      element.runtimeStyle.width = "";
      if (isFixed(element) || HEIGHT || element.offsetWidth < width) {
        if (!MSIE5) width -= getBorderWidth(element) + getWidth(element, "padding");
        if (width < 0) width = 0;
        element.runtimeStyle.fixedWidth = width;
        setOverrideStyle(element, "width", width);
      }
    };

  // -----------------------------------------------------------------------
  // window.onresize
  // -----------------------------------------------------------------------

    // handle window resize
    var clientWidth = 0;
    addResize(function() {
      if (!viewport) return;
      var i, wider = (clientWidth < viewport.clientWidth);
      clientWidth = viewport.clientWidth;
      // resize elements with "min-width" set
      var elements = layout.minWidth.elements;
      for (i in elements) {
        var element = elements[i];
        var fixedWidth = (parseInt(element.runtimeStyle.width) === getFixedWidth(element, element.currentStyle.minWidth));
        if (wider && fixedWidth) element.runtimeStyle.width = "";
        if (wider == fixedWidth) resizeWidth(element);
      }
      // resize elements with "max-width" set
      var elements = layout.maxWidth.elements;
      for (i in elements) {
        var element = elements[i];
        var fixedWidth = (parseInt(element.runtimeStyle.width) === getFixedWidth(element, element.currentStyle.maxWidth));
        if (!wider && fixedWidth) element.runtimeStyle.width = "";
        if (wider !== fixedWidth) resizeWidth(element);
      }
      // resize elements with "right" set
      for (i in fixRight.elements) resizeRight(fixRight.elements[i]);
    });

  // -----------------------------------------------------------------------
  // fix CSS
  // -----------------------------------------------------------------------
    if (MSIE5) {
      IE7.CSS.addRecalc("width", NUMERIC, apply.Width);
    }
    if (appVersion < 7) {
      IE7.CSS.addRecalc("max-width", NUMERIC, layout.maxWidth);
      IE7.CSS.addRecalc("right", NUMERIC, fixRight);
    } else if (appVersion == 7) {
      if (HEIGHT) IE7.CSS.addRecalc("height", "[\\d.]+%", function(element) {
        element.runtimeStyle.pixelHeight = parseInt(layoutWidth(element) * element.currentStyle["ie7-height"].slice(0, -1) / 100);
      });
    }
  };

  eval("var _fixHeight=" + rotate(_fixWidth));

  // apply box-model + min/max fixes
  _fixWidth();
  _fixHeight(true);
  
  if (appVersion < 7) {
    IE7.CSS.addRecalc("min-width", NUMERIC, layout.minWidth);
    IE7.CSS.addFix(/\bmin-height\s*/, "height");
  }
})();

// =========================================================================
// ie7-graphics.js
// =========================================================================

// a small transparent image used as a placeholder
var BLANK_GIF = makePath("blank.gif", path);

var ALPHA_IMAGE_LOADER = "DXImageTransform.Microsoft.AlphaImageLoader";
var PNG_FILTER = "progid:" + ALPHA_IMAGE_LOADER + "(src='%1',sizingMethod='%2')";
  
// regular expression version of the above
var PNG;

var filtered = [];

function fixImage(element) {
  if (PNG.test(element.src)) {
    // we have to preserve width and height
    var image = new Image(element.width, element.height);
    image.onload = function() {
      element.width = image.width;
      element.height = image.height;
      image = null;
    };
    image.src = element.src;
    // store the original url (we'll put it back when it's printed)
    element.pngSrc = element.src;
    // add the AlphaImageLoader thingy
    addFilter(element);
  }
};

if (appVersion < 7) {
  // ** IE7 VARIABLE
  // e.g. apply the hack to all files ending in ".png"
  // IE7_PNG_SUFFIX = ".png";
  // You can also set it to a RegExp
  // IE7_PNG_SUFFIX = /\d+\.png$/;

  // replace background(-image): url(..) ..  with background(-image): .. ;filter: ..;
  IE7.CSS.addFix(/background(-image)?\s*:\s*([^};]*)?url\(([^\)]+)\)([^;}]*)?/, function(match, $1, $2, url, $4) {
    url = getString(url);
    return PNG.test(url) ? "filter:" + format(PNG_FILTER, url, $4.indexOf("no-repeat") === -1 ? "scale" : "crop") +
      ";zoom:1;background" + ($1||"") + ":" + ($2||"") + "none" + ($4||"") : match;
  });

  // list-style-image
  IE7.CSS.addRecalc(/list\-style(\-image)?/, "[^};]*url", function(element) {
    var url = element.currentStyle.listStyleImage.slice(5, -2);
    if (PNG.test(url)) {
      if (element.nodeName === "LI") {
        fixListStyleImage(element, url)
      } else if (element.nodeName === "UL") {
        for (var i = 0, li; li = element.childNodes[i]; i++) {
          if (li.nodeName === "LI") fixListStyleImage(li, url);
        }
      }
    }
  });

  function fixListStyleImage(element, src) {
    var style = element.runtimeStyle;
    var originalHeight = element.offsetHeight;
    var image = new Image;
    image.onload = function() {
      var paddingLeft = element.currentStyle.paddingLeft;
      paddingLeft = paddingLeft === "0px" ? 0 : getPixelValue(element, paddingLeft);
      style.paddingLeft = (paddingLeft + this.width) + "px";
      style.marginLeft = -this.width + "px";
      style.listStyleType = "none";
      style.listStyleImage = "none";
      style.paddingTop = Math.max(originalHeight - element.offsetHeight, 0) + "px";
      addFilter(element, "crop", src);
      element.style.zoom = "100%";
    };
    image.src = src;
  };
  
  // -----------------------------------------------------------------------
  //  fix PNG transparency (HTML images)
  // -----------------------------------------------------------------------

  IE7.HTML.addRecalc("img,input", function(element) {
    if (element.nodeName === "INPUT" && element.type !== "image") return;
    fixImage(element);
    addEventHandler(element, "onpropertychange", function() {
      if (!printing && event.propertyName === "src" &&
        element.src.indexOf(BLANK_GIF) === -1) fixImage(element);
    });
  });

  // assume that background images should not be printed
  //  (if they are not transparent then they'll just obscure content)
  // but we'll put foreground images back...
  var printing = false;
  addEventHandler(window, "onbeforeprint", function() {
    printing = true;
    for (var i = 0; i < filtered.length; i++) removeFilter(filtered[i]);
  });
  addEventHandler(window, "onafterprint", function() {
    for (var i = 0; i < filtered.length; i++) addFilter(filtered[i]);
    printing = false;
  });
}

// apply a filter
function addFilter(element, sizingMethod, src) {
  var filter = element.filters[ALPHA_IMAGE_LOADER];
  if (filter) {
    filter.src = src || element.src;
    filter.enabled = true;
  } else {
    element.runtimeStyle.filter = format(PNG_FILTER, src || element.src, sizingMethod || "scale");
    filtered.push(element);
  }
  // remove the real image
  element.src = BLANK_GIF;
};

function removeFilter(element) {
  element.src = element.pngSrc;
  element.filters[ALPHA_IMAGE_LOADER].enabled = false;
};

// =========================================================================
// ie7-fixed.js
// =========================================================================

(function() {
  if (appVersion >= 7) return;
  
  // some things to consider for this hack.
  // the document body requires a fixed background. even if
  //  it is just a blank image.
  // you have to use setExpression instead of onscroll, this
  //  together with a fixed body background helps avoid the
  //  annoying screen flicker of other solutions.
  
  IE7.CSS.addRecalc("position", "fixed", _positionFixed, "absolute");
  IE7.CSS.addRecalc("background(-attachment)?", "[^};]*fixed", _backgroundFixed);
  
  // scrolling is relative to the documentElement (HTML tag) when in
  //  standards mode, otherwise it's relative to the document body
  var $viewport = MSIE5 ? "body" : "documentElement";
  
  function _fixBackground() {
    // this is required by both position:fixed and background-attachment:fixed.
    // it is necessary for the document to also have a fixed background image.
    // we can fake this with a blank image if necessary
    if (body.currentStyle.backgroundAttachment !== "fixed") {
      if (body.currentStyle.backgroundImage === "none") {
        body.runtimeStyle.backgroundRepeat = "no-repeat";
        body.runtimeStyle.backgroundImage = "url(" + BLANK_GIF + ")"; // dummy
      }
      body.runtimeStyle.backgroundAttachment = "fixed";
    }
    _fixBackground = Undefined;
  };
  
  var _tmp = createTempElement("img");
  
  function _isFixed(element) {
    return element ? isFixed(element) || _isFixed(element.parentElement) : false;
  };
  
  function _setExpression(element, propertyName, expression) {
    setTimeout("document.all." + element.uniqueID + ".runtimeStyle.setExpression('" + propertyName + "','" + expression + "')", 0);
  };
  
  // -----------------------------------------------------------------------
  //  backgroundAttachment: fixed
  // -----------------------------------------------------------------------
  
  function _backgroundFixed(element) {
    if (register(_backgroundFixed, element, element.currentStyle.backgroundAttachment === "fixed" && !element.contains(body))) {
      _fixBackground();
      util.bgLeft(element);
      util.bgTop(element);
      _backgroundPosition(element);
    }
  };
  
  function _backgroundPosition(element) {
    _tmp.src = element.currentStyle.backgroundImage.slice(5, -2);
    var parentElement = element.canHaveChildren ? element : element.parentElement;
    parentElement.appendChild(_tmp);
    util.setOffsetLeft(element);
    util.setOffsetTop(element);
    parentElement.removeChild(_tmp);
  };
  
  // -----------------------------------------------------------------------
  //  position: fixed
  // -----------------------------------------------------------------------
  
  function _positionFixed(element) {
    if (register(_positionFixed, element, isFixed(element))) {
      setOverrideStyle(element, "position",  "absolute");
      setOverrideStyle(element, "left",  element.currentStyle.left);
      setOverrideStyle(element, "top",  element.currentStyle.top);
      _fixBackground();
      IE7.Layout.fixRight(element);
      //IE7.Layout.fixBottom(element);
      _foregroundPosition(element);
    }
  };
  
  function _foregroundPosition(element, recalc) {
    document.body.getBoundingClientRect(); // force a reflow
    util.positionTop(element, recalc);
    util.positionLeft(element, recalc, true);
    if (!element.runtimeStyle.autoLeft && element.currentStyle.marginLeft === "auto" &&
      element.currentStyle.right !== "auto") {
      var left = viewport.clientWidth - util.getPixelWidth(element, element.currentStyle.right) -
        util.getPixelWidth(element, element.runtimeStyle._left) - element.clientWidth;
      if (element.currentStyle.marginRight === "auto") left = parseInt(left / 2);
      if (_isFixed(element.offsetParent)) element.runtimeStyle.pixelLeft += left;
      else element.runtimeStyle.shiftLeft = left;
    }
    if (!element.runtimeStyle.fixedWidth) util.clipWidth(element);
    if (!element.runtimeStyle.fixedHeight) util.clipHeight(element);
  };
  
  // -----------------------------------------------------------------------
  //  capture window resize
  // -----------------------------------------------------------------------
  
  function _resize() {
    // if the window has been resized then some positions need to be
    //  recalculated (especially those aligned to "right" or "top"
    var elements = _backgroundFixed.elements;
    for (var i in elements) _backgroundPosition(elements[i]);
    elements = _positionFixed.elements;
    for (i in elements) {
      _foregroundPosition(elements[i], true);
      _foregroundPosition(elements[i], true);
    }
    _timer = 0;
  };
  
  // use a timer (sometimes this is a good way to prevent resize loops)
  var _timer;
  addResize(function() {
    if (!_timer) _timer = setTimeout(_resize, 100);
  });

  // -----------------------------------------------------------------------
  //  rotated
  // -----------------------------------------------------------------------

  var util = {};
  
  var _horizontal = function(util) {
    util.bgLeft = function(element) {
      element.style.backgroundPositionX = element.currentStyle.backgroundPositionX;
      if (!_isFixed(element)) {
        _setExpression(element, "backgroundPositionX", "(parseInt(runtimeStyle.offsetLeft)+document." + $viewport + ".scrollLeft)||0");
      }
    };

    util.setOffsetLeft = function(element) {
      var propertyName = _isFixed(element) ? "backgroundPositionX" : "offsetLeft";
      element.runtimeStyle[propertyName] =
        util.getOffsetLeft(element, element.style.backgroundPositionX) -
        element.getBoundingClientRect().left - element.clientLeft + 2;
    };

    util.getOffsetLeft = function(element, position) {
      switch (position) {
        case "left":
        case "top":
          return 0;
        case "right":
        case "bottom":
          return viewport.clientWidth - _tmp.offsetWidth;
        case "center":
          return (viewport.clientWidth - _tmp.offsetWidth) / 2;
        default:
          if (PERCENT.test(position)) {
            return parseInt((viewport.clientWidth - _tmp.offsetWidth) * parseFloat(position) / 100);
          }
          _tmp.style.left = position;
          return _tmp.offsetLeft;
      }
    };

    util.clipWidth = function(element) {
      var fixWidth = element.runtimeStyle.fixWidth;
      element.runtimeStyle.borderRightWidth = "";
      element.runtimeStyle.width = fixWidth ? util.getPixelWidth(element, fixWidth) + "px" : "";
      if (element.currentStyle.width !== "auto") {
        var rect = element.getBoundingClientRect();
        var width = element.offsetWidth - viewport.clientWidth + rect.left - 2;
        if (width >= 0) {
          element.runtimeStyle.borderRightWidth = "0px";
          width = Math.max(getPixelValue(element, element.currentStyle.width) - width, 0);
          setOverrideStyle(element, "width",  width);
          return width;
        }
      }
    };

    util.positionLeft = function(element, recalc) {
      // if the element's width is in % units then it must be recalculated
      //  with respect to the viewport
      if (!recalc && PERCENT.test(element.currentStyle.width)) {
        element.runtimeStyle.fixWidth = element.currentStyle.width;
      }
      if (element.runtimeStyle.fixWidth) {
        element.runtimeStyle.width = util.getPixelWidth(element, element.runtimeStyle.fixWidth);
      }
      //if (recalc) {
      //  // if the element is fixed on the right then no need to recalculate
      //  if (!element.runtimeStyle.autoLeft) return;
      //} else {
        element.runtimeStyle.shiftLeft = 0;
        element.runtimeStyle._left = element.currentStyle.left;
        // is the element fixed on the right?
        element.runtimeStyle.autoLeft = element.currentStyle.right !== "auto" && element.currentStyle.left === "auto";
      //}
      // reset the element's "left" value and get it's natural position
      element.runtimeStyle.left = "";
      element.runtimeStyle.screenLeft = util.getScreenLeft(element);
      element.runtimeStyle.pixelLeft = element.runtimeStyle.screenLeft;
      // if the element is contained by another fixed element then there is no need to
      //  continually recalculate it's left position
      if (!recalc && !_isFixed(element.offsetParent)) {
        // onsrcoll produces jerky movement, so we use an expression
        _setExpression(element, "pixelLeft", "runtimeStyle.screenLeft+runtimeStyle.shiftLeft+document." + $viewport + ".scrollLeft");
      }
    };

    // I've forgotten how this works...
    util.getScreenLeft = function(element) { // thanks to kevin newman (captainn)
      var screenLeft = element.offsetLeft, nested = 1;
      if (element.runtimeStyle.autoLeft) {
        screenLeft = viewport.clientWidth - element.offsetWidth - util.getPixelWidth(element, element.currentStyle.right);
      }
      // accommodate margins
      if (element.currentStyle.marginLeft !== "auto") {
        screenLeft -= util.getPixelWidth(element, element.currentStyle.marginLeft);
      }
      while (element = element.offsetParent) {
        if (element.currentStyle.position !== "static") nested = -1;
        screenLeft += element.offsetLeft * nested;
      }
      return screenLeft;
    };

    util.getPixelWidth = function(element, value) {
      return PERCENT.test(value) ? parseInt(parseFloat(value) / 100 * viewport.clientWidth) : getPixelValue(element, value);
    };
  };
  eval("var _vertical=" + rotate(_horizontal));
  _horizontal(util);
  _vertical(util);
})();

// =========================================================================
// ie7-oveflow.js
// =========================================================================

/* ---------------------------------------------------------------------

  This module alters the structure of the document.
  It may adversely affect other CSS rules. Be warned.

--------------------------------------------------------------------- */

if (appVersion < 7) {
  var WRAPPER_STYLE = {
    backgroundColor: "transparent",
    backgroundImage: "none",
    backgroundPositionX: null,
    backgroundPositionY: null,
    backgroundRepeat: null,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftStyle: "none",
    borderTopStyle: "none",
    borderRightStyle: "none",
    borderBottomStyle: "none",
    borderLeftWidth: 0,
    borderLeftColor: "#000",
    borderTopColor: "#000",
    borderRightColor: "#000",
    borderBottomColor: "#000",
    height: null,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
    width: "100%"
  };

  IE7.CSS.addRecalc("overflow", "visible", function(element) {
    if (element.currentStyle.position === "absolute") return;
    
    // don't do this again
    if (element.parentNode.ie7_wrapped) return;

    // if max-height is applied, makes sure it gets applied first
    if (IE7.Layout && element.currentStyle["max-height"] !== "auto") {
      IE7.Layout.maxHeight(element);
    }

    if (element.currentStyle.marginLeft === "auto") element.style.marginLeft = 0;
    if (element.currentStyle.marginRight === "auto") element.style.marginRight = 0;

    var wrapper = document.createElement(ANON);
    wrapper.ie7_wrapped = element;
    for (var propertyName in WRAPPER_STYLE) {
      wrapper.style[propertyName] = element.currentStyle[propertyName];
      if (WRAPPER_STYLE[propertyName] != null) {
        element.runtimeStyle[propertyName] = WRAPPER_STYLE[propertyName];
      }
    }
    wrapper.style.display = "block";
    wrapper.style.position = "relative";
    element.runtimeStyle.position = "absolute";
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  });
}

// =========================================================================
// ie7-quirks.js
// =========================================================================

function ie7Quirks() {
  var FONT_SIZES = "xx-small,x-small,small,medium,large,x-large,xx-large".split(",");
  for (var i = 0; i < FONT_SIZES.length; i++) {
    FONT_SIZES[FONT_SIZES[i]] = FONT_SIZES[i - 1] || "0.67em";
  }
  
  IE7.CSS.addFix(/(font(-size)?\s*:\s*)([\w.-]+)/, function(match, label, size, value) {
    return label + (FONT_SIZES[value] || value);
  });
  
  var NEGATIVE = /^\-/, LENGTH = /(em|ex)$/i;
  var EM = /em$/i, EX = /ex$/i;

  getPixelValue = function(element, value) {
    if (PIXEL.test(value)) return parseInt(value)||0;
    var scale = NEGATIVE.test(value)? -1 : 1;
    if (LENGTH.test(value)) scale *= getFontScale(element);
    temp.style.width = scale < 0 ? value.slice(1) : value;
    body.appendChild(temp);
    // retrieve pixel width
    value = scale * temp.offsetWidth;
    // remove the temporary element
    temp.removeNode();
    return parseInt(value);
  };

  var temp = createTempElement();
  function getFontScale(element) {
    var scale = 1;
    temp.style.fontFamily = element.currentStyle.fontFamily;
    temp.style.lineHeight = element.currentStyle.lineHeight;
    //temp.style.fontSize = "";
    while (element != body) {
      var fontSize = element.currentStyle["ie7-font-size"];
      if (fontSize) {
        if (EM.test(fontSize)) scale *= parseFloat(fontSize);
        else if (PERCENT.test(fontSize)) scale *= (parseFloat(fontSize) / 100);
        else if (EX.test(fontSize)) scale *= (parseFloat(fontSize) / 2);
        else {
          temp.style.fontSize = fontSize;
          return 1;
        }
      }
      element = element.parentElement;
    }
    return scale;
  };

  // cursor:pointer (IE5.x)
  IE7.CSS.addFix(/cursor\s*:\s*pointer/, "cursor:hand");
  // display:list-item (IE5.x)
  IE7.CSS.addFix(/display\s*:\s*list-item/, "display:block");
  
  // -----------------------------------------------------------------------
  //  margin:auto
  // -----------------------------------------------------------------------
  
  function fixMargin(element) {
    var parent = element.parentElement;
    var margin = parent.offsetWidth - element.offsetWidth - getPaddingWidth(parent);
    var autoRight = (element.currentStyle["ie7-margin"] && element.currentStyle.marginRight === "auto") ||
      element.currentStyle["ie7-margin-right"] === "auto";
    switch (parent.currentStyle.textAlign) {
      case "right":
        margin = autoRight ? parseInt(margin / 2) : 0;
        element.runtimeStyle.marginRight = margin + "px";
        break;
      case "center":
        if (autoRight) margin = 0;
      default:
        if (autoRight) margin /= 2;
        element.runtimeStyle.marginLeft = parseInt(margin) + "px";
    }
  };

  function getPaddingWidth(element) {
    return getPixelValue(element, element.currentStyle.paddingLeft) +
      getPixelValue(element, element.currentStyle.paddingRight);
  };
  
  IE7.CSS.addRecalc("margin(-left|-right)?", "[^};]*auto", function(element) {
    if (register(fixMargin, element,
      element.parentElement &&
      element.currentStyle.display === "block" &&
      element.currentStyle.marginLeft === "auto" &&
      element.currentStyle.position !== "absolute")) {
        fixMargin(element);
    }
  });
  
  addResize(function() {
    for (var i in fixMargin.elements) {
      var element = fixMargin.elements[i];
      element.runtimeStyle.marginLeft =
      element.runtimeStyle.marginRight = "";
      fixMargin(element);
    }
  });
};


// =========================================================================
// ie8-css.js
// =========================================================================

var BRACKETS = "\\([^)]+\\)";

// pseudo-elements can be declared with a double colon
encoder.add(/::(before|after)/, ":$1");

if (appVersion < 8) {

  if (IE7.CSS.pseudoClasses) IE7.CSS.pseudoClasses += "|";
  IE7.CSS.pseudoClasses += "before|after|lang" + BRACKETS;

  // -----------------------------------------------------------------------
  // propertyName: inherit;
  // -----------------------------------------------------------------------
  
  function parseInherited(cssText) {
    return cssText.replace(new RegExp("([{;\\s])(" + inheritedProperties.join("|") + ")\\s*:\\s*([^;}]+)", "g"), "$1$2:$3;ie7-$2:$3");
  };

  var INHERITED = /[\w-]+\s*:\s*inherit/g;
  var STRIP_IE7_FLAGS = /ie7\-|\s*:\s*inherit/g;
  var DASH_LOWER = /\-([a-z])/g;
  function toUpper(match, chr) {return chr.toUpperCase()};
  
  IE7.CSS.addRecalc("[\\w-]+", "inherit", function(element, cssText) {
    if (element.parentElement) {
      var inherited = cssText.match(INHERITED);
      for (var i = 0; i < inherited.length; i++) {
        var propertyName = inherited[i].replace(STRIP_IE7_FLAGS, "");
        if (element.currentStyle["ie7-" + propertyName] === "inherit") {
          propertyName = propertyName.replace(DASH_LOWER, toUpper);
          element.runtimeStyle[propertyName] = element.parentElement.currentStyle[propertyName];
        }
      }
    }
  }, function(match) {
    inheritedProperties.push(rescape(match.slice(1).split(":")[0]));
    return match;
  });

  // -----------------------------------------------------------------------
  // dynamic pseudo-classes
  // -----------------------------------------------------------------------

  var Focus = new DynamicPseudoClass("focus", function(element) {
    var instance = arguments;

    IE7.CSS.addEventHandler(element, "onfocus", function() {
      Focus.unregister(instance); // in case it starts with focus
      Focus.register(instance);
    });

    IE7.CSS.addEventHandler(element, "onblur", function() {
      Focus.unregister(instance);
    });

    // check the active element for initial state
    if (element == document.activeElement) {
      Focus.register(instance)
    }
  });

  var Active = new DynamicPseudoClass("active", function(element) {
    var instance = arguments;
    IE7.CSS.addEventHandler(element, "onmousedown", function() {
      Active.register(instance);
    });
  });

  // globally trap the mouseup event (thanks Martijn!)
  addEventHandler(document, "onmouseup", function() {
    var instances = Active.instances;
    for (var i in instances) Active.unregister(instances[i]);
  });

  // -----------------------------------------------------------------------
  // IE7 pseudo elements
  // -----------------------------------------------------------------------

  // constants
  var URL = /^url\s*\(\s*([^)]*)\)$/;
  var POSITION_MAP = {
    before0: "beforeBegin",
    before1: "afterBegin",
    after0: "afterEnd",
    after1: "beforeEnd"
  };

  var PseudoElement = IE7.PseudoElement = Rule.extend({
    constructor: function(selector, position, cssText) {
      // initialise object properties
      this.position = position;
      var content = cssText.match(PseudoElement.CONTENT), match, entity;
      if (content) {
        content = content[1];
        match = content.split(/\s+/);
        for (var i = 0; (entity = match[i]); i++) {
          match[i] = /^attr/.test(entity) ? {attr: entity.slice(5, -1)} :
            entity.charAt(0) === "'" ? getString(entity) : decode(entity);
        }
        content = match;
      }
      this.content = content;
      // CSS text needs to be decoded immediately
      this.base(selector, decode(cssText));
    },

    init: function() {
      // execute the underlying css query for this class
      this.match = cssQuery(this.selector);
      for (var i = 0; i < this.match.length; i++) {
        var runtimeStyle = this.match[i].runtimeStyle;
        if (!runtimeStyle[this.position]) runtimeStyle[this.position] = {cssText:""};
        runtimeStyle[this.position].cssText += ";" + this.cssText;
        if (this.content != null) runtimeStyle[this.position].content = this.content;
      }
    },

    create: function(target) {
      var generated = target.runtimeStyle[this.position];
      if (generated) {
        // copy the array of values
        var content = [].concat(generated.content || "");
        for (var j = 0; j < content.length; j++) {
          if (typeof content[j] == "object") {
            content[j] = target.getAttribute(content[j].attr);
          }
        }
        content = content.join("");
        var url = content.match(URL);
        var cssText = "overflow:hidden;" + generated.cssText.replace(/'/g, '"');
        var position = POSITION_MAP[this.position + Number(target.canHaveChildren)];
        var id = 'ie7_pseudo' + PseudoElement.count++;
        target.insertAdjacentHTML(position, format(PseudoElement.ANON, this.className, id, cssText, url ? "" : content));
        if (url) {
          var src = getString(url[1]);
          var pseudoElement = document.getElementById(id);
          pseudoElement.src = src;
          addFilter(pseudoElement, "crop");
          var targetIsFloated = target.currentStyle.styleFloat !== "none";
          if (pseudoElement.currentStyle.display === "inline" || targetIsFloated) {
            if (appVersion < 7 && targetIsFloated && target.canHaveChildren) {
              target.runtimeStyle.display = "inline";
              target.runtimeStyle.position = "relative";
              pseudoElement.runtimeStyle.position = "absolute";
            }
            pseudoElement.style.display = "inline-block";
            if (target.currentStyle.styleFloat !== "none") {
              pseudoElement.style.pixelWidth = target.offsetWidth;
            }
            var image = new Image;
            image.onload = function() {
              pseudoElement.style.pixelWidth = this.width;
              pseudoElement.style.pixelHeight = Math.max(this.height, pseudoElement.offsetHeight);
            };
            image.src = src;
          }
        }
        target.runtimeStyle[this.position] = null;
      }
    },

    recalc: function() {
      if (this.content == null) return;
      for (var i = 0; i < this.match.length; i++) {
        this.create(this.match[i]);
      }
    },

    toString: function() {
      return "." + this.className + "{display:inline}";
    }
  }, {
    CONTENT: /content\s*:\s*([^;]*)(;|$)/,
    ANON: "<ie7:! class='ie7_anon %1' id=%2 style='%3'>%4</ie7:!>",
    MATCH: /(.*):(before|after).*/,

    count: 0
  });

  IE7._getLang = function(element) {
    var lang = "";
    while (element && element.nodeType === 1) {
      lang = element.lang || element.getAttribute("lang") || "";
      if (lang) break;
      element = element.parentNode;
    }
    return lang;
  };

  FILTER = extend(FILTER, {
    ":lang\\(([^)]+)\\)":    "((ii=IE7._getLang(e))==='$1'||ii.indexOf('$1-')===0)&&"
  });
}

// =========================================================================
// ie8-html.js
// =========================================================================

var UNSUCCESSFUL = /^(submit|reset|button)$/;

// -----------------------------------------------------------------------
// <button>
// -----------------------------------------------------------------------

// IE bug means that innerText is submitted instead of "value"
IE7.HTML.addRecalc("button,input", function(button) {
  if (button.nodeName === "BUTTON") {
    var match = button.outerHTML.match(/ value="([^"]*)"/i);
    button.runtimeStyle.value = match ? match[1] : "";
  }
  // flag the button/input that was used to submit the form
  if (button.type === "submit") {
    addEventHandler(button, "onclick", function() {
      button.runtimeStyle.clicked = true;
      setTimeout("document.all." + button.uniqueID + ".runtimeStyle.clicked=false", 1);
    });
  }
});

// -----------------------------------------------------------------------
// <form>
// -----------------------------------------------------------------------

// only submit "successful controls
IE7.HTML.addRecalc("form", function(form) {
  addEventHandler(form, "onsubmit", function() {
    for (var element, i = 0; element = form[i]; i++) {
      if (UNSUCCESSFUL.test(element.type) && !element.disabled && !element.runtimeStyle.clicked) {
        element.disabled = true;
        setTimeout("document.all." + element.uniqueID + ".disabled=false", 1);
      } else if (element.nodeName === "BUTTON" && element.type === "submit") {
        setTimeout("document.all." + element.uniqueID + ".value='" + element.value + "'", 1);
        element.value = element.runtimeStyle.value;
      }
    }
  });
});

// -----------------------------------------------------------------------
// <img>
// -----------------------------------------------------------------------

// get rid of the spurious tooltip produced by the alt attribute on images
IE7.HTML.addRecalc("img", function(img) {
  if (img.alt && !img.title) img.title = "";
});

// =========================================================================
// ie8-layout.js
// =========================================================================

if (appVersion < 8) {
  IE7.CSS.addRecalc("border-spacing", NUMERIC, function(element) {
    if (element.currentStyle.borderCollapse !== "collapse") {
      element.cellSpacing = getPixelValue(element, element.currentStyle["ie7-border-spacing"].split(" ")[0]);
    }
  });
  IE7.CSS.addRecalc("box-sizing", "content-box", IE7.Layout.boxSizing);
  IE7.CSS.addRecalc("box-sizing", "border-box", IE7.Layout.borderBox);
}

// =========================================================================
// ie8-graphics.js
// =========================================================================

if (appVersion < 8) {
  // fix object[type=image/*]
  var IMAGE = /^image/i;
  IE7.HTML.addRecalc("object", function(element) {
    if (IMAGE.test(element.type)) {
      element.body.style.cssText = "margin:0;padding:0;border:none;overflow:hidden";
      return element;
    }
  });
}

// =========================================================================
// ie9-css.js
// =========================================================================

var NOT_NEXT_BY_TYPE     = "!IE7._getElementSiblingByType(e,'next')&&",
    NOT_PREVIOUS_BY_TYPE = NOT_NEXT_BY_TYPE.replace("next", "previous");

if (IE7.CSS.pseudoClasses) IE7.CSS.pseudoClasses += "|";
IE7.CSS.pseudoClasses += "(?:first|last|only)\\-(?:child|of\\-type)|empty|root|target|" +
  ("not|nth\\-child|nth\\-last\\-child|nth\\-of\\-type|nth\\-last\\-of\\-type".split("|").join(BRACKETS + "|") + BRACKETS);
  
// :checked
var Checked = new DynamicPseudoClass("checked", function(element) {
  if (typeof element.checked !== "boolean") return;
  var instance = arguments;
  IE7.CSS.addEventHandler(element, "onpropertychange", function() {
    if (event.propertyName === "checked") {
      if (element.checked === true) Checked.register(instance);
      else Checked.unregister(instance);
    }
  });
  // check current checked state
  if (element.checked === true) Checked.register(instance);
});

// :enabled
var Enabled = new DynamicPseudoClass("enabled", function(element) {
  if (typeof element.disabled !== "boolean") return;
  var instance = arguments;
  IE7.CSS.addEventHandler(element, "onpropertychange", function() {
    if (event.propertyName === "disabled") {
      if (element.disabled === false) Enabled.register(instance);
      else Enabled.unregister(instance);
    }
  });
  // check current disabled state
  if (element.disabled === false) Enabled.register(instance);
});

// :disabled
var Disabled = new DynamicPseudoClass("disabled", function(element) {
  if (typeof element.disabled !== "boolean") return;
  var instance = arguments;
  IE7.CSS.addEventHandler(element, "onpropertychange", function() {
    if (event.propertyName === "disabled") {
      if (element.disabled === true) Disabled.register(instance);
      else Disabled.unregister(instance);
    }
  });
  // check current disabled state
  if (element.disabled === true) Disabled.register(instance);
});

// :indeterminate (Kevin Newman)
var Indeterminate = new DynamicPseudoClass("indeterminate", function(element) {
  if (typeof element.indeterminate !== "boolean") return;
  var instance = arguments;
  IE7.CSS.addEventHandler(element, "onpropertychange", function() {
    if (event.propertyName === "indeterminate") {
      if (element.indeterminate === true) Indeterminate.register(instance);
      else Indeterminate.unregister(instance);
    }
  });
  IE7.CSS.addEventHandler(element, "onclick", function() {
    Indeterminate.unregister(instance);
  });
  // clever Kev says no need to check this up front
});

// :target
var Target = new DynamicPseudoClass("target", function(element) {
  var instance = arguments;
  // if an element has a tabIndex then it can become "active".
  //  The default is zero anyway but it works...
  if (!element.tabIndex) element.tabIndex = 0;
  // this doesn't detect the back button. I don't know how to do that without adding an iframe :-(
  IE7.CSS.addEventHandler(document, "onpropertychange", function() {
    if (event.propertyName === "activeElement") {
      if (element.id && element.id === location.hash.slice(1)) Target.register(instance);
      else Target.unregister(instance);
    }
  });
  // check the current location
  if (element.id && element.id === location.hash.slice(1)) Target.register(instance);
});

// Register a node and index its siblings.
var _currentIndex = 1, // -@DRE
    allIndexes = {_currentIndex: 1};

IE7._indexOf = function(element, last, ofType) {
  var parent = element.parentNode;
  if (!parent || parent.nodeType !== 1) return NaN;

  var tagName = ofType ? element.nodeName : "";
  if (tagName === "TR" && element.sectionRowIndex >= 0) {
    var index = element.sectionRowIndex;
    return last ? element.parentNode.rows.length - index + 1 : index;
  }
  if ((tagName === "TD" || tagName === "TH") && element.cellIndex >= 0) {
    index = element.cellIndex;
    return last ? element.parentNode.cells.length - index + 1 : index;
  }
  if (allIndexes._currentIndex !== _currentIndex) {
    allIndexes = {_currentIndex: _currentIndex};
  }
  var id = (parent.uniqueID) + "-" + tagName,
      indexes = allIndexes[id];
  if (!indexes) {
    indexes = {};
    var index = 0,
        child = parent.firstChild;
    while (child) {
      if (ofType ? child.nodeName === tagName : child.nodeName > "@") {
        indexes[child.uniqueID] = ++index;
      }
      child = child.nextSibling;
    }
    indexes.length = index;
    allIndexes[id] = indexes;
  }
  index = indexes[element.uniqueID];
  return last ? indexes.length - index + 1 : index;
};

IE7._isEmpty = function(node) {
  node = node.firstChild;
  while (node) {
    if (node.nodeType === 3 || node.nodeName > "@") return false;
    node = node.nextSibling;
  }
  return true;
};

IE7._getElementSiblingByType = function(node, direction) {
  var tagName = node.nodeName;
  direction += "Sibling";
  do {
    node = node[direction];
    if (node && node.nodeName === tagName) break;
  } while (node);
  return node;
};

var ONE = {"+": 1, "-": -1}, SPACES = / /g;

FILTER = extend(extend({
  ":nth(-last)?-(?:child|(of-type))\\((<#nth_arg>)\\)(<#filter>)?": function(match, last, ofType, args, filters) { // :nth- pseudo classes
    args = args.replace(SPACES, "");

    var index = "IE7._indexOf(e," + !!last + "," + !!ofType + ")";

    if (args === "even") args = "2n";
    else if (args === "odd") args = "2n+1";
    else if (!isNaN(args)) args = "0n" + ~~args;

    args = args.split("n");
    var a = ~~(ONE[args[0]] || args[0] || 1),
        b = ~~args[1];
    if (a === 0) {
      var expr = index + "===" + b;
    } else {
      expr = "((ii=" + index + ")-(" + b + "))%" + a + "===0&&ii" + (a < 0 ? "<" : ">") + "=" + b;
    }
    return this.parse(filters) + expr + "&&";
  },

  "<#negation>": function(match, simple) {
    if (/:not/i.test(simple)) throwSelectorError();

    if (/^[#.:\[]/.test(simple)) {
      simple = "*" + simple;
    }
    return "!(" + MATCHER.parse(simple).slice(3, -2) + ")&&";
  }
}, FILTER), {
  ":checked":         "e.checked===true&&",
  ":disabled":        "e.disabled===true&&",
  ":enabled":         "e.disabled===false&&",
  ":last-child":      "!" + NEXT_SIBLING + "&&",
  ":only-child":      "!" + PREVIOUS_SIBLING + "&&!" + NEXT_SIBLING + "&&",
  ":first-of-type":   NOT_PREVIOUS_BY_TYPE,
  ":last-of-type":    NOT_NEXT_BY_TYPE,
  ":only-of-type":    NOT_PREVIOUS_BY_TYPE + NOT_NEXT_BY_TYPE,

  ":empty":          "IE7._isEmpty(e)&&",
  ":root":           "e==R&&",
  ":target":         "H&&" + ID_ATTRIBUTE + "===H&&"
});

var HTML5 = "article,aside,audio,canvas,details,figcaption,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,summary,time,video".split(",");
for (var i = 0, tagName; tagName = HTML5[i]; i++) document.createElement(tagName);

HEADER += "datalist{display:none}\
details{padding-left:40px;display:block;margin:1em 0}\
meter,progress{vertical-align:-0.2em;width:5em;height:1em;display:inline-block}\
progress{width:10em;}\
article,aside,figcaption,footer,header,hgroup,summary,section,nav{display:block;margin:1em 0}\
figure{margin:1em 40px;display:block}\
mark{background:yellow}";

// =========================================================================
// ie9-layout.js
// =========================================================================

// =========================================================================
// ie9-graphics.js
// =========================================================================

IE7.CSS.addFix(/\bopacity\s*:\s*([\d.]+)/, function(match, value) {
  return "zoom:1;filter:Alpha(opacity=" + ((value * 100) || 1) + ")";
});

var MATCHER;

var cssQuery = (function() {
  var CONTEXT = /^[>+~]/;
  
  var useContext = false;
  
  // This is not a selector engine in the strictest sense. So it's best to silently error.
  function cssQuery(selector, context, single) {
    selector = trim(selector);
    if (!context) context = document;
    var ref = context;
    useContext = CONTEXT.test(selector);
    if (useContext) {
      context = context.parentNode;
      selector = "*" + selector;
    }
    try {
      return selectQuery.create(selector, useContext)(context, single ? null : [], ref);
    } catch (ex) {
      return single ? null : [];
    }
  };

  var VALID_SELECTOR = /^(\\.|[' >+~#.\[\]:*(),\w-\^|$=]|[^\x00-\xa0])+$/;

  var _EVALUATED = /^(href|src)$/;
  var _ATTRIBUTES = {
    "class": "className",
    "for": "htmlFor"
  };

  var IE7_CLASS_NAMES = /\sie7_\w+/g;

  var USE_IFLAG = /^(action|cite|codebase|data|dynsrc|href|longdesc|lowsrc|src|usemap|url)$/i;

  IE7._getAttribute = function(element, name) {
    if (element.getAttributeNode) {
      var attribute = element.getAttributeNode(name);
    }
    name = _ATTRIBUTES[name.toLowerCase()] || name;
    if (!attribute) attribute = element.attributes[name];
    var specified = attribute && attribute.specified;

    if (element[name] && typeof element[name] == "boolean") return name.toLowerCase();
    if ((specified && USE_IFLAG.test(name)) || (!attribute && MSIE5) || name === "value" || name === "type") {
      return element.getAttribute(name, 2);
    }
    if (name === "style") return element.style.cssText.toLowerCase() || null;

    return specified ? String(attribute.nodeValue) : null;
  };

  var names = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
  // Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
  extend(_ATTRIBUTES, combine(names.toLowerCase().split(","), names.split(",")));

  IE7._getElementSibling = function(node, direction) {
    direction += "Sibling";
    do {
      node = node[direction];
      if (node && node.nodeName > "@") break;
    } while (node);
    return node;
  };

  var IMPLIED_ASTERISK    = /(^|[, >+~])([#.:\[])/g,
      BLOCKS              = /\)\{/g,
      COMMA               = /,/,
      QUOTED              = /^['"]/,
      HEX_ESCAPE          = /\\([\da-f]{2,2})/gi,
      LAST_CHILD          = /last/i;

  IE7._byId = function(document, id) {
    var result = document.all[id] || null;
    // Returns a single element or a collection.
    if (!result || (result.nodeType && IE7._getAttribute(result, "id") === id)) return result;
    // document.all has returned a collection of elements with name/id
    for (var i = 0; i < result.length; i++) {
      if (IE7._getAttribute(result[i], "id") === id) return result[i];
    }
    return null;
  };

  // =========================================================================
  // dom/selectors-api/CSSSelectorParser.js
  // =========================================================================

  // http://www.w3.org/TR/css3-selectors/#w3cselgrammar (kinda)
  var CSSSelectorParser = RegGrp.extend({
    dictionary: new Dictionary({
      ident:           /\-?(\\.|[_a-z]|[^\x00-\xa0])(\\.|[\w-]|[^\x00-\xa0])*/,
      combinator:      /[\s>+~]/,
      operator:        /[\^~|$*]?=/,
      nth_arg:         /[+-]?\d+|[+-]?\d*n(?:\s*[+-]\s*\d+)?|even|odd/,
      tag:             /\*|<#ident>/,
      id:              /#(<#ident>)/,
      'class':         /\.(<#ident>)/,
      pseudo:          /\:([\w-]+)(?:\(([^)]+)\))?/,
      attr:            /\[(<#ident>)(?:(<#operator>)((?:\\.|[^\[\]#.:])+))?\]/,
      negation:        /:not\((<#tag>|<#id>|<#class>|<#attr>|<#pseudo>)\)/,
      sequence:        /(\\.|[~*]=|\+\d|\+?\d*n\s*\+\s*\d|[^\s>+~,\*])+/,
      filter:          /[#.:\[]<#sequence>/,
      selector:        /[^>+~](\\.|[^,])*?/,
      grammar:         /^(<#selector>)((,<#selector>)*)$/
    }),

    ignoreCase: true
  });

  var normalizer = new CSSSelectorParser({
    "\\\\.|[~*]\\s+=|\\+\\s+\\d": RegGrp.IGNORE,
    "\\[\\s+": "[",
    "\\(\\s+": "(",
    "\\s+\\)": ")",
    "\\s+\\]": "]",
    "\\s*([,>+~]|<#operator>)\\s*": "$1",
    "\\s+$": "",
    "\\s+": " "
  });

  function normalize(selector) {
    selector = normalizer.parse(selector.replace(HEX_ESCAPE, "\\x$1"))
      .replace(UNESCAPE, "$1")
      .replace(IMPLIED_ASTERISK, "$1*$2");
    if (!VALID_SELECTOR.test(selector)) throwSelectorError();
    return selector;
  };

  function unescape(query) {
    // put string values back
    return query.replace(ESCAPED, unescapeString);
  };

  function unescapeString(match, index) {
    return strings[index];
  };

  var BRACES = /\{/g, BRACES_ESCAPED = /\\{/g;

  function closeBlock(group) {
    return Array((group.replace(BRACES_ESCAPED, "").match(BRACES) || "").length + 1).join("}");
  };

  FILTER = new CSSSelectorParser(FILTER);

  var TARGET = /:target/i, ROOT = /:root/i;

  function getConstants(selector) {
    var constants = "";
    if (ROOT.test(selector)) constants += ",R=d.documentElement";
    if (TARGET.test(selector)) constants += ",H=d.location;H=H&&H.hash.replace('#','')";
    if (constants || selector.indexOf("#") !== -1) {
      constants = ",t=c.nodeType,d=t===9?c:c.ownerDocument||(c.document||c).parentWindow.document" + constants;
    }
    return "var ii" + constants + ";";
  };

  var COMBINATOR = {
    " ":   ";while(e!=s&&(e=e.parentNode)&&e.nodeType===1){",
    ">":   ".parentElement;if(e){",
    "+":   ";while((e=e.previousSibling)&&!(" + IS_ELEMENT + "))continue;if(e){",
    "~":   ";while((e=e.previousSibling)){" + IF_ELEMENT
  };

  var TOKEN = /\be\b/g;

  MATCHER = new CSSSelectorParser({
    "(?:(<#selector>)(<#combinator>))?(<#tag>)(<#filter>)?$": function(match, before, combinator, tag, filters) {
      var group = "";
      if (tag !== "*") {
        var TAG = tag.toUpperCase();
        group += "if(e.nodeName==='" + TAG + (TAG === tag ? "" : "'||e.nodeName==='" + tag) + "'){";
      }
      if (filters) {
        group += "if(" + FILTER.parse(filters).slice(0, -2) + "){";
      }
      group = group.replace(TOKEN, "e" + this.index);
      if (combinator) {
        group += "var e=e" + (this.index++) + COMBINATOR[combinator];
        group = group.replace(TOKEN, "e" + this.index);
      }
      if (before) {
        group += this.parse(before);
      }
      return group;
    }
  });
  
  var BY_ID       = "e0=IE7._byId(d,'%1');if(e0){",
      BY_TAG_NAME = "var n=c.getElementsByTagName('%1');",
      STORE       = "if(r==null)return e0;r[k++]=e0;";

  var TAG_NAME = 1;

  var SELECTOR = new CSSSelectorParser({
    "^((?:<#selector>)?(?:<#combinator>))(<#tag>)(<#filter>)?$": true
  });

  var cache = {};

  var selectById = new CSSSelectorParser({
    "^(<#tag>)#(<#ident>)(<#filter>)?( [^,]*)?$": function(match, tagName, id, filters, after) {
      var block = format(BY_ID, id), endBlock = "}";
      if (filters) {
        block += MATCHER.parse(tagName + filters);
        endBlock = closeBlock(block);
      }
      if (after) {
        block += "s=c=e0;" + selectQuery.parse("*" + after);
      } else {
        block += STORE;
      }
      return block + endBlock;
    },

    "^([^#,]+)#(<#ident>)(<#filter>)?$": function(match, before, id, filters) {
      var block = format(BY_ID, id);
      if (before === "*") {
        block += STORE;
      } else {
        block += MATCHER.parse(before + filters) + STORE + "break";
      }
      return block + closeBlock(block);
    },

    "^.*$": ""
  });

  var selectQuery = new CSSSelectorParser({
    "<#grammar>": function(match, selector, remainingSelectors) {
      if (!this.groups) this.groups = [];

      var group = SELECTOR.exec(" " + selector);

      if (!group) throwSelectorError();

      this.groups.push(group.slice(1));

      if (remainingSelectors) {
        return this.parse(remainingSelectors.replace(COMMA, ""));
      }

      var groups = this.groups,
          tagName = groups[0][TAG_NAME]; // first tag name

      for (var i = 1; group = groups[i]; i++) { // search tag names
        if (tagName !== group[TAG_NAME]) {
          tagName = "*"; // mixed tag names, so use "*"
          break;
        }
      }

      var matcher = "", store = STORE + "continue filtering;";

      for (var i = 0; group = groups[i]; i++) {
        MATCHER.index = 0;
        if (tagName !== "*") group[TAG_NAME] = "*"; // we are already filtering by tagName
        group = group.join("");
        if (group === " *") { // select all
          matcher = store;
          break;
        } else {
          group = MATCHER.parse(group);
          if (useContext) group += "if(e" + MATCHER.index + "==s){";
          matcher += group + store + closeBlock(group);
        }
      }

      // reduce to a single loop
      var isWild = tagName === "*";
      return (isWild ? "var n=c.all;" : format(BY_TAG_NAME, tagName)) +
        "filtering:while((e0=n[i++]))" +
        (isWild ? IF_ELEMENT.replace(TOKEN, "e0") : "{") +
          matcher +
        "}";
    },

    "^.*$": throwSelectorError
  });

  var REDUNDANT_NODETYPE_CHECKS = /\&\&(e\d+)\.nodeType===1(\)\{\s*if\(\1\.nodeName=)/g;

  selectQuery.create = function(selector) {
    if (!cache[selector]) {
      selector = normalize(selector);
      this.groups = null;
      MATCHER.index = 0;
      var block = this.parse(selector);
      this.groups = null;
      MATCHER.index = 0;
      if (selector.indexOf("#") !== -1) {
        var byId  = selectById.parse(selector);
        if (byId) {
          block =
            "if(t===1||t===11|!c.getElementById){" +
              block +
            "}else{" +
              byId +
            "}";
        }
      }
      // remove redundant nodeType==1 checks
      block = block.replace(REDUNDANT_NODETYPE_CHECKS, "$2");
      block = getConstants(selector) + decode(block);
      cache[selector] = new Function("return function(c,r,s){var i=0,k=0,e0;" + block + "return r}")();
    }
    return cache[selector];
  };

  return cssQuery;
})();

function throwSelectorError() {
  throw new SyntaxError("Invalid selector.");
};

// -----------------------------------------------------------------------
// initialisation
// -----------------------------------------------------------------------

IE7.loaded = true;

(function() {
  try {
    // http://javascript.nwbox.com/IEContentLoaded/
    if (!document.body) throw "continue";
    documentElement.doScroll("left");
  } catch (ex) {
    setTimeout(arguments.callee, 1);
    return;
  }
  // execute the inner text of the IE7 script
  try {
    eval(script.innerHTML);
  } catch (ex) {
    // ignore errors
  }
  if (typeof IE7_PNG_SUFFIX == "object") {
    PNG = IE7_PNG_SUFFIX;
  } else {
    PNG = new RegExp(rescape(window.IE7_PNG_SUFFIX || "-trans.png") + "(\\?.*)?$", "i");
  }

  // frequently used references
  body = document.body;
  viewport = MSIE5 ? body : documentElement;

  // classes
  body.className += " ie7_body";
  documentElement.className += " ie7_html";

  if (MSIE5) ie7Quirks();

  IE7.CSS.init();
  IE7.HTML.init();

  IE7.HTML.apply();
  IE7.CSS.apply();

  IE7.recalc();
})();

})(this, document);
