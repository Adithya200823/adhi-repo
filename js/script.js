/* Adithya T portfolio: vanilla JavaScript, no libraries. */

(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Mobile navigation ---------- */
  var menuToggle = document.querySelector(".menu-toggle");
  var siteNav = document.getElementById("site-nav");

  function setMenu(open) {
    header.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", function () {
    setMenu(!header.classList.contains("is-open"));
  });

  // Close the menu after choosing a link, or when pressing Escape.
  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  /* ---------- Current section indicator ---------- */
  var navLinks = siteNav.querySelectorAll('a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute("href"));
    if (target) {
      sections.push({ link: link, section: target });
    }
  });

  function updateCurrentSection() {
    var offset = header.offsetHeight + 80;
    var current = null;
    sections.forEach(function (item) {
      if (item.section.getBoundingClientRect().top - offset <= 0) {
        current = item;
      }
    });
    sections.forEach(function (item) {
      if (item === current) {
        item.link.setAttribute("aria-current", "true");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("back-to-top");

  function updateBackToTop() {
    backToTop.hidden = window.scrollY < 500;
  }

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("home").focus({ preventScroll: true });
  });

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateCurrentSection();
        updateBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  updateCurrentSection();
  updateBackToTop();

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.querySelector(".theme-toggle");
  var themeLabel = themeToggle.querySelector(".theme-label");
  var THEME_KEY = "portfolio-theme";

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function isDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return systemPrefersDark();
  }

  function applyTheme(dark) {
    root.setAttribute("data-theme", dark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeLabel.textContent = dark ? "Light mode" : "Dark mode";
  }

  // Use a saved choice if there is one. localStorage can be blocked, so guard it.
  try {
    var saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      root.setAttribute("data-theme", saved);
    }
  } catch (err) {
    /* Storage not available: the theme still works for this visit. */
  }

  applyTheme(isDark());

  themeToggle.addEventListener("click", function () {
    var nextDark = !isDark();
    applyTheme(nextDark);
    try {
      window.localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
    } catch (err) {
      /* Ignore: the choice applies until the page is closed. */
    }
  });

  /* ---------- Project filters ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projects = document.querySelectorAll(".project");
  var emptyMessage = document.getElementById("empty-filter");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var visibleCount = 0;

      filterButtons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      projects.forEach(function (project) {
        var show = filter === "all" || project.getAttribute("data-category") === filter;
        project.hidden = !show;
        if (show) visibleCount++;
      });

      emptyMessage.hidden = visibleCount > 0;
    });
  });

  /* ---------- Expand and collapse project details ---------- */
  document.querySelectorAll(".details-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var panelId = toggle.getAttribute("aria-controls");
      var panel = document.getElementById(panelId);
      var expanded = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.textContent = expanded ? "Show details" : "Hide details";
      panel.hidden = expanded;
    });
  });

  /* ---------- Visitor greeting ---------- */
  var visitorSelect = document.getElementById("visitor-type");
  var visitorMessage = document.getElementById("visitor-message");

  var greetings = {
    recruiter:
      "Welcome. My resume and project details are below. Thank you for taking the time to look.",
    mentor:
      "Welcome. I would value any feedback on my projects, especially the layout and the code structure.",
    peer:
      "Welcome, fellow student. Take a look at my projects and courses, and tell me what you would add."
  };

  visitorSelect.addEventListener("change", function () {
    visitorMessage.textContent = greetings[visitorSelect.value] || "";
  });

  /* ---------- Contact form: validate, then prepare an email ----------
     The page cannot send email by itself. After the fields pass, the visitor
     gets a button that opens their own email app with the message filled in. */
  var form = document.getElementById("contact-form");
  var OWNER_EMAIL = "adithya.t2308@gmail.com";
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("name-error"),
      validate: function (value) {
        if (value.trim() === "") return "Please enter your name.";
        if (value.trim().length < 2) return "Your name should be at least 2 characters.";
        return "";
      }
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("email-error"),
      validate: function (value) {
        if (value.trim() === "") return "Please enter your email address.";
        if (!EMAIL_PATTERN.test(value.trim())) return "Enter an email address like name@example.com.";
        return "";
      }
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("message-error"),
      validate: function (value) {
        if (value.trim() === "") return "Please write a message.";
        if (value.trim().length < 10) return "Your message should be at least 10 characters.";
        return "";
      }
    }
  };

  function checkField(key) {
    var field = fields[key];
    var message = field.validate(field.input.value);
    var wrapper = field.input.closest(".field");
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
    wrapper.classList.toggle("has-error", Boolean(message));
    return !message;
  }

  // Check each field once the visitor leaves it, so errors appear where they are made.
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener("blur", function () {
      if (fields[key].input.value !== "") checkField(key);
    });
  });

  var statusBox = document.getElementById("form-status");
  var statusText = document.getElementById("form-status-text");
  var mailtoLink = document.getElementById("mailto-link");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var allValid = true;
    var firstInvalid = null;
    Object.keys(fields).forEach(function (key) {
      if (!checkField(key)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = fields[key].input;
      }
    });

    if (!allValid) {
      statusBox.hidden = true;
      firstInvalid.focus();
      return;
    }

    var name = fields.name.input.value.trim();
    var email = fields.email.input.value.trim();
    var message = fields.message.input.value.trim();

    var subject = "Portfolio message from " + name;
    var body = message + "\n\nFrom: " + name + "\nReply to: " + email;
    mailtoLink.href =
      "mailto:" + OWNER_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // Say the message is ready, not sent: the visitor still has to press send in their email app.
    statusText.textContent =
      "Thanks, " + name + ". Your message is ready. Open your email app to send it to me.";
    statusBox.hidden = false;
    mailtoLink.focus();
  });
})();

