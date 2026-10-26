/* SAEDI — site script
   1. Mobile menu toggle
   2. Hero "IDEAS → SAEDI" replay
   3. Waitlist form (client-side success state + optional POST endpoint)

   Configuration lives in js/config.js (window.SAEDI_CONFIG).
*/
(function () {
  'use strict';

  var CONFIG = window.SAEDI_CONFIG || {};
  var WAITLIST_ENDPOINT = String(CONFIG.waitlistEndpoint || '').trim();

  /* 1. Mobile menu ----------------------------------------------------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');

  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    // Close the menu if the viewport grows past the desktop breakpoint.
    var mq = window.matchMedia('(min-width: 920px)');
    var onChange = function (ev) { if (ev.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* 2. Hero replay ----------------------------------------------------- */
  var flip = document.querySelector('.flip');
  var replay = document.querySelector('.replay');
  if (flip && replay) {
    replay.addEventListener('click', function () {
      flip.classList.toggle('re');
    });
  }

  /* 3. Waitlist form --------------------------------------------------- */
  var QUEUE_KEY = 'saedi.waitlist.pending';

  // Sent as text/plain on purpose: it keeps the request "simple" (no CORS
  // preflight), which Google Apps Script web apps require. The body is JSON.
  function send(entry) {
    return fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(entry)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function () { return { ok: true }; });
      })
      .then(function (data) {
        if (data && data.ok === false) throw new Error(data.error || 'Rejected');
      });
  }

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return []; }
  }
  function writeQueue(list) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
  }
  function queue(entry) {
    var list = readQueue();
    list.push(entry);
    writeQueue(list);
  }
  // Retry entries that failed earlier; drop each one only after the server accepted it.
  function flushQueue() {
    if (!WAITLIST_ENDPOINT) return;
    var list = readQueue();
    if (!list.length) return;
    writeQueue([]);
    list.forEach(function (entry) {
      send(entry).catch(function () { queue(entry); });
    });
  }
  flushQueue();

  var forms = document.querySelectorAll('.wl-form');
  Array.prototype.forEach.call(forms, function (box) {
    var form = box.querySelector('form');
    var error = box.querySelector('.wl-form__error');
    var submitBtn = form.querySelector('button[type="submit"]');
    var resetBtn = box.querySelector('.wl-form__reset');
    var firstOut = box.querySelector('[data-first]');
    var emailOut = box.querySelector('[data-email]');
    var choices = form.querySelectorAll('.choice');
    var submitLabel = submitBtn.textContent;

    var syncChoices = function () {
      Array.prototype.forEach.call(choices, function (c) {
        var input = c.querySelector('input');
        c.classList.toggle('is-selected', !!(input && input.checked));
      });
    };
    form.addEventListener('change', syncChoices);
    syncChoices();

    var showDone = function (first, email) {
      if (firstOut) firstOut.textContent = first;
      if (emailOut) emailOut.textContent = email;
      box.classList.add('is-done');
      var heading = box.querySelector('.wl-form__done h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };

    var setBusy = function (busy) {
      submitBtn.disabled = busy;
      submitBtn.textContent = busy ? 'Joining…' : submitLabel;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.hidden = true;

      var fd = new FormData(form);
      var entry = {};
      fd.forEach(function (value, key) { entry[key] = String(value).trim(); });

      var first = (entry.name || '').split(/\s+/)[0] || 'friend';
      var email = entry.email || '';

      // Honeypot: real people never see the "website" field. If it is filled,
      // show success and send nothing.
      if (entry.website) {
        showDone(first, email);
        return;
      }
      delete entry.website;

      entry.page = location.pathname;
      entry.submittedAt = new Date().toISOString();
      entry.userAgent = navigator.userAgent;

      if (!WAITLIST_ENDPOINT) {
        // Never pretend a sign-up was saved when it was not. Keep a local copy and tell the visitor.
        console.error('[SAEDI] waitlistEndpoint is not set in js/config.js; entry was NOT sent.', entry);
        queue(entry);
        if (error) error.hidden = false;
        return;
      }

      setBusy(true);
      send(entry)
        .then(function () {
          showDone(first, email);
          flushQueue();
        })
        .catch(function (err) {
          // Keep the entry so it is retried the next time someone opens the site on this device.
          console.error('[SAEDI] waitlist submit failed', err);
          queue(entry);
          if (error) error.hidden = false;
        })
        .then(function () { setBusy(false); });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        syncChoices();
        if (error) error.hidden = true;
        box.classList.remove('is-done');
        var firstInput = form.querySelector('input:not([tabindex="-1"])');
        if (firstInput) firstInput.focus();
      });
    }
  });
})();
