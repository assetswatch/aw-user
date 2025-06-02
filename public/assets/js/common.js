(function ($) {
  "use strict";

  // Cache jQuery Selector
  var $window = $(window),
    $header = $("header"),
    $navigation = $("#navbarSupportedContent"),
    $widgetusernavlinks = $("#collpase-widget-usernavlinks"),
    $dropdown = $(".dropdown-toggle");

  // Auto active class adding with navigation
  $window.on("load", function () {
    var current = location.pathname;
    var $path = current.substring(current.lastIndexOf("/") + 1);
    $("#navbarSupportedContent li a").each(function (e) {
      var $this = $(this);
      // if the current path is like this link, make it active
      if ($path == $this.attr("href")) {
        $this.parent("li").addClass("active");
      } else if ($path == "") {
        $(".navbar-nav li:first-child").addClass("active");
      }
    });
  });

  // Update Header Style + Scroll to Top
  function headerStyle() {
    if ($header.length) {
      var windowpos = $window.scrollTop();
      if (windowpos >= 200) {
        $header.addClass("fixed-top");
      } else {
        $header.removeClass("fixed-top");
      }
    }
  }

  // Put slider space for nav not in mini screen
  if (document.querySelector(".nav-on-top") !== null) {
    var get_height = jQuery(".nav-on-top").height();
    // jQuery(".nav-on-top").next().css("margin-top", get_height);
    if (get_height > 0 && $window.width() > 991) {
      jQuery(".nav-on-top").next().css("margin-top", get_height);
    }
    $window.on("resize", function () {
      $header.removeClass("fixed-top");
      var get_height = jQuery(".nav-on-top").height();
      if ($window.width() < 991) {
        jQuery(".nav-on-top").next().css("margin-top", "0");
      } else {
        jQuery(".nav-on-top").next().css("margin-top", get_height);
      }
    });
  }
  if (document.querySelector(".nav-on-banner") !== null) {
    var get_height = jQuery(".nav-on-banner").height();
    if (get_height > 0 && $window.width() > 991) {
      jQuery(".nav-on-banner").next().css("padding-top", get_height);
    }
    $window.on("resize", function () {
      $header.removeClass("fixed-top");
      var get_height = jQuery(".nav-on-banner").height();
      if ($window.width() < 991) {
        jQuery(".nav-on-banner").next().css("padding-top", "0");
      } else {
        jQuery(".nav-on-banner").next().css("padding-top", get_height);
      }
    });
  }
  window.addEventListener("show.bs.dropdown", function (e) {
    $(".dropdown-menu").slideDown(300);
  });

  window.addEventListener("hide.bs.dropdown", function (e) {
    $(".dropdown-menu").slideUp(300);
  });

  function hideCollpaseWidgets() {
    if ($(".collapse").hasClass("show")) {
      $("[id^=collpase-widget-]")
        .removeClass("collapsed")
        .attr("aria-expanded", "false");
      $("[id^=collpase-widget-]").removeClass("show").slideUp(300);
    }
  }

  function hidebsdropdownmenu() {
    // $(".dropdown").removeClass("visible");
    // $(".dropdown-menu").removeAttr("style");
  }

  // $(".navbar-toggler").on("click", function (e) {
  //   // hidebsdropdownmenu();
  //   // let $navigation = $("#collpase-widget-usernavbar");
  //   // if ($navigation.hasClass("hide")) {
  //   //   $navigation.addClass("collapsed").attr("aria-expanded", "true");
  //   //   $navigation.removeClass("hide").slideUp(300);
  //   // }
  //   // hideCollpaseWidgets();
  // });

  //$(".user-navbar .nav-link").on("click", function (e) {});

  // dropdown submenu on hover in desktopand dropdown sub menu on click in mobile
  $navigation,
    $widgetusernavlinks.each(function () {
      $("body").on("click", function (e) {
        hidebsdropdownmenu();
        //  hideCollpaseWidgets();
        // $dropdown.parent(".dropdown").removeClass("visible");
        // $dropdown.children(".dropdown-menu").slideUp(300).hide();
      });

      $window.on("resize", function () {
        // if ($window.width() > 991) {
        hidebsdropdownmenu();
        // }
      });
    });

  // Scroll trgeted ID specially for One Page nav target scrolling
  $('.one-page-nav a[href*="#"]')
    .not('.one-page-nav [href="#"]')
    .not('.one-page-nav [href="#0"]')
    .click(function (event) {
      if (
        location.pathname.replace(/^\//, "") ==
          this.pathname.replace(/^\//, "") &&
        location.hostname == this.hostname
      ) {
        var target = $(this.hash);
        target = target.length
          ? target
          : $("[name=" + this.hash.slice(1) + "]");
        if (target.length) {
          event.preventDefault();
          $("html, body").animate(
            {
              scrollTop: target.offset().top,
            },
            1000,
            function () {
              var $target = $(target);
              $target.focus();
              if ($target.is(":focus")) {
                // Checking if the target was focused
                return false;
              } else {
                $target.attr("tabindex", "-1"); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
              }
            }
          );
        }
      }
    });

  // Scroll top by clicking arrow up
  $window.scroll(function () {
    if ($(this).scrollTop() > 500) {
      $("#scroll").fadeIn();
    } else {
      $("#scroll").fadeOut();
    }
  });
  $("#scroll").click(function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      100
    );
    return !1;
  });

  // Fact Counter For Achivement Counting
  function factCounter() {
    if ($(".fact-counter").length) {
      $(".fact-counter .count.animated").each(function () {
        var $t = $(this),
          n = $t.find(".count-num").attr("data-stop"),
          r = parseInt($t.find(".count-num").attr("data-speed"), 10);

        if (!$t.hasClass("counted")) {
          $t.addClass("counted");
          $({
            countNum: $t.find(".count-text").text(),
          }).animate(
            {
              countNum: n,
            },
            {
              duration: r,
              easing: "linear",
              step: function () {
                $t.find(".count-num").text(Math.floor(this.countNum));
              },
              complete: function () {
                $t.find(".count-num").text(this.countNum);
              },
            }
          );
        }

        //set skill building height
        var size = $(this).children(".progress-bar").attr("aria-valuenow");
        $(this)
          .children(".progress-bar")
          .css("width", size + "%");
      });
    }
  }

  // Elements Animation
  if ($(".wow").length) {
    $window.on("load", function () {
      var wow = new WOW({
        boxClass: "wow", // animated element css class (default is wow)
        animateClass: "animated", // animation css class (default is animated)
        offset: 0, // distance to the element when triggering the animation (default is 0)
        mobile: true, // trigger animations on mobile devices (default is true)
        live: true, // act on asynchronously loaded content (default is true)
      });
      wow.init();
    });
  }

  // Start When document is Scrollig, do
  $(window).on("scroll", function () {
    factCounter();
    headerStyle();
  });
})(jQuery);
