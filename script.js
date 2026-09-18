(function () {
  "use strict";

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

  var setLink = function (selector, link) {
    var node = document.querySelector(selector);
    if (!node || !link) return;
    node.href = safeUrl(link.href);
    var label = node.firstChild;
    if (label && label.nodeType === Node.TEXT_NODE && link.label) {
      label.textContent = link.label + " ";
    }
  };

  var renderVisual = function (visual) {
    if (visual === "calculator") {
      var calculator = create("div", "project-art project-art--calculator");
      var paper = create("div", "calculator-paper");
      paper.appendChild(create("span", "calculator-label", "unit price / quick check"));
      var display = create("div", "calculator-display");
      display.appendChild(create("strong", "", "¥ / ?"));
      display.appendChild(create("span", "", "which one"));
      paper.appendChild(display);
      var rows = create("div", "calculator-rows");
      ["small bag", "big bag", "the one on sale"].forEach(function (label) {
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
    windowBar.appendChild(create("span", "", "ninedbase / player database"));
    database.appendChild(windowBar);
    var query = create("div", "art-query");
    query.appendChild(create("span", "", "search players..."));
    query.appendChild(create("b", "", "↗"));
    database.appendChild(query);
    var table = create("div", "art-table");
    [
      ["PLAYER", "SERIES", "MOOD"],
      ["someone fast", "S1", "good"],
      ["someone cool", "S2", "nice"],
      ["someone clutch", "S3", "wow"]
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
    var meta = create("div", "project-meta");
    meta.appendChild(create("span", "project-category", project.category));
    meta.appendChild(create("span", "project-status" + (project.status === "wip" ? " project-status--wip" : ""), project.statusLabel));
    content.appendChild(meta);

    var title = create("h3", "");
    var titleLink = create("a", "", project.title);
    titleLink.href = safeUrl(project.link);
    titleLink.target = "_blank";
    titleLink.rel = "noopener";
    title.appendChild(titleLink);
    content.appendChild(title);
    content.appendChild(create("p", "project-description", project.description));

    var bottom = create("div", "project-bottom");
    var tags = create("div", "project-tags");
    (project.tags || []).forEach(function (tag) {
      tags.appendChild(create("span", "project-tag", tag));
    });
    bottom.appendChild(tags);

    var projectLink = create("a", "project-link", "");
    projectLink.href = safeUrl(project.link);
    projectLink.target = "_blank";
    projectLink.rel = "noopener";
    projectLink.appendChild(document.createTextNode(project.linkLabel + " "));
    projectLink.appendChild(create("span", "", "↗"));
    bottom.appendChild(projectLink);
    content.appendChild(bottom);
    content.appendChild(create("p", "project-caption", project.caption));
    article.appendChild(content);
    article.setAttribute("aria-label", "Project " + (index + 1) + ": " + project.title);
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
      anchor.appendChild(create("span", "", link.label));
      anchor.appendChild(create("small", "", link.note));
      target.appendChild(anchor);
    });
  };

  var render = function (content) {
    document.documentElement.lang = content.site.language || "en";
    document.title = content.site.title;
    var description = document.querySelector('meta[name="description"]');
    if (description) description.content = content.site.description;

    Object.keys(content.nav || {}).forEach(function (key) {
      var nav = document.querySelector('[data-nav="' + key + '"]');
      if (!nav) return;
      nav.textContent = content.nav[key].label;
      nav.href = content.nav[key].href;
    });

    text('[data-text="hero.eyebrow"]', content.hero.eyebrow);
    text('[data-text="hero.title"]', content.hero.title);
    text('[data-text="hero.body"]', content.hero.body);
    text('[data-text="hero.noteLabel"]', content.hero.noteLabel);
    text('[data-text="hero.noteTitle"]', content.hero.noteTitle);
    text('[data-text="hero.noteBody"]', content.hero.noteBody);
    text('[data-text="hero.noteMeta"]', content.hero.noteMeta);
    text('[data-text="hero.footnote"]', content.hero.footnote);
    setLink('[data-link="hero.primary"]', content.hero.primary);
    setLink('[data-link="hero.secondary"]', content.hero.secondary);

    text('[data-text="work.eyebrow"]', content.work.eyebrow);
    text('[data-text="work.title"]', content.work.title);
    text('[data-text="work.intro"]', content.work.intro);
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

    document.body.classList.add("is-ready");
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
      console.error(error);
    });
}());
