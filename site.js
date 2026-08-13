/* Shared behaviour for all pages. Every block is guarded, so one file is safe
   to include everywhere. */

(function () {
  'use strict';

  /* ---------------------------------------------------------- theme toggle */
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function readTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    if (!btn) return;
    var label = btn.querySelector('.theme-label');
    if (label) label.textContent = mode;
    btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
  }

  var saved = readTheme();
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ------------------------------------------------------ publication filter */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var pubItems = document.querySelectorAll('.pubs li[data-thread]');
  var countOut = document.getElementById('filtercount');

  if (chips.length && pubItems.length) {
    var applyFilter = function (key) {
      var shown = 0;
      Array.prototype.forEach.call(pubItems, function (li) {
        var match = key === 'all' || li.getAttribute('data-thread') === key;
        li.hidden = !match;
        if (match) shown++;
      });
      Array.prototype.forEach.call(chips, function (c) {
        c.classList.toggle('on', c.getAttribute('data-filter') === key);
      });
      if (countOut) {
        countOut.textContent = shown + (shown === 1 ? ' paper' : ' papers') +
          (key === 'all' ? '' : ' in ' + key);
      }
    };

    Array.prototype.forEach.call(chips, function (c) {
      c.addEventListener('click', function () {
        applyFilter(c.getAttribute('data-filter'));
      });
    });

    applyFilter('all');
  }

  /* --------------------------------------------------- precision explorer */
  var nq = document.getElementById('nq');
  var gm = document.getElementById('gm');
  var plot = document.getElementById('plot');

  if (nq && gm && plot) {
    var X0 = 56, X1 = 630, Y0 = 26, Y1 = 228;
    var NMIN = 2, NMAX = 14, YMIN = 0.02, YMAX = 3;

    var xOf = function (n) { return X0 + (n - NMIN) / (NMAX - NMIN) * (X1 - X0); };
    var yOf = function (v) {
      var t = (Math.log(v) - Math.log(YMIN)) / (Math.log(YMAX) - Math.log(YMIN));
      return Y1 - Math.max(0, Math.min(1, t)) * (Y1 - Y0);
    };

    /* Phase uncertainty for N qubits under local dephasing at rate gamma.
       Product probe: shot-noise scaling. GHZ probe: Heisenberg scaling, but the
       dephasing penalty compounds with N, which is the whole point. */
    var prod = function (n, g) { return Math.exp(g) / Math.sqrt(n); };
    var ghz = function (n, g) { return Math.exp(n * g) / n; };

    var grid = document.getElementById('grid');
    var gh = '';
    [0.03, 0.1, 0.3, 1].forEach(function (t) {
      gh += '<line class="gl" x1="' + X0 + '" y1="' + yOf(t) + '" x2="' + X1 + '" y2="' + yOf(t) + '"></line>';
      gh += '<text class="lbl" x="' + (X0 - 8) + '" y="' + (yOf(t) + 4) + '" text-anchor="end">' + t + '</text>';
    });
    gh += '<text class="lbl" x="14" y="128" transform="rotate(-90 14 128)" text-anchor="middle">phase uncertainty</text>';
    grid.innerHTML = gh;

    var el = function (id) { return document.getElementById(id); };

    var draw = function () {
      var n = parseInt(nq.value, 10);
      var g = parseFloat(gm.value);
      el('nqOut').textContent = n;
      el('gmOut').textContent = g.toFixed(2);

      var pp = [], pg = [];
      for (var k = NMIN; k <= NMAX + 0.001; k += 0.25) {
        pp.push(xOf(k).toFixed(1) + ',' + yOf(prod(k, g)).toFixed(1));
        pg.push(xOf(k).toFixed(1) + ',' + yOf(ghz(k, g)).toFixed(1));
      }
      el('lProd').setAttribute('points', pp.join(' '));
      el('lGhz').setAttribute('points', pg.join(' '));

      var vp = prod(n, g), vg = ghz(n, g);
      el('pProd').setAttribute('cx', xOf(n));
      el('pProd').setAttribute('cy', yOf(vp));
      el('pGhz').setAttribute('cx', xOf(n));
      el('pGhz').setAttribute('cy', yOf(vg));

      el('tProd').setAttribute('x', xOf(NMAX) - 54);
      el('tProd').setAttribute('y', yOf(prod(NMAX, g)) - 9);
      el('tGhz').setAttribute('x', xOf(NMAX) - 32);
      el('tGhz').setAttribute('y', yOf(ghz(NMAX, g)) - 9);

      el('mProd').textContent = vp.toFixed(3);
      el('mGhz').textContent = vg.toFixed(3);
      var adv = vp / vg;
      el('mAdv').textContent = adv >= 1 ? adv.toFixed(2) + 'x' : 'none (' + adv.toFixed(2) + 'x)';
    };

    nq.addEventListener('input', draw);
    gm.addEventListener('input', draw);
    draw();
  }
})();
