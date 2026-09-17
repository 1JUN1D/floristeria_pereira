/* =====================================================================
   SanJose Florería — Especial FLORES AMARILLAS (21 de septiembre)

   Qué hace:
     1. Inserta una sección destacada ARRIBA de la sección de productos
        (catálogo y landings) con contador regresivo al 21 de septiembre
        y los productos de flores amarillas marcados como OFERTA.
        Los datos (foto, nombre, precio, botón de WhatsApp) se toman de
        las tarjetas que ya existen en la página, así los precios siempre
        coinciden con el catálogo.
     2. Muestra un flyer flotante al entrar, que se cierra solo a los 5 s.

   VIGENCIA: desde hoy hasta el 21 de septiembre de 2026 a las 23:59:59
   (hora local del visitante). Pasada la fecha no se muestra nada.
   Para cambiar el año o la fecha, edita OBJETIVO y FIN abajo.
   Para cambiar los productos destacados, edita DESTACADOS.
   ===================================================================== */
(function () {
    'use strict';

    // --- Fecha objetivo (mes 8 = septiembre, base 0) ---
    var OBJETIVO = new Date(2026, 8, 21, 0, 0, 0);
    var FIN      = new Date(2026, 8, 21, 23, 59, 59);
    var FLYER_MS = 5000; // el flyer se cierra solo a los 5 segundos

    // Productos de flores amarillas (por nombre, igual en catálogo y landings)
    var DESTACADOS = [
        'Caja Girasoles Radiantes',
        'Caja Rosas Amarillas Alegría',
        'Girasol Solitario Elegante',
        'Ramo Dúo Amarillo y Rojo',
        'Sol y Pasión',
        'Girasoles y Pasión',
        'Sol Romántico',
        'Sol Imperial',
        'Constelación Dorada',
        'Explosión Solar'
    ];

    var ahora  = new Date();
    var activo = ahora <= FIN;
    var root   = document.documentElement;
    root.classList.add(activo ? 'fa-activo' : 'fa-inactivo');
    if (!activo) return;

    var IMG_FLYER = '/assets/flores_pereira_63.webp';

    // ---------- Contador ----------
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function restante() {
        var d = OBJETIVO - new Date();
        if (d <= 0) return null;
        return {
            d: Math.floor(d / 864e5),
            h: Math.floor(d / 36e5) % 24,
            m: Math.floor(d / 6e4) % 60,
            s: Math.floor(d / 1e3) % 60
        };
    }
    var relojes = [];
    function pintarRelojes() {
        var r = restante();
        relojes.forEach(function (el) {
            if (!r) {
                el.innerHTML = '<span class="fa-count__today">🌻 ¡Hoy es el día de las flores amarillas!</span>';
                return;
            }
            var cells = el.querySelectorAll('[data-u]');
            if (!cells.length) return;
            cells[0].textContent = r.d;
            cells[1].textContent = pad(r.h);
            cells[2].textContent = pad(r.m);
            cells[3].textContent = pad(r.s);
        });
    }
    function relojGrande() {
        var el = document.createElement('div');
        el.className = 'fa-count__grid';
        el.innerHTML =
            '<div class="fa-count__cell"><span class="fa-count__num" data-u="d">0</span><span class="fa-count__unit">Días</span></div>' +
            '<div class="fa-count__cell"><span class="fa-count__num" data-u="h">00</span><span class="fa-count__unit">Horas</span></div>' +
            '<div class="fa-count__cell"><span class="fa-count__num" data-u="m">00</span><span class="fa-count__unit">Min</span></div>' +
            '<div class="fa-count__cell"><span class="fa-count__num" data-u="s">00</span><span class="fa-count__unit">Seg</span></div>';
        relojes.push(el);
        return el;
    }
    function relojChico() {
        var el = document.createElement('div');
        el.className = 'fa-flyer__count';
        el.innerHTML =
            '<b><span data-u="d">0</span><small>días</small></b>' +
            '<b><span data-u="h">00</span><small>hrs</small></b>' +
            '<b><span data-u="m">00</span><small>min</small></b>' +
            '<b><span data-u="s">00</span><small>seg</small></b>';
        relojes.push(el);
        return el;
    }

    // ---------- Tarjetas destacadas (clonadas de las tarjetas reales) ----------
    function buscarTarjeta(nombre) {
        var cards = document.querySelectorAll('.product-card[data-name]');
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].getAttribute('data-name') === nombre) return cards[i];
        }
        return null;
    }
    function itemDesde(card) {
        var img   = card.querySelector('.product-image img');
        var price = card.querySelector('.product-price');
        var btn   = card.querySelector('.product-button');
        var code  = card.getAttribute('data-code') || '';
        var name  = card.getAttribute('data-name') || '';
        if (!img || !price || !btn) return null;

        var it = document.createElement('div');
        it.className = 'fa-item';

        var im = document.createElement('div');
        im.className = 'fa-item__img';
        var oc = card.querySelector('.product-image').getAttribute('onclick');
        if (oc) im.setAttribute('onclick', oc);
        var i2 = document.createElement('img');
        i2.src = img.getAttribute('src'); i2.alt = img.getAttribute('alt') || name; i2.loading = 'lazy';
        im.appendChild(i2);

        var badge = document.createElement('span');
        badge.className = 'fa-item__badge'; badge.textContent = '🌻 Oferta';

        var body = document.createElement('div');
        body.className = 'fa-item__body';
        body.innerHTML =
            '<span class="fa-item__code">Código #' + code + '</span>' +
            '<h3 class="fa-item__name"></h3>' +
            '<div class="fa-item__price"></div>';
        body.querySelector('.fa-item__name').textContent = name;
        body.querySelector('.fa-item__price').textContent = price.textContent.trim();
        var b2 = btn.cloneNode(true);
        b2.textContent = 'Pedir por WhatsApp';
        body.appendChild(b2);

        it.appendChild(badge); it.appendChild(im); it.appendChild(body);
        return it;
    }

    // ---------- Sección ----------
    function crearSeccion() {
        var destino = document.querySelector('section.catalog');
        if (!destino || document.querySelector('.fa-section')) return;

        var row = document.createElement('div');
        row.className = 'fa-row';
        var n = 0;
        DESTACADOS.forEach(function (nombre) {
            var card = buscarTarjeta(nombre);
            if (!card) return;
            var it = itemDesde(card);
            if (it) { row.appendChild(it); n++; }
        });
        if (!n) return;

        var sec = document.createElement('section');
        sec.className = 'fa-section';
        sec.id = 'flores-amarillas';
        sec.innerHTML =
            '<div class="container"><div class="fa-box">' +
                '<div class="fa-head">' +
                    '<div>' +
                        '<span class="fa-tag">🌻 Ofertas · 21 de septiembre</span>' +
                        '<h2 class="fa-title">Día de las <em>Flores Amarillas</em></h2>' +
                        '<p class="fa-sub">Regala girasoles y rosas amarillas este 21 de septiembre. Aprovecha las ofertas antes de que se acabe el tiempo.</p>' +
                    '</div>' +
                    '<div class="fa-count"><span class="fa-count__label">Faltan para el 21 de septiembre</span></div>' +
                '</div>' +
            '</div></div>';
        sec.querySelector('.fa-count').appendChild(relojGrande());
        sec.querySelector('.fa-box').appendChild(row);
        destino.parentNode.insertBefore(sec, destino);
    }

    // ---------- Flyer flotante ----------
    function crearFlyer() {
        if (document.querySelector('.fa-flyer-backdrop')) return;
        var bd = document.createElement('div');
        bd.className = 'fa-flyer-backdrop';
        bd.innerHTML =
            '<div class="fa-flyer" role="dialog" aria-label="Ofertas Flores Amarillas">' +
                '<button class="fa-flyer__close" type="button" aria-label="Cerrar" title="Cerrar">✕</button>' +
                '<div class="fa-flyer__img"><span class="fa-flyer__ribbon">Ofertas</span><img alt="Flores amarillas - 21 de septiembre" src="' + IMG_FLYER + '"/></div>' +
                '<div class="fa-flyer__body">' +
                    '<div class="fa-flyer__kicker">21 de septiembre</div>' +
                    '<h3 class="fa-flyer__title">Día de las <span>Flores Amarillas</span> 🌻</h3>' +
                    '<p class="fa-flyer__sub">Girasoles y rosas amarillas en oferta. ¡Sorprende a esa persona especial!</p>' +
                    '<button class="fa-flyer__cta" type="button">Ver ofertas</button>' +
                    '<p class="fa-flyer__auto">Este aviso se cierra solo en 5 segundos</p>' +
                '</div>' +
                '<div class="fa-flyer__bar"><i></i></div>' +
            '</div>';
        var body = bd.querySelector('.fa-flyer__body');
        body.insertBefore(relojChico(), body.querySelector('.fa-flyer__cta'));
        document.body.appendChild(bd);

        var cerrado = false, timer;
        function cerrar() {
            if (cerrado) return;
            cerrado = true;
            clearTimeout(timer);
            bd.classList.add('fa-out');
            setTimeout(function () { bd.parentNode && bd.parentNode.removeChild(bd); }, 350);
        }
        timer = setTimeout(cerrar, FLYER_MS);
        bd.querySelector('.fa-flyer__close').addEventListener('click', cerrar);
        bd.addEventListener('click', function (e) { if (e.target === bd) cerrar(); });
        bd.querySelector('.fa-flyer__cta').addEventListener('click', function () {
            cerrar();
            var s = document.getElementById('flores-amarillas');
            if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function init() {
        crearSeccion();
        crearFlyer();
        pintarRelojes();
        setInterval(pintarRelojes, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