/* =========================================================================
   Interactive enhancements (added on top of the original script)
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* ---------- Scroll progress bar and header shadow ---------- */
  var progress = document.getElementById("scroll-progress");
  var siteHeader = document.querySelector(".site-header");

  function updateScrollUI() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = "scaleX(" + ratio + ")";
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  var progressTicking = false;
  window.addEventListener("scroll", function () {
    if (!progressTicking) {
      window.requestAnimationFrame(function () {
        updateScrollUI();
        progressTicking = false;
      });
      progressTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    ".hero-text, .now, .section-title, .prose p, .skill-group, .project, " +
    ".course-grid .skill-group, .contact-intro, .contact-list li, .contact-form, .projects-head .filters"
  );

  revealTargets.forEach(function (el, i) {
    el.classList.add("reveal");
    // Stagger siblings slightly so grids cascade in
    var index = Array.prototype.indexOf.call(el.parentElement.children, el) % 6;
    el.style.setProperty("--delay", (index * 0.08) + "s");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    // Section titles get their underline animation when they appear
    var titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          titleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".section-title").forEach(function (t) { titleObserver.observe(t); });
  } else {
    // Reduced motion or no observer: show everything straight away
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll(".section-title").forEach(function (t) { t.classList.add("is-visible"); });
  }

  /* ---------- 3D tilt on skill and project cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".skill-group, .project").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    // Photo tilt
    var photo = document.querySelector(".photo-frame");
    if (photo) {
      photo.addEventListener("mousemove", function (e) {
        var rect = photo.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        photo.style.animationPlayState = "paused";
        photo.style.transform = "perspective(700px) rotateX(" + (-y * 12) + "deg) rotateY(" + (x * 12) + "deg) scale(1.03)";
      });
      photo.addEventListener("mouseleave", function () {
        photo.style.animationPlayState = "";
        photo.style.transform = "";
      });
    }
  }

  /* ---------- Ripple on buttons ---------- */
  document.querySelectorAll(".btn, .filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", function () { ripple.remove(); });
    });
  });

  /* ---------- Card entrance on project filter change ---------- */
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".project:not([hidden])").forEach(function (p, i) {
        p.classList.remove("is-visible");
        p.style.setProperty("--delay", (i * 0.06) + "s");
        void p.offsetWidth;
        p.classList.add("reveal", "is-visible");
      });
    });
  });
})();

/* =========================================================================
   Extra interaction: typing effect, cursor glow, magnetic buttons
   Text is never changed: the typed role line ends with the same wording.
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Typing effect on the role line ---------- */
  var role = document.querySelector(".hero-role");
  if (role && !reduceMotion) {
    var fullText = role.textContent;
    role.textContent = "";
    role.classList.add("typing-caret");
    role.setAttribute("aria-label", fullText);
    var i = 0;
    var typeTimer = setInterval(function () {
      i++;
      role.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        clearInterval(typeTimer);
        role.textContent = fullText;
        setTimeout(function () { role.classList.remove("typing-caret"); }, 1200);
      }
    }, 45);
  }

  if (!finePointer || reduceMotion) return;

  /* ---------- Cursor glow that follows the mouse ---------- */
  var glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  var targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener("mousemove", function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.classList.add("is-on");
  });
  document.addEventListener("mouseleave", function () { glow.classList.remove("is-on"); });

  (function animateGlow() {
    curX += (targetX - curX) * 0.15;
    curY += (targetY - curY) * 0.15;
    glow.style.transform = "translate(" + curX + "px, " + curY + "px)";
    requestAnimationFrame(animateGlow);
  })();

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.classList.add("magnetic");
    btn.addEventListener("mousemove", function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = "translate(" + x * 0.2 + "px, " + y * 0.25 + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });
})();
