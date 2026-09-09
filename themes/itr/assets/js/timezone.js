/* Timezone display for talk times.
   Every element with data-utc="<ISO UTC>" and data-fmt="date|time|full"
   is re-rendered in the chosen zone. Choice persists in localStorage. */
(function () {
  var KEY = 'itr-tz';
  var selects = document.querySelectorAll('#tz-select, select[data-tz-select]');
  if (!selects.length && !document.querySelector('[data-utc]')) return;

  function resolveZone(v) {
    if (!v || v === 'auto') {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; }
    }
    return v;
  }
  function fmt(d, zone, kind) {
    var o;
    if (kind === 'date') o = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    else if (kind === 'time') o = { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    else o = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    o.timeZone = zone;
    try { return new Intl.DateTimeFormat(undefined, o).format(d); } catch (e) { return d.toUTCString(); }
  }
  function render(choice) {
    var zone = resolveZone(choice);
    document.querySelectorAll('[data-utc]').forEach(function (el) {
      var d = new Date(el.getAttribute('data-utc'));
      if (isNaN(d)) return;
      el.textContent = fmt(d, zone, el.getAttribute('data-fmt') || 'full');
    });
    selects.forEach(function (s) { s.value = choice; });
    document.querySelectorAll('.tz-current').forEach(function (el) { el.textContent = zone; });
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var choice = saved || 'auto';
  selects.forEach(function (s) {
    s.addEventListener('change', function () {
      choice = s.value;
      try { localStorage.setItem(KEY, choice); } catch (e) {}
      render(choice);
    });
  });
  render(choice);

  /* Mark cards as past on the client, in case the static build is stale. */
  var now = Date.now();
  document.querySelectorAll('.talk-card[data-end], .talk-card .talk-date[data-utc]').forEach(function (el) {
    var card = el.closest('.talk-card');
    var t = new Date(el.getAttribute('data-utc') || el.getAttribute('data-end'));
    if (card && !isNaN(t) && t.getTime() + 3600e3 < now) card.classList.add('is-past');
  });
})();
