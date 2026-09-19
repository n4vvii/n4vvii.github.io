(function () {
  "use strict";

  // Keep the measurement ID in this single configuration value.
  var measurementId = "G-09JKJQR7C9";
  var productionHosts = {
    "n4vvii.com": true,
    "www.n4vvii.com": true
  };
  var disableFlag = "ga-disable-" + measurementId;

  // Do not send local, preview, or Pages-default traffic to the property.
  if (!productionHosts[window.location.hostname] || window[disableFlag]) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);
}());
