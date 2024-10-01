/**
 * jquery.dependClass - Attach class based on first class in list of current element
 *
 * Written by
 * Egor Khmelev (hmelyoff@gmail.com)
 *
 * Licensed under the MIT (MIT-LICENSE.txt).
 *
 * @author Egor Khmelev
 * @version 0.1.0-BETA ($Id$)
 *
 **/

(function ($) {
  $.baseClass = function (obj) {
    obj = $(obj);
    return obj.get(0).className.match(/([^ ]+)/)[1];
  };

  $.fn.addDependClass = function (className, delimiter) {
    var options = {
      delimiter: delimiter ? delimiter : "-",
    };
    return this.each(function () {
      var baseClass = $.baseClass(this);
      if (baseClass)
        $(this).addClass(baseClass + options.delimiter + className);
    });
  };

  $.fn.removeDependClass = function (className, delimiter) {
    var options = {
      delimiter: delimiter ? delimiter : "-",
    };
    return this.each(function () {
      var baseClass = $.baseClass(this);
      if (baseClass)
        $(this).removeClass(baseClass + options.delimiter + className);
    });
  };

  $.fn.toggleDependClass = function (className, delimiter) {
    var options = {
      delimiter: delimiter ? delimiter : "-",
    };
    return this.each(function () {
      var baseClass = $.baseClass(this);
      if (baseClass)
        if ($(this).is("." + baseClass + options.delimiter + className))
          $(this).removeClass(baseClass + options.delimiter + className);
        else $(this).addClass(baseClass + options.delimiter + className);
    });
  };
})(jQuery);

// Simple JavaScript Templating (tmpl.js)
// John Resig - http://ejohn.org/ - MIT Licensed
(function () {
  var cache = {};

  this.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str)
      ? (cache[str] =
          cache[str] || tmpl(document.getElementById(str).innerHTML))
      : // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function(
          "obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<%")
              .join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t")
              .join("');")
              .split("%>")
              .join("p.push('")
              .split("\r")
              .join("\\'") +
            "');}return p.join('');"
        );

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  };
})();
