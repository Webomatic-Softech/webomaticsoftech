// Webomatic Softech - site behaviour

// The Cal.com link is set in build_pages.py (CAL_LINK) and arrives as data-cal-link on #cal-inline.
// Rescheduling and cancelling are handled by the links in Cal.com's confirmation email.
var CAL_THEME = { brandColor: "#0a0f1c" };

(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Highlight the section in view; hide the mobile booking bar near the booking section.
  var navLinks = document.querySelectorAll(".nav-links a[href*='#']:not(.btn)");
  var mobileCta = document.querySelector(".mobile-cta");
  var book = document.getElementById("book");
  if (mobileCta && document.querySelector(".book-page")) mobileCta.remove();
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id;
        navLinks.forEach(function (l) {
          if (l.hash === "#" + id) l.classList.toggle("is-active", e.isIntersecting);
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (sec) { spy.observe(sec); });
    if (mobileCta) {
      // Show the bar only between the hero and the booking section.
      var hero = document.querySelector("main > section");
      var heroOn = true, bookOn = false;
      var sync = function () { mobileCta.classList.toggle("is-hidden", heroOn || bookOn); };
      new IntersectionObserver(function (entries) { heroOn = entries[0].isIntersecting; sync(); }).observe(hero);
      if (book) new IntersectionObserver(function (entries) { bookOn = entries[0].isIntersecting; sync(); }).observe(book);
      sync();
    }
  }

  var target = document.getElementById("cal-inline");
  if (!target) return;
  var CAL_LINK = target.getAttribute("data-cal-link");

  var fallback = document.querySelector(".scheduler-fallback");
  var showFallback = function () {
    if (fallback && !target.querySelector("iframe")) fallback.hidden = false;
  };

  (function (C, A, L) {
    var p = function (a, ar) { a.q.push(ar); };
    var d = C.document;
    C.Cal = C.Cal || function () {
      var cal = C.Cal;
      var ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        var s = d.head.appendChild(d.createElement("script"));
        s.src = A;
        s.onerror = showFallback;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        var api = function () { p(api, arguments); };
        var namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else {
          p(cal, ar);
        }
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  window.Cal("init", "intro", { origin: "https://cal.com" });
  window.Cal.ns.intro("inline", {
    elementOrSelector: "#cal-inline",
    calLink: CAL_LINK,
    config: { layout: "month_view" }
  });
  window.Cal.ns.intro("ui", {
    theme: "light",
    cssVarsPerTheme: { light: { "cal-brand": CAL_THEME.brandColor } },
    hideEventTypeDetails: false,
    layout: "month_view"
  });

  setTimeout(showFallback, 8000);
})();
