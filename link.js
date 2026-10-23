/**
 * Decides what the email-link landing page shows. Supabase redirects here with the app address
 * the app asked for (`?to=`) plus `code=` (or `error_code`/`error_description` when the link
 * expired or was already used). The code only works in the app that requested it (PKCE), so it
 * is only ever handed to a Kindway or Expo Go address, never sent anywhere else or logged.
 */
(function (root) {
  // Kindway builds, or Expo Go while developing; only the two routes that finish an email link.
  var APP_TARGET = /^(kindway|exps?):\/\/[^?#\s]*\/(auth\/confirm|reset-password)$/;
  var MOBILE = /Android|iPhone|iPad|iPod/i;

  function params(href) {
    var url = new URL(href);
    var found = new URLSearchParams(url.hash.replace(/^#/, ''));
    url.searchParams.forEach(function (value, key) {
      found.set(key, value);
    });
    return found;
  }

  /** `{ kind: 'open', url } | { kind: 'error' } | { kind: 'done' }`, each with `purpose`. */
  function decide(href, userAgent) {
    var p = params(href);
    var to = p.get('to') || '';
    var valid = APP_TARGET.test(to);
    var purpose = /reset-password$/.test(to) ? 'reset' : 'confirm';
    if (p.get('error_code') || p.get('error') || p.get('error_description')) return { kind: 'error', purpose: purpose };
    var code = p.get('code');
    if (valid && code && MOBILE.test(userAgent || '')) return { kind: 'open', purpose: purpose, url: to + '?code=' + encodeURIComponent(code) };
    return { kind: 'done', purpose: purpose };
  }

  var api = { decide: decide };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KindwayLink = api;
})(this);
