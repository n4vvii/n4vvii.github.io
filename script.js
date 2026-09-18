(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var text = function (selector, value) {
    var node = document.querySelector(selector);
    if (node && value !== undefined && value !== null) {
      node.textContent = String(value);
    }
  };

  var create = function (tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  };

  var safeUrl = function (value) {
    try {
      var url = new URL(value, window.location.href);
      if (["http:", "https:", "mailto:"].indexOf(url.protocol) === -1) return "#";
      return url.href;
    } catch (error) {
      return "#";
    }
  };

  var themeStorageKey = "n4vvii-theme";
  var systemTheme = function () {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  var storedTheme = function () {
    try {
      var value = window.localStorage.getItem(themeStorageKey);
      return value === "dark" || value === "light" ? value : "";
    } catch (error) {
      return "";
    }
  };

  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  var typeHeroTitle = function (value) {
    var node = document.querySelector('[data-text="hero.title"]');
    if (!node) return;
    var typed = node.querySelector(".typing-text");
    node.setAttribute("aria-label", String(value));
    if (!typed) {
      node.textContent = String(value);
      return;
    }

    if (prefersReducedMotion()) {
      typed.textContent = String(value);
      node.classList.add("is-typed");
      return;
    }

    var reserveTitleSpace = function () {
      var currentText = typed.textContent;
      node.style.minHeight = "0px";
      typed.textContent = String(value);
      var fullHeight = node.getBoundingClientRect().height;
      typed.textContent = currentText;
      node.style.minHeight = Math.ceil(fullHeight) + "px";
    };

    reserveTitleSpace();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reserveTitleSpace);
    }

    typed.textContent = "";
    node.classList.add("is-typing");
    var index = 0;
    var write = function () {
      typed.textContent = String(value).slice(0, index);
      if (index >= String(value).length) {
        node.classList.remove("is-typing");
        node.classList.add("is-typed");
        return;
      }
      index += 1;
      window.setTimeout(write, String(value).charAt(index - 1) === " " ? 24 : 42);
    };
    window.setTimeout(write, 180);
  };

  var stopRevealTracking = function () {};

  var revealAll = function () {
    stopRevealTracking();
    document.documentElement.classList.remove("reveal-ready");
    var nodes = document.querySelectorAll("[data-reveal]");
    Array.prototype.forEach.call(nodes, function (node) {
      node.classList.add("is-visible");
    });
  };

  var initReveals = function () {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length || prefersReducedMotion()) {
      revealAll();
      return;
    }

    Array.prototype.forEach.call(nodes, function (node, index) {
      node.style.setProperty("--reveal-delay", Math.min(index * 55, 220) + "ms");
    });

    document.documentElement.classList.add("reveal-ready");

    var ticking = false;
    var finished = false;
    var fallbackTimer = 0;
    var scrollTargets = [window, document];
    if (document.scrollingElement) scrollTargets.push(document.scrollingElement);

    var addScrollParents = function (node) {
      var parent = node.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        var styles = window.getComputedStyle(parent);
        var overflow = styles.overflow + styles.overflowY + styles.overflowX;
        if (/(auto|scroll|overlay)/.test(overflow) && scrollTargets.indexOf(parent) === -1) {
          scrollTargets.push(parent);
        }
        parent = parent.parentElement;
      }
    };
    Array.prototype.forEach.call(nodes, addScrollParents);

    var isVisible = function (node) {
      var bounds = node.getBoundingClientRect();
      var top = 0;
      var bottom = window.innerHeight;
      var parent = node.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        var styles = window.getComputedStyle(parent);
        var overflow = styles.overflow + styles.overflowY + styles.overflowX;
        if (/(auto|scroll|overlay)/.test(overflow)) {
          var parentBounds = parent.getBoundingClientRect();
          top = Math.max(top, parentBounds.top);
          bottom = Math.min(bottom, parentBounds.bottom);
        }
        parent = parent.parentElement;
      }
      return bounds.top < bottom && bounds.bottom > top - 40;
    };

    var check = function () {
      if (ticking || finished) return;
      ticking = true;
      var run = function () {
        var remaining = 0;
        Array.prototype.forEach.call(nodes, function (node) {
          if (node.classList.contains("is-visible")) return;
          if (isVisible(node)) {
            node.classList.add("is-visible");
          } else {
            remaining += 1;
          }
        });
        ticking = false;
        if (!remaining) {
          stopRevealTracking();
        }
      };
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(run);
      } else {
        window.setTimeout(run, 16);
      }
    };

    var observer = null;
    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
        check();
      }, { rootMargin: "0px 0px 15% 0px", threshold: 0.01 });
      Array.prototype.forEach.call(nodes, function (node) {
        observer.observe(node);
      });
    }

    stopRevealTracking = function () {
      if (finished) return;
      finished = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      scrollTargets.forEach(function (target) {
        target.removeEventListener("scroll", check);
      });
      window.removeEventListener("resize", check);
      window.removeEventListener("load", check);
      document.removeEventListener("visibilitychange", check);
      if (observer) observer.disconnect();
      stopRevealTracking = function () {};
    };

    scrollTargets.forEach(function (target) {
      target.addEventListener("scroll", check, { passive: true });
    });
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    document.addEventListener("visibilitychange", check);
    fallbackTimer = window.setTimeout(revealAll, 1400);
    check();
  };

  var alignHashTarget = function () {
    var targetId = window.location.hash.slice(1);
    if (!targetId || targetId === "top") return;

    var target = document.getElementById(targetId);
    if (!target || !target.matches("main > .section[id]")) return;

    var root = document.documentElement;
    var previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start", behavior: "auto" });
    root.style.scrollBehavior = previousBehavior;
  };

  var applyTheme = function (theme) {
    var nextTheme = theme === "dark" ? "dark" : "light";
    var isDark = nextTheme === "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);

    var toggle = document.querySelector("[data-theme-toggle]");
    var icon = document.querySelector("[data-theme-icon]");
    var label = document.querySelector("[data-theme-label]");
    var labelText = isDark ? "Switch to light mode" : "Switch to dark mode";
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", labelText);
      toggle.title = labelText;
    }
    if (icon) icon.textContent = isDark ? "☼" : "☾";
    if (label) label.textContent = labelText;

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = isDark ? "#000000" : "#f3f7f6";
  };

  var initTheme = function () {
    var saved = storedTheme();
    applyTheme(document.documentElement.getAttribute("data-theme") || saved || systemTheme());

    var toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = current === "dark" ? "light" : "dark";
        try {
          window.localStorage.setItem(themeStorageKey, next);
        } catch (error) {}
        applyTheme(next);
      });
    }

    if (!saved && window.matchMedia) {
      var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      var handleSystemTheme = function (event) {
        applyTheme(event.matches ? "dark" : "light");
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemTheme);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemTheme);
      }
    }
  };

  initTheme();

  var setLink = function (selector, link) {
    var node = document.querySelector(selector);
    if (!node || !link) return;
    node.href = safeUrl(link.href);
    var label = node.firstChild;
    if (label && label.nodeType === Node.TEXT_NODE && link.label && label.textContent.trim()) {
      label.textContent = link.label + " ";
    }
  };

  var socialIconPaths = {
    github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  };

  var createSocialIcon = function (type) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "social-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", socialIconPaths[type] || socialIconPaths.github);
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    return svg;
  };

  var renderSocials = function (socials) {
    var target = document.getElementById("header-socials");
    if (!target) return;
    target.textContent = "";
    Object.keys(socials || {}).forEach(function (key) {
      var social = socials[key];
      if (!social || !social.href) return;
      var anchor = create("a", "social-link");
      anchor.href = safeUrl(social.href);
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anchor.setAttribute("aria-label", social.label || key);
      anchor.title = social.label || key;
      anchor.appendChild(createSocialIcon(social.icon || key));
      anchor.appendChild(create("span", "sr-only", social.label || key));
      target.appendChild(anchor);
    });
  };

  var renderVisual = function (visual) {
    if (visual === "calculator") {
      var calculator = create("div", "project-art project-art--calculator");
      var paper = create("div", "calculator-paper");
      paper.appendChild(create("span", "calculator-label", "単価を比較"));
      var display = create("div", "calculator-display");
      display.appendChild(create("strong", "", "¥ / ?"));
      display.appendChild(create("span", "", "どちらが安い？"));
      paper.appendChild(display);
      var rows = create("div", "calculator-rows");
      ["少ない容量", "多い容量", "特売の商品"].forEach(function (label) {
        var row = create("div", "calculator-row");
        row.appendChild(create("span", "", label));
        row.appendChild(create("i", "", ""));
        rows.appendChild(row);
      });
      paper.appendChild(rows);
      calculator.appendChild(paper);
      return calculator;
    }

    var database = create("div", "project-art project-art--database");
    var windowBar = create("div", "art-window-bar");
    for (var i = 0; i < 3; i += 1) windowBar.appendChild(create("i", "", ""));
    windowBar.appendChild(create("span", "", "ninedbase / 選手データベース"));
    database.appendChild(windowBar);
    var query = create("div", "art-query");
    query.appendChild(create("span", "", "選手を検索..."));
    database.appendChild(query);
    var table = create("div", "art-table");
    [
      ["選手", "シリーズ", "メモ"],
      ["選手A", "S1", "好調"],
      ["選手B", "S2", "注目"],
      ["選手C", "S3", "記録"]
    ].forEach(function (rowData) {
      var row = create("div", "art-table-row");
      rowData.forEach(function (cell) {
        row.appendChild(create("span", "", cell));
      });
      table.appendChild(row);
    });
    database.appendChild(table);
    return database;
  };

  var renderProject = function (project, index) {
    var article = create("article", "project-card");
    article.setAttribute("data-reveal", "");

    var media = create("div", "project-media");
    media.appendChild(renderVisual(project.visual));
    article.appendChild(media);

    var content = create("div", "project-content");
    content.appendChild(create("p", "project-stack", project.stack));

    var title = create("h3", "");
    if (project.link) {
      var titleLink = create("a", "project-card-link", project.title);
      titleLink.href = safeUrl(project.link);
      titleLink.target = "_blank";
      titleLink.rel = "noopener";
      title.appendChild(titleLink);
    } else {
      title.textContent = project.title;
    }
    content.appendChild(title);
    content.appendChild(create("p", "project-description", project.description));
    article.appendChild(content);
    article.setAttribute("aria-label", "作品" + (index + 1) + ": " + project.title);
    return article;
  };

  var renderContact = function (links) {
    var target = document.getElementById("contact-links");
    if (!target) return;
    target.textContent = "";
    (links || []).forEach(function (link) {
      var anchor = create("a", "contact-link", "");
      anchor.href = safeUrl(link.href);
      anchor.target = "_blank";
      anchor.rel = "noopener";
      var lead = create("span", "contact-link__lead");
      if (link.icon) lead.appendChild(createSocialIcon(link.icon));
      lead.appendChild(create("span", "contact-link__label", link.label));
      anchor.appendChild(lead);
      anchor.appendChild(create("small", "", link.note));
      target.appendChild(anchor);
    });
  };

  var render = function (content) {
    document.documentElement.lang = content.site.language || "en";
    document.title = content.site.title;
    var description = document.querySelector('meta[name="description"]');
    if (description) description.content = content.site.description;

    text('[data-text="site.profile.label"]', content.site.profile && content.site.profile.label);
    renderSocials(content.socials);

    Object.keys(content.nav || {}).forEach(function (key) {
      var nav = document.querySelector('[data-nav="' + key + '"]');
      if (!nav) return;
      nav.textContent = content.nav[key].label;
      nav.href = content.nav[key].href;
    });

    text('[data-text="hero.eyebrow"]', content.hero.eyebrow);
    typeHeroTitle(content.hero.title);
    text('[data-text="hero.body"]', content.hero.body);
    text('[data-text="hero.noteLabel"]', content.hero.noteLabel);
    text('[data-text="hero.noteTitle"]', content.hero.noteTitle);
    text('[data-text="hero.noteBody"]', content.hero.noteBody);
    text('[data-text="hero.noteMeta"]', content.hero.noteMeta);
    text('[data-text="hero.footnote"]', content.hero.footnote);
    setLink('[data-link="hero.primary"]', content.hero.primary);
    setLink('[data-link="hero.secondary"]', content.hero.secondary);

    text('[data-text="projectsSection.eyebrow"]', content.projectsSection.eyebrow);
    text('[data-text="projectsSection.title"]', content.projectsSection.title);
    text('[data-text="projectsSection.intro"]', content.projectsSection.intro);
    var projectList = document.getElementById("project-list");
    if (projectList) {
      projectList.textContent = "";
      (content.projects || []).forEach(function (project, index) {
        projectList.appendChild(renderProject(project, index));
      });
    }

    text('[data-text="about.eyebrow"]', content.about.eyebrow);
    text('[data-text="about.title"]', content.about.title);
    text('[data-text="about.calloutLabel"]', content.about.calloutLabel);
    text('[data-text="about.calloutNote"]', content.about.calloutNote);
    var aboutParagraphs = document.getElementById("about-paragraphs");
    if (aboutParagraphs) {
      aboutParagraphs.textContent = "";
      (content.about.paragraphs || []).forEach(function (paragraph) {
        aboutParagraphs.appendChild(create("p", "", paragraph));
      });
    }
    var recipe = document.getElementById("recipe-lines");
    if (recipe) {
      recipe.textContent = "";
      (content.about.calloutLines || []).forEach(function (line) {
        recipe.appendChild(create("li", "", line));
      });
    }

    text('[data-text="contact.eyebrow"]', content.contact.eyebrow);
    text('[data-text="contact.title"]', content.contact.title);
    text('[data-text="contact.body"]', content.contact.body);
    renderContact(content.contact.links);

    text('[data-text="footer.left"]', content.footer.left);
    text('[data-text="footer.middle"]', content.footer.middle);
    setLink('[data-link="footer.kofi"]', content.contact.kofi);

    initReveals();
    document.body.classList.add("is-ready");
    window.requestAnimationFrame(alignHashTarget);
    window.setTimeout(alignHashTarget, 240);
  };

  fetch("content/site.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Content file was not found.");
      return response.json();
    })
    .then(render)
    .catch(function (error) {
      document.body.classList.add("is-ready");
      var target = document.getElementById("project-list");
      if (target) {
        target.textContent = "The editable content file could not be loaded. Run a local web server and try again.";
      }
      revealAll();
      console.error(error);
    });
}());
