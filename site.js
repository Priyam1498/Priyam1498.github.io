
/* ================================================================
   Priyam Srivastava — Academic Website
   Shared JavaScript

   Features:
   1. Persistent dark/light theme
   2. Topic filtering for publications
   3. Interactive GHZ-dephasing illustration

   Every feature is independently guarded so this file can be
   included on all pages.

   Updated: November 2026
   ================================================================ */

(function () {
  'use strict';

  /* ==============================================================
     1. THEME MANAGEMENT
     ============================================================== */

  var root = document.documentElement;
  var themeButton = document.getElementById('theme-toggle');

  var STORAGE_KEY = 'theme';

  function readTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Theme switching still works without persistent storage.
    }
  }

  var systemTheme = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function preferredTheme() {
    return systemTheme && systemTheme.matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    var mode = theme === 'light' ? 'light' : 'dark';

    root.setAttribute('data-theme', mode);

    // Inform native form controls of the selected scheme.
    root.style.colorScheme = mode;

    if (!themeButton) {
      return;
    }

    var label = themeButton.querySelector('.theme-label');

    if (label) {
      label.textContent = mode;
    }

    themeButton.setAttribute(
      'aria-pressed',
      String(mode === 'dark')
    );

    themeButton.setAttribute(
      'aria-label',
      mode === 'dark'
        ? 'Switch to light theme'
        : 'Switch to dark theme'
    );

    themeButton.setAttribute(
      'title',
      mode === 'dark'
        ? 'Switch to light theme'
        : 'Switch to dark theme'
    );
  }

  // Use the saved setting, otherwise follow the operating system.
  var savedTheme = readTheme();

  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
  } else {
    applyTheme(preferredTheme());
  }

  // An explicit user selection overrides the system preference.
  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');

      var next = current === 'dark'
        ? 'light'
        : 'dark';

      applyTheme(next);
      saveTheme(next);
    });
  }

  // Follow OS changes only when no preference was saved.
  if (systemTheme) {
    var handleSystemThemeChange = function () {
      var stored = readTheme();

      if (stored !== 'dark' && stored !== 'light') {
        applyTheme(preferredTheme());
      }
    };

    if (typeof systemTheme.addEventListener === 'function') {
      systemTheme.addEventListener(
        'change',
        handleSystemThemeChange
      );
    } else if (typeof systemTheme.addListener === 'function') {
      // Compatibility with older browsers.
      systemTheme.addListener(handleSystemThemeChange);
    }
  }

  /* ==============================================================
     2. PUBLICATION FILTERING
     ============================================================== */

  var filterButtons = document.querySelectorAll(
    '.chip[data-filter]'
  );

  var publicationItems = document.querySelectorAll(
    '.pubs li[data-thread]'
  );

  var filterCount = document.getElementById('filtercount');

  var topicLabels = {
    all: 'all topics',
    sensing: 'sensing and metrology',
    networks: 'quantum networking',
    codes: 'quantum codes',
    review: 'reviews'
  };

  if (filterButtons.length && publicationItems.length) {

    function applyPublicationFilter(topic) {
      var selected = Object.prototype.hasOwnProperty.call(
        topicLabels,
        topic
      ) ? topic : 'all';

      var visibleCount = 0;

      Array.prototype.forEach.call(
        publicationItems,
        function (item) {
          var itemTopics = (
            item.getAttribute('data-thread') || ''
          ).trim().split(/\s+/);

          var matches =
            selected === 'all' ||
            itemTopics.indexOf(selected) !== -1;

          item.hidden = !matches;

          // Explicit display handling avoids stylesheet rules
          // accidentally overriding the hidden attribute.
          item.style.display = matches ? '' : 'none';

          if (matches) {
            visibleCount += 1;
          }
        }
      );

      Array.prototype.forEach.call(
        filterButtons,
        function (button) {
          var active =
            button.getAttribute('data-filter') === selected;

          button.classList.toggle('on', active);

          button.setAttribute(
            'aria-pressed',
            String(active)
          );
        }
      );

      if (filterCount) {
        var noun = visibleCount === 1
          ? 'publication or manuscript'
          : 'publications and manuscripts';

        if (selected === 'all') {
          filterCount.textContent =
            'Showing all ' +
            visibleCount +
            ' ' +
            noun +
            '.';
        } else {
          filterCount.textContent =
            'Showing ' +
            visibleCount +
            ' ' +
            noun +
            ' in ' +
            topicLabels[selected] +
            '.';
        }
      }
    }

    Array.prototype.forEach.call(
      filterButtons,
      function (button) {
        button.addEventListener('click', function () {
          applyPublicationFilter(
            button.getAttribute('data-filter')
          );
        });
      }
    );

    applyPublicationFilter('all');
  }

  /* ==============================================================
     3. GHZ SENSITIVITY UNDER DEPHASING
     ============================================================== */

  var qubitSlider = document.getElementById('nq');
  var dephasingSlider = document.getElementById('gm');
  var plot = document.getElementById('plot');

  if (qubitSlider && dephasingSlider && plot) {

    /* ------------------------------------------------------------
       Mathematical model

       Independent, pure dephasing:
         single-qubit coherence = exp(-d)

       Product probe:
         F_prod = N exp(-2d)
         delta_prod = exp(d) / sqrt(N)

       GHZ probe:
         F_GHZ = N^2 exp(-2Nd)
         delta_GHZ = exp(Nd) / N

       Advantage ratio:
         delta_prod / delta_GHZ
           = sqrt(N) exp(-(N-1)d)

       GHZ has a smaller local uncertainty bound if:
         d < ln(N) / [2(N-1)]

       Assumptions:
       - Fixed interrogation time
       - Independent identical pure dephasing
       - Ideal preparation and measurement
       - One normalized independent repetition
       - Local quantum Cramer-Rao bounds
       - No optimization over interrogation time

       This is an educational model, not a result
       from the author's variational sensing papers.
       ------------------------------------------------------------ */

    function productQFI(n, d) {
      return n * Math.exp(-2 * d);
    }

    function ghzQFI(n, d) {
      return n * n * Math.exp(-2 * n * d);
    }

    function productUncertainty(n, d) {
      return 1 / Math.sqrt(productQFI(n, d));
    }

    function ghzUncertainty(n, d) {
      return 1 / Math.sqrt(ghzQFI(n, d));
    }

    function uncertaintyRatio(n, d) {
      return Math.sqrt(n) * Math.exp(-(n - 1) * d);
    }

    /* ------------------------------------------------------------
       Plot configuration

       SVG viewBox: 660 x 270
       X-axis: number of qubits
       Y-axis: logarithmic phase uncertainty

       The chosen Y range accommodates all values
       for N=2...14 and d=0...0.3.
       ------------------------------------------------------------ */

    var SVG_NS = 'http://www.w3.org/2000/svg';

    var X0 = 56;
    var X1 = 630;

    var Y0 = 26;
    var Y1 = 228;

    var NMIN = 2;
    var NMAX = 14;

    var YMIN = 0.02;
    var YMAX = 6;

    function xOf(n) {
      return X0 +
        ((n - NMIN) / (NMAX - NMIN)) *
        (X1 - X0);
    }

    function yOf(value) {
      var safe = Math.max(YMIN, Math.min(YMAX, value));

      var scaled =
        (Math.log(safe) - Math.log(YMIN)) /
        (Math.log(YMAX) - Math.log(YMIN));

      return Y1 - scaled * (Y1 - Y0);
    }

    function element(id) {
      return document.getElementById(id);
    }

    function setText(id, text) {
      var node = element(id);

      if (node) {
        node.textContent = text;
      }
    }

    function svgElement(name, attributes, content) {
      var node = document.createElementNS(
        SVG_NS,
        name
      );

      Object.keys(attributes || {}).forEach(
        function (key) {
          node.setAttribute(key, attributes[key]);
        }
      );

      if (content !== undefined) {
        node.textContent = content;
      }

      return node;
    }

    /* ------------------------------------------------------------
       Build axes and logarithmic grid
       ------------------------------------------------------------ */

    var grid = element('grid');

    function buildGrid() {
      if (!grid) {
        return;
      }

      // Clear previously generated axis elements.
      while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
      }

      var yTicks = [0.03, 0.1, 0.3, 1, 3, 6];

      yTicks.forEach(function (value) {
        var y = yOf(value);

        grid.appendChild(
          svgElement('line', {
            class: 'gl',
            x1: X0,
            y1: y,
            x2: X1,
            y2: y
          })
        );

        grid.appendChild(
          svgElement(
            'text',
            {
              class: 'lbl',
              x: X0 - 8,
              y: y + 4,
              'text-anchor': 'end'
            },
            String(value)
          )
        );
      });

      // Vertical axis label.
      grid.appendChild(
        svgElement(
          'text',
          {
            class: 'lbl',
            x: 14,
            y: 128,
            transform: 'rotate(-90 14 128)',
            'text-anchor': 'middle'
          },
          'phase uncertainty'
        )
      );

      // Sparse qubit-number tick labels.
      [2, 4, 6, 8, 10, 12, 14].forEach(
        function (n) {
          grid.appendChild(
            svgElement(
              'text',
              {
                class: 'lbl',
                x: xOf(n),
                y: Y1 + 17,
                'text-anchor': 'middle'
              },
              String(n)
            )
          );
        }
      );
    }

    buildGrid();

    /* ------------------------------------------------------------
       Utility functions
       ------------------------------------------------------------ */

    function validQubitCount(value) {
      var n = Number.parseInt(value, 10);

      if (!Number.isFinite(n)) {
        return 8;
      }

      return Math.max(NMIN, Math.min(NMAX, n));
    }

    function validDephasing(value) {
      var d = Number.parseFloat(value);

      if (!Number.isFinite(d)) {
        return 0;
      }

      return Math.max(0, Math.min(0.3, d));
    }

    function plotPoints(model, d) {
      var points = [];

      for (var n = NMIN; n <= NMAX; n += 1) {
        points.push(
          xOf(n).toFixed(2) +
          ',' +
          yOf(model(n, d)).toFixed(2)
        );
      }

      return points.join(' ');
    }

    function setPolyline(id, points) {
      var node = element(id);

      if (node) {
        node.setAttribute('points', points);
      }
    }

    function setPoint(id, n, value) {
      var node = element(id);

      if (!node) {
        return;
      }

      node.setAttribute('cx', xOf(n));
      node.setAttribute('cy', yOf(value));
    }

    function clampLabelY(y) {
      return Math.max(Y0 + 10, Math.min(Y1 - 8, y));
    }

    function setCurveLabel(id, x, y) {
      var node = element(id);

      if (!node) {
        return;
      }

      node.setAttribute('x', x);
      node.setAttribute('y', clampLabelY(y));
      node.setAttribute('text-anchor', 'end');
    }

    /* ------------------------------------------------------------
       Main rendering function
       ------------------------------------------------------------ */

    function drawExplorer() {
      var n = validQubitCount(qubitSlider.value);
      var d = validDephasing(dephasingSlider.value);

      // Keep controls and output labels synchronized.
      setText('nqOut', String(n));
      setText('gmOut', d.toFixed(2));

      /* Curves */
      setPolyline(
        'lProd',
        plotPoints(productUncertainty, d)
      );

      setPolyline(
        'lGhz',
        plotPoints(ghzUncertainty, d)
      );

      /* Selected point values */
      var productValue = productUncertainty(n, d);
      var ghzValue = ghzUncertainty(n, d);

      setPoint('pProd', n, productValue);
      setPoint('pGhz', n, ghzValue);

      /* Curve labels */
      var finalProduct = productUncertainty(NMAX, d);
      var finalGHZ = ghzUncertainty(NMAX, d);

      var prodLabelY = yOf(finalProduct) - 10;
      var ghzLabelY = yOf(finalGHZ) - 10;

      // Avoid overlapping curve labels.
      if (Math.abs(prodLabelY - ghzLabelY) < 17) {
        if (prodLabelY <= ghzLabelY) {
          prodLabelY -= 9;
          ghzLabelY += 9;
        } else {
          prodLabelY += 9;
          ghzLabelY -= 9;
        }
      }

      setCurveLabel(
        'tProd',
        X1 - 8,
        prodLabelY
      );

      setCurveLabel(
        'tGhz',
        X1 - 8,
        ghzLabelY
      );

      /* Numerical readout */
      setText(
        'mProd',
        productValue.toFixed(3)
      );

      setText(
        'mGhz',
        ghzValue.toFixed(3)
      );

      var advantage = uncertaintyRatio(n, d);

      setText(
        'mAdv',
        advantage.toFixed(2) + 'x'
      );

      /* Interpretation */
      var interpretation;

      if (Math.abs(advantage - 1) < 0.000001) {
        interpretation = 'equal uncertainty bounds';
      } else if (advantage > 1) {
        interpretation = 'lower GHZ uncertainty bound';
      } else {
        interpretation = 'lower product-state uncertainty bound';
      }

      var advantageNode = element('mAdv');

      if (advantageNode) {
        advantageNode.setAttribute(
          'aria-label',
          'Product-to-GHZ uncertainty ratio: ' +
          advantage.toFixed(3) +
          '. ' +
          interpretation +
          '.'
        );
      }

      /* Accessible plot description */
      plot.setAttribute(
        'aria-label',
        'Local phase uncertainty versus number of qubits. ' +
        'Selected N equals ' + n +
        ', integrated dephasing equals ' + d.toFixed(2) +
        '. Product uncertainty is ' +
        productValue.toFixed(3) +
        ', GHZ uncertainty is ' +
        ghzValue.toFixed(3) +
        '. The product-to-GHZ ratio is ' +
        advantage.toFixed(2) +
        '.'
      );
    }

    /* ------------------------------------------------------------
       Input listeners
       ------------------------------------------------------------ */

    qubitSlider.addEventListener(
      'input',
      drawExplorer
    );

    dephasingSlider.addEventListener(
      'input',
      drawExplorer
    );

    // Initialize the plot.
    drawExplorer();
  }

})();
