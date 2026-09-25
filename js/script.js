/* ==========================================================================
   [YOUR NAME] — Computer Operator & IT Specialist
   Portfolio scripts (vanilla JavaScript, no dependencies)
   --------------------------------------------------------------------------
   Modules in this file:
   1.  Helpers
   2.  Theme toggle (localStorage + system preference)
   3.  Mobile navigation
   4.  Smooth scrolling with sticky-header offset
   5.  Sticky header shadow + active nav link (scrollspy)
   6.  Back-to-top button, reading ring, and top progress line
   7.  Scroll reveal (IntersectionObserver, respects reduced motion)
   8.  Skill level meters (data-level -> CSS variable)
   9.  Project filter (animated, respects reduced motion)
   9b. Generic disclosure used by the skills and services sections
   9c. Project details modal (focus move + trap + restore)
   10. Contact form validation
   11. Footer year
   --------------------------------------------------------------------------
   Everything degrades gracefully: if JavaScript is blocked, the page content
   is still fully readable, all links work, and no section is left hidden.
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     1. HELPERS
     ====================================================================== */

  var root = document.documentElement;

  /** Query a single element, returning null instead of throwing. */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  /** Query all elements as a real array. */
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /** True when the visitor has asked the OS to reduce motion. */
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Reject dangerous schemes such as javascript: and data: before assigning URLs. */
  function sanitizeUrl(value, fallback) {
    var candidate = (value || "").trim();
    var defaultFallback = fallback || "#";

    if (!candidate) {
      return defaultFallback;
    }

    if (candidate.charAt(0) === "#") {
      return candidate;
    }

    try {
      var parsed = new URL(candidate, window.location.href);
      var protocol = parsed.protocol.toLowerCase();

      if (protocol === "javascript:" || protocol === "data:" || protocol === "vbscript:") {
        return defaultFallback;
      }

      // Relative links and standard web/mail/tel links are allowed; anything else is rejected.
      if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(candidate) || /^(https?:|mailto:|tel:)/i.test(candidate)) {
        return candidate;
      }
    } catch (error) {
      return defaultFallback;
    }

    return defaultFallback;
  }

  /** Only accept same-origin or relative form endpoints; block external exfiltration targets. */
  function sanitizeEndpoint(value) {
    var candidate = (value || "").trim();

    if (!candidate) {
      return "";
    }

    if (candidate.charAt(0) === "/") {
      return candidate;
    }

    try {
      var parsed = new URL(candidate, window.location.href);
      if (parsed.origin === window.location.origin) {
        return parsed.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  /** Safe localStorage access (private mode / disabled storage must not break the page). */
  var storage = {
    get: function (key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* Storage unavailable: theme simply will not persist. */
      }
    }
  };

  /* ========================================================================
     2. THEME TOGGLE
     ====================================================================== */

  var THEME_KEY = "portfolio-theme";
  var themeToggle = $("#theme-toggle");

  function applyTheme(theme) {
    var isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function initTheme() {
    var stored = storage.get(THEME_KEY);
    var systemPrefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(stored === "dark" || stored === "light" ? stored : systemPrefersDark ? "dark" : "light");

    if (!themeToggle) {
      return;
    }

    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storage.set(THEME_KEY, next);
    });

    /* Follow live OS changes only when the visitor has not chosen explicitly. */
    if (window.matchMedia) {
      var query = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystemChange = function (event) {
        if (storage.get(THEME_KEY)) {
          return;
        }
        applyTheme(event.matches ? "dark" : "light");
      };

      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", onSystemChange);
      } else if (typeof query.addListener === "function") {
        query.addListener(onSystemChange);
      }
    }
  }

  /* ========================================================================
     3. MOBILE NAVIGATION
     ====================================================================== */

  var navToggle = $("#nav-toggle");
  var nav = $("#primary-nav");

  function setMenuOpen(open) {
    if (!navToggle || !nav) {
      return;
    }

    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  function initMobileNav() {
    if (!navToggle || !nav) {
      return;
    }

    navToggle.addEventListener("click", function () {
      setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    /* Close after choosing a destination (page uses in-page anchors). */
    $$(".nav-link", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    /* Escape closes the menu and returns focus to the toggle. */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        navToggle.focus();
      }
    });

    /* Clicking outside the panel closes it (mobile layout only). */
    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") {
        return;
      }
      if (nav.contains(event.target) || navToggle.contains(event.target)) {
        return;
      }
      setMenuOpen(false);
    });

    /* Reset state when resizing back to the desktop layout. */
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (window.innerWidth >= 1024) {
          setMenuOpen(false);
        }
      }, 150);
    });
  }

  /* ========================================================================
     4. SMOOTH SCROLLING WITH HEADER OFFSET
     ====================================================================== */

  function headerHeight() {
    var header = $("#site-header");
    return header ? header.getBoundingClientRect().height : 0;
  }

  function scrollToTarget(target) {
    if (!target) {
      return;
    }

    var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  }

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");

        if (!href || href === "#") {
          return;
        }

        var target = document.getElementById(href.slice(1));

        if (!target) {
          /* Anchor without a matching section (e.g. #privacy placeholder): leave normal behaviour. */
          return;
        }

        event.preventDefault();
        scrollToTarget(target);

        /* Move keyboard focus to the destination for screen-reader users. */
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });

        /* Keep the URL shareable without adding history noise. */
        if (window.history && typeof window.history.replaceState === "function") {
          window.history.replaceState(null, "", href);
        }
      });
    });
  }

  /* ========================================================================
     5. STICKY HEADER SHADOW + ACTIVE NAV LINK (SCROLLSPY)
     ====================================================================== */

  var navLinks = $$(".nav-link");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.getElementById(id.slice(1)) : null;
    })
    .filter(function (section) {
      return section !== null;
    });

  var scrollTicking = false;

  function onScrollFrame() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var header = $("#site-header");

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 8);
    }

    /* --- Active section --- */
    var probe = scrollY + headerHeight() + 90;
    var currentId = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= probe) {
        currentId = section.id;
      }
    });

    /* At the very bottom of the page, highlight the last section. */
    if (window.innerHeight + scrollY >= document.body.offsetHeight - 4 && sections.length) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      var isCurrent = currentId !== null && link.getAttribute("href") === "#" + currentId;
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    /* --- Back-to-top visibility + progress ring --- */
    var backToTopWrap = $(".back-to-top-wrap");
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;

    if (backToTopWrap) {
      backToTopWrap.classList.toggle("is-visible", scrollY > 500);
    }

    var ring = $(".progress-value");
    if (ring) {
      var circumference = 119.4; /* 2 * PI * 19 */
      ring.style.strokeDashoffset = String(circumference * (1 - progress));
    }

    /* --- Thin top progress line (transform only, no layout work) --- */
    var bar = $("#scroll-progress");
    if (bar) {
      var fill = bar.firstElementChild;
      bar.classList.toggle("is-active", progress > 0.01);
      if (fill) {
        /* Touching the transform directly is cheaper than toggling a class. */
        fill.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      }
    }

    scrollTicking = false;
  }

  function initScrollWatcher() {
    var requestFrame =
      window.requestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 16);
      };

    window.addEventListener(
      "scroll",
      function () {
        if (scrollTicking) {
          return;
        }
        scrollTicking = true;
        requestFrame(onScrollFrame);
      },
      { passive: true }
    );

    window.addEventListener("resize", onScrollFrame);
    onScrollFrame();
  }

  /* ========================================================================
     6. BACK-TO-TOP BUTTON
     ====================================================================== */

  function initBackToTop() {
    var button = $("#back-to-top");

    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });

      /* Return focus to the top of the document for keyboard users. */
      var brand = $(".brand");
      if (brand) {
        brand.focus({ preventScroll: true });
      }
    });
  }

  /* ========================================================================
     7. SCROLL REVEAL
     ====================================================================== */

  function initReveal() {
    var targets = $$(
      ".hero-copy, .hero-media, .section-head, .card, .highlight, .stat-card, .timeline-item, .level, .contact-list, .contact-form"
    );

    if (!targets.length) {
      return;
    }

    /* No animation support, or reduced motion requested: show everything immediately. */
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      return;
    }

    targets.forEach(function (element, index) {
      element.classList.add("js-reveal");
      /* Small stagger within each group, capped so nothing waits too long. */
      element.style.transitionDelay = Math.min(index % 6, 5) * 45 + "ms";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    targets.forEach(function (element) {
      observer.observe(element);
    });

    /* Safety net: if anything is still hidden after load + 3s, reveal it. */
    window.setTimeout(function () {
      targets.forEach(function (element) {
        element.classList.add("is-visible");
      });
    }, 3000);
  }

  /* ========================================================================
     8. SKILL LEVEL METERS
     ====================================================================== */

  function initLevels() {
    $$(".level-meter").forEach(function (meter) {
      var raw = parseInt(meter.getAttribute("data-level"), 10);
      var level = isNaN(raw) ? 0 : Math.min(Math.max(raw, 0), 5);
      meter.style.setProperty("--level-fill", String(level));

      /* Keep the accessible name in sync with the visible label. */
      var item = meter.closest(".level");
      var label = item ? $(".level-label", item) : null;
      if (label && label.textContent.trim()) {
        meter.setAttribute("role", "img");
        meter.setAttribute("aria-label", "Level: " + label.textContent.trim());
      }
    });
  }

  /* ========================================================================
     9. PROJECT FILTER
     ====================================================================== */

  function initProjectFilter() {
    var chips = $$(".chip[data-filter]");
    var cards = $$(".project-card");
    var grid = $("#projects-grid");
    var status = $("#filter-status");

    if (!chips.length || !cards.length) {
      return;
    }

    /* Reduced motion: filter instantly, with no fade-out stage. */
    var canAnimate = !prefersReducedMotion();
    var pendingTimers = [];

    function clearPending() {
      pendingTimers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
      pendingTimers = [];
    }

    function applyFilter(filter) {
      clearPending();

      /* Reconcile from a clean state every time. A previous run that was
         interrupted mid-fade can leave `is-hiding` on a card that was never
         actually hidden; without this reset that card would stay invisible and
         unclickable forever. */
      cards.forEach(function (card) {
        card.classList.remove("is-hiding");
      });

      var shown = 0;
      var toHide = [];
      var toShow = [];

      cards.forEach(function (card) {
        var matches = filter === "all" || card.getAttribute("data-category") === filter;

        if (matches) {
          shown += 1;
          toShow.push(card);
        } else if (!card.hidden) {
          toHide.push(card);
        }
      });

      /* 1. Fade the outgoing cards before removing them from the grid, so the
            layout does not reflow in the middle of the transition. */
      toHide.forEach(function (card) {
        card.classList.add("is-hiding");
      });

      var finish = function () {
        toHide.forEach(function (card) {
          card.classList.remove("is-hiding");
          card.hidden = true;
        });

        toShow.forEach(function (card) {
          card.hidden = false;
          /* Re-trigger the entry animation by restarting the CSS animation. */
          card.style.animation = "none";
          /* Reading offsetWidth forces a reflow so the animation restarts. */
          void card.offsetWidth;
          card.style.animation = "";
        });

        chips.forEach(function (chip) {
          chip.setAttribute("aria-pressed", String(chip.getAttribute("data-filter") === filter));
        });

        if (status) {
          status.textContent =
            shown === cards.length
              ? "Showing all " + cards.length + " projects."
              : "Showing " + shown + " of " + cards.length + " projects.";
        }
      };

      if (canAnimate && toHide.length) {
        pendingTimers.push(window.setTimeout(finish, 190));
      } else {
        finish();
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        applyFilter(chip.getAttribute("data-filter") || "all");
      });
    });

    if (status) {
      status.textContent = "Showing all " + cards.length + " projects.";
    }

    /* Guard against malformed markup: never leave the grid empty. */
    if (grid && !grid.querySelector(".project-card:not([hidden])")) {
      applyFilter("all");
    }
  }

  /* ========================================================================
     10. CONTACT FORM VALIDATION
     ====================================================================== */

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var MIN_MESSAGE = 20;
  var EMAILJS_PUBLIC_KEY = "DAR4iWUwTAr-FKjjZ";

  if (window.emailjs && typeof window.emailjs.init === "function") {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  function initContactForm() {
    var form = $("#contact-form");

    if (!form) {
      return;
    }

    var status = $("#form-status");
    var fields = {
      name: {
        input: $("#cf-name"),
        error: $("#cf-name-error"),
        validate: function (value) {
          if (!value) {
            return "Please enter your name.";
          }
          if (value.length < 2) {
            return "Please enter at least 2 characters.";
          }
          return "";
        }
      },
      email: {
        input: $("#cf-email"),
        error: $("#cf-email-error"),
        validate: function (value) {
          if (!value) {
            return "Please enter your email address.";
          }
          if (!EMAIL_PATTERN.test(value)) {
            return "Please enter a valid email address, for example name@example.com.";
          }
          return "";
        }
      },
      subject: {
        input: $("#cf-subject"),
        error: $("#cf-subject-error"),
        validate: function (value) {
          if (!value) {
            return "Please add a short subject.";
          }
          if (value.length < 3) {
            return "Please use at least 3 characters.";
          }
          return "";
        }
      },
      message: {
        input: $("#cf-message"),
        error: $("#cf-message-error"),
        validate: function (value) {
          if (!value) {
            return "Please write your message.";
          }
          if (value.length < MIN_MESSAGE) {
            return "Please write at least " + MIN_MESSAGE + " characters (" + value.length + " so far).";
          }
          return "";
        }
      }
    };

    function showError(field, message) {
      if (!field.input) {
        return;
      }

      /* The wrapper carries the visible field state (tick / error styling) so
         CSS can style the whole row without :has() support assumptions. */
      var wrapper = field.input.closest(".form-field");

      if (message) {
        field.input.setAttribute("aria-invalid", "true");
        if (wrapper) {
          wrapper.setAttribute("data-state", "invalid");
        }
        if (field.error) {
          field.error.textContent = message;
          field.error.hidden = false;
        }
      } else {
        field.input.removeAttribute("aria-invalid");

        /* Distinguish "empty" from "valid": the tick only appears once the
           visitor has actually typed something that passes. */
        var hasValue = field.input.value.trim() !== "";
        if (wrapper) {
          wrapper.setAttribute("data-state", hasValue ? "valid" : "empty");
        }

        if (field.error) {
          field.error.textContent = "";
          field.error.hidden = true;
        }
      }
    }

    function validateField(field) {
      var value = field.input ? field.input.value.trim() : "";
      var message = field.validate(value);
      showError(field, message);
      return message === "";
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];

      if (!field.input) {
        return;
      }

      /* Validate on blur, then live-update only while the field is invalid. */
      field.input.addEventListener("blur", function () {
        validateField(field);
      });

      field.input.addEventListener("input", function () {
        if (field.input.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      var firstInvalid = null;

      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        if (field.input && !validateField(field) && !firstInvalid) {
          firstInvalid = field.input;
        }
      });

      if (firstInvalid) {
        event.preventDefault();
        if (status) {
          status.textContent = "Please correct the highlighted fields and try again.";
          status.className = "form-status is-error";
        }
        firstInvalid.focus();
        return;
      }

      /* Simple honeypot: real visitors never see or fill this field. */
      var honeypot = $("#cf-company");
      if (honeypot && honeypot.value.trim() !== "") {
        event.preventDefault();
        if (status) {
          status.textContent = "Submission blocked. Please email me directly instead.";
          status.className = "form-status is-error";
        }
        return;
      }

      var serviceId = (form.getAttribute("data-service-id") || "").trim();
      var templateId = (form.getAttribute("data-template-id") || "").trim();
      var endpoint = sanitizeEndpoint(form.getAttribute("data-endpoint") || "");

      if (serviceId && templateId && window.emailjs && typeof window.emailjs.sendForm === "function") {
        event.preventDefault();

        if (status) {
          status.textContent = "Sending your message…";
          status.className = "form-status";
        }

        var templateParams = {
          name: fields.name.input ? fields.name.input.value.trim() : "",
          email: fields.email.input ? fields.email.input.value.trim() : "",
          subject: fields.subject.input ? fields.subject.input.value.trim() : "",
          message: fields.message.input ? fields.message.input.value.trim() : "",
          time: new Date().toLocaleString()
        };

        window.emailjs.send(serviceId, templateId, templateParams, EMAILJS_PUBLIC_KEY)
          .then(function () {
            form.reset();
            Object.keys(fields).forEach(function (key) {
              showError(fields[key], "");
            });
            if (status) {
              status.textContent = "Thank you. Your message has been sent.";
              status.className = "form-status is-success";
            }
          })
          .catch(function () {
            if (status) {
              status.innerHTML =
                'Sorry, the message could not be sent. Please email <a href="mailto:arafatislam2028@gmail.com">arafatislam2028@gmail.com</a> directly.';
              status.className = "form-status is-error";
            }
          });
        return;
      }

      if (!endpoint) {
        /*
         * No backend is configured, which is the default for this template.
         * We keep the page honest: nothing is silently dropped, and the visitor
         * is offered a real way to make contact. Add a data-endpoint value (or a
         * form action) to enable real delivery — see README.md.
         */
        event.preventDefault();

        var payload = {
          name: fields.name.input ? fields.name.input.value.trim() : "",
          email: fields.email.input ? fields.email.input.value.trim() : "",
          subject: fields.subject.input ? fields.subject.input.value.trim() : "",
          message: fields.message.input ? fields.message.input.value.trim() : ""
        };

        var mailto =
          "mailto:arafatislam2028@gmail.com" +
          "?subject=" +
          encodeURIComponent("[Portfolio] " + payload.subject) +
          "&body=" +
          encodeURIComponent(
            "Name: " +
              payload.name +
              "\nEmail: " +
              payload.email +
              "\n\n" +
              payload.message
          );

        var fallbackLink = $("#form-mailto");
        if (fallbackLink) {
          fallbackLink.setAttribute("href", mailto);
        }

        if (status) {
          status.innerHTML =
            'Form validation passed, but this site has no backend yet, so nothing was sent. ' +
            '<a id="form-mailto" href="' +
            mailto +
            '">Open this message in your email client</a>, or write to <a href="mailto:arafatislam2028@gmail.com">arafatislam2028@gmail.com</a>.';
          status.className = "form-status is-error";
        }
        return;
      }

      /* Endpoint configured: send without a page reload. */
      event.preventDefault();

      if (status) {
        status.textContent = "Sending your message…";
        status.className = "form-status";
      }

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
          }
          form.reset();
          Object.keys(fields).forEach(function (key) {
            showError(fields[key], "");
          });
          if (status) {
            status.textContent = "Thank you. Your message has been sent.";
            status.className = "form-status is-success";
          }
        })
        .catch(function () {
          if (status) {
            status.innerHTML =
              'Sorry, the message could not be sent. Please email <a href="mailto:[YOUR EMAIL]">[YOUR EMAIL]</a> directly.';
            status.className = "form-status is-error";
          }
        });
    });
  }

  /* ========================================================================
     9b. GENERIC DISCLOSURE (skills, services)
     ------------------------------------------------------------------------
     One implementation for both. Each trigger owns an aria-expanded state and
     points at its panel with aria-controls. The panel uses a grid-template-rows
     0fr -> 1fr transition, so it animates to its natural height without
     hard-coded max-height values.

     `hidden` cannot be used for the closed state (it would defeat the
     transition), so the panel is hidden from assistive tech with aria-hidden
     and kept out of the tab order via inert where supported. Both skills and
     services are outside the scope of the scrollspy and links, so nothing else
     depends on their contents being reachable while collapsed.
     ====================================================================== */

  function initDisclosure(options) {
    var triggers = $$(options.triggerSelector);

    if (!triggers.length) {
      return;
    }

    function setState(trigger, open) {
      var panelId = trigger.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      var item = trigger.parentNode;

      trigger.setAttribute("aria-expanded", String(open));

      if (item && item.classList) {
        item.classList.toggle("is-open", open);
      }

      if (!panel) {
        return;
      }

      /* Reflect the state for assistive tech without using display:none. */
      panel.setAttribute("aria-hidden", String(!open));

      if ("inert" in panel) {
        panel.inert = !open;
      }
    }

    triggers.forEach(function (trigger) {
      /* Start closed, matching the markup. */
      setState(trigger, false);

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        /* Accordion behaviour: open one, close the others in the same group. */
        if (options.exclusive && !isOpen) {
          triggers.forEach(function (other) {
            if (other !== trigger && other.getAttribute("aria-expanded") === "true") {
              setState(other, false);
            }
          });
        }

        setState(trigger, !isOpen);
      });

      /* Optional: also open on hover for pointer users (desktop only). */
      if (options.openOnHover && item_hoverSupports()) {
        var item = trigger.parentNode;
        if (item) {
          item.addEventListener("mouseenter", function () {
            if (trigger.getAttribute("aria-expanded") !== "true") {
              setState(trigger, true);
            }
          });
          item.addEventListener("mouseleave", function () {
            /* Never close a panel the user explicitly opened by click. */
            if (trigger.getAttribute("aria-expanded") === "true" && !trigger.dataset.pinned) {
              setState(trigger, false);
            }
          });
        }
      }
    });

    /* Clicking pins a panel open so hover-out does not close it. */
    if (options.openOnHover) {
      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          trigger.dataset.pinned = trigger.getAttribute("aria-expanded") === "true" ? "1" : "";
        });
      });
    }
  }

  /** True when the device has a real pointer (so hover is meaningful). */
  function item_hoverSupports() {
    return window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function initSkillLevels() {
    initDisclosure({ triggerSelector: ".level-trigger", exclusive: true });
  }

  function initServiceDetails() {
    initDisclosure({ triggerSelector: ".service-toggle", exclusive: false });
  }

  /* ========================================================================
     9c. PROJECT MODAL
     ------------------------------------------------------------------------
     Details live in a hidden .project-data block inside each card, so the modal
     needs no duplicated markup and stays in sync with the card it describes.
     Focus is moved into the dialog, trapped while open, and returned to the
     trigger on close.
     ====================================================================== */

  function initProjectModal() {
    var modal = $("#project-modal");
    var grid = $("#projects-grid");

    if (!modal || !grid) {
      return;
    }

    var panel = $(".modal-panel", modal);
    var closeBtn = $("#modal-close", modal);
    var lastFocused = null;

    function open(card, trigger) {
      var data = $(".project-data", card);
      if (!data) {
        return;
      }

      function set(role, targetId) {
        var source = $('[data-role="' + role + '"]', data);
        var target = document.getElementById(targetId);
        if (source && target) {
          target.textContent = source.textContent.trim();
        }
      }

      set("title", "modal-title");
      set("category", "modal-category");
      set("desc", "modal-desc");
      set("problem", "modal-problem");
      set("solution", "modal-solution");
      set("result", "modal-result");

      /* Technologies are copied from the card's own tag list. */
      var tagSource = $('[data-role="tags"]', card);
      var tagTarget = $("#modal-tags", modal);
      if (tagTarget) {
        tagTarget.innerHTML = "";
        if (tagSource) {
          $$("li", tagSource).forEach(function (tag) {
            var li = document.createElement("li");
            li.textContent = tag.textContent.trim();
            tagTarget.appendChild(li);
          });
        }
      }

      /* Links are copied including their href, so placeholders stay obvious. */
      [
        ["project-link", "modal-link"],
        ["github-link", "modal-github"]
      ].forEach(function (pair) {
        var source = $('[data-role="' + pair[0] + '"]', data);
        var target = document.getElementById(pair[1]);
        if (source && target) {
          var candidate = source.getAttribute("href") || "#";
          target.setAttribute("href", sanitizeUrl(candidate, "#"));
        }
      });

      lastFocused = trigger || document.activeElement;
      modal.hidden = false;
      document.body.classList.add("modal-open");

      if (panel) {
        panel.scrollTop = 0;
      }

      /* Focus the close button: predictable, and never lands on a link. */
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function close() {
      if (modal.hidden) {
        return;
      }

      modal.hidden = true;
      document.body.classList.remove("modal-open");

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    /* Event delegation: works for every card, including after filtering. */
    grid.addEventListener("click", function (event) {
      var trigger = event.target.closest ? event.target.closest(".project-open") : null;

      if (!trigger) {
        return;
      }

      var card = trigger.closest(".project-card");
      if (card) {
        open(card, trigger);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }

    /* Backdrop click closes; clicks inside the panel do not. */
    $$("[data-modal-close]", modal).forEach(function (element) {
      element.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      /* Simple focus trap: keep Tab inside the dialog while it is open. */
      if (event.key === "Tab" && panel) {
        var focusable = $$(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
          panel
        ).filter(function (element) {
          return element.offsetParent !== null;
        });

        if (!focusable.length) {
          return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ========================================================================
     11. FOOTER YEAR
     ====================================================================== */

  function initYear() {
    var year = $("#year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  /* ========================================================================
     BOOTSTRAP
     ====================================================================== */

  function init() {
    initTheme();
    initMobileNav();
    initSmoothScroll();
    initScrollWatcher();
    initBackToTop();
    initLevels();
    initSkillLevels();
    initServiceDetails();
    initReveal();
    initProjectFilter();
    initProjectModal();
    initContactForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();