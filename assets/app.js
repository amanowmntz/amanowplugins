/* ============================================================
   AmanowPlugins — интерактив. Всё на чистом JS, без библиотек.
   Работает: табы со скриншотами, лайтбокс, копирование реквизитов,
   плавное появление секций.
   ============================================================ */
(function () {
  'use strict';

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- 1. Табы: переключают скриншот, как вкладки в самом плагине ---------- */
  var tabs = document.querySelector('[data-tabs]');
  if (tabs) {
    var shot = document.getElementById('shot-img');
    var note = document.getElementById('shot-note');
    var btns = Array.prototype.slice.call(tabs.querySelectorAll('button'));
    var box = shot ? shot.closest('.shot') : null;

    // заранее подгружаем все картинки, чтобы переключение было мгновенным
    btns.forEach(function (b) { var i = new Image(); i.src = b.dataset.img; });

    function select(btn) {
      btns.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      if (!shot) return;
      if (box) box.classList.add('fade');
      setTimeout(function () {
        shot.src = btn.dataset.img;
        shot.alt = btn.dataset.alt || btn.textContent;
        if (btn.dataset.w) { shot.width = btn.dataset.w; shot.height = btn.dataset.h; }
        if (note) note.innerHTML = btn.dataset.note || '';
        if (box) box.classList.remove('fade');
      }, 180);
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var i = btns.indexOf(b);
        if (e.key === 'ArrowRight') { btns[(i + 1) % btns.length].focus(); btns[(i + 1) % btns.length].click(); }
        if (e.key === 'ArrowLeft') { btns[(i - 1 + btns.length) % btns.length].focus(); btns[(i - 1 + btns.length) % btns.length].click(); }
      });
    });
  }

  /* ---------- 2. Лайтбокс: клик по скриншоту — открыть во весь экран ---------- */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    function open(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('on');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.shot, .card img, [data-zoom]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!img) return;
        e.preventDefault();
        open(img.src, img.alt);
      });
    });
    lb.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- 3. Копирование реквизитов ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.textContent;

      function done() {
        btn.textContent = 'Скопировано';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = label; btn.classList.remove('done'); }, 1600);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }

      function fallback() {                       // запасной путь для старых браузеров
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { window.prompt('Скопируй вручную:', text); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- 4. Плавное появление секций ---------- */
  var items = document.querySelectorAll('.rv');
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();
