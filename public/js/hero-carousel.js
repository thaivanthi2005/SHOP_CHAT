/**
 * Hero 3D product carousel
 * File: /public/js/hero-carousel.js
 */
(function () {
  "use strict";

  var AUTO_MS = 3200;
  var ANGLE_STEP = 38;
  var SWIPE_MIN = 40;

  function getRadius() {
    var width = window.innerWidth;
    if (width < 640) return 150;
    if (width < 980) return 190;
    return 230;
  }

  function wrapIndex(index, total) {
    return ((index % total) + total) % total;
  }

  function HeroCarousel(root) {
    this.root = root;
    this.items = Array.prototype.slice.call(root.querySelectorAll("[data-hero-item]"));
    this.dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    this.prevBtn = root.querySelector("[data-hero-prev]");
    this.nextBtn = root.querySelector("[data-hero-next]");
    this.total = this.items.length;
    this.active = 0;
    this.timer = null;
    this.paused = false;
    this.touchStartX = 0;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!this.total) return;

    this.bindEvents();
    this.render(false);
    this.play();
  }

  HeroCarousel.prototype.render = function (animate) {
    var self = this;
    var radius = getRadius();
    var shouldAnimate = animate !== false && !this.reduceMotion;

    this.active = wrapIndex(this.active, this.total);

    this.items.forEach(function (item, index) {
      var offset = index - self.active;

      if (offset > self.total / 2) offset -= self.total;
      if (offset < -self.total / 2) offset += self.total;

      var abs = Math.abs(offset);
      var angle = offset * ANGLE_STEP;
      var radian = (angle * Math.PI) / 180;
      var x = Math.sin(radian) * radius;
      var z = Math.cos(radian) * radius - radius;
      var scale = abs === 0 ? 1 : Math.max(0.55, 1 - abs * 0.16);
      var opacity = abs === 0 ? 1 : Math.max(0.28, 1 - abs * 0.28);
      var blur = abs > 1 ? Math.min(2.5, abs) : 0;

      item.classList.toggle("is-active", abs === 0);
      item.style.zIndex = String(100 - abs);
      item.style.opacity = String(opacity);
      item.style.filter = blur ? "blur(" + blur + "px)" : "none";
      item.style.pointerEvents = abs === 0 ? "auto" : "none";
      item.style.transition = shouldAnimate
        ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease, filter 450ms ease"
        : "none";
      item.style.transform =
        "translate(-50%, -50%) translateX(" +
        x +
        "px) translateZ(" +
        z +
        "px) rotateY(" +
        -angle +
        "deg) scale(" +
        scale +
        ")";
    });

    this.dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === self.active);
    });
  };

  HeroCarousel.prototype.goTo = function (index) {
    this.active = index;
    this.render(true);
  };

  HeroCarousel.prototype.next = function () {
    this.goTo(this.active + 1);
  };

  HeroCarousel.prototype.prev = function () {
    this.goTo(this.active - 1);
  };

  HeroCarousel.prototype.stop = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  HeroCarousel.prototype.play = function () {
    var self = this;

    this.stop();
    if (this.reduceMotion || this.total < 2) return;

    this.timer = setInterval(function () {
      if (!self.paused) self.next();
    }, AUTO_MS);
  };

  HeroCarousel.prototype.bindEvents = function () {
    var self = this;

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", function () {
        self.next();
        self.play();
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", function () {
        self.prev();
        self.play();
      });
    }

    this.dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        self.goTo(Number(dot.getAttribute("data-hero-dot")));
        self.play();
      });
    });

    this.root.addEventListener("mouseenter", function () {
      self.paused = true;
    });

    this.root.addEventListener("mouseleave", function () {
      self.paused = false;
    });

    this.root.addEventListener("focusin", function () {
      self.paused = true;
    });

    this.root.addEventListener("focusout", function () {
      self.paused = false;
    });

    this.root.addEventListener(
      "touchstart",
      function (event) {
        self.touchStartX = event.changedTouches[0].screenX;
        self.paused = true;
      },
      { passive: true }
    );

    this.root.addEventListener(
      "touchend",
      function (event) {
        var delta = event.changedTouches[0].screenX - self.touchStartX;

        if (Math.abs(delta) > SWIPE_MIN) {
          if (delta < 0) self.next();
          else self.prev();
        }

        self.paused = false;
        self.play();
      },
      { passive: true }
    );

    window.addEventListener("resize", function () {
      self.render(false);
    });
  };

  function initHeroCarousel() {
    var roots = document.querySelectorAll("[data-hero-carousel]");
    Array.prototype.forEach.call(roots, function (root) {
      new HeroCarousel(root);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroCarousel);
  } else {
    initHeroCarousel();
  }
})();
