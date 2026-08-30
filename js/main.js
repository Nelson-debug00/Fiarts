(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Año dinámico ---- */
  var yearEl = document.getElementById("yearNow");
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* ---- Tema claro/oscuro ---- */
  function currentTheme(){ return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    try{ localStorage.setItem("fiarts-theme", t); }catch(e){}
    var lbl = document.getElementById("themeLabelM");
    if(lbl){ lbl.textContent = (t === "light") ? "Modo oscuro" : "Modo claro"; }
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta){ meta.setAttribute("content", t === "light" ? "#FBF7FF" : "#0A0A11"); }
  }
  function toggleTheme(){ applyTheme(currentTheme() === "light" ? "dark" : "light"); }
  var tBtn = document.getElementById("themeToggle");
  if(tBtn){ tBtn.addEventListener("click", toggleTheme); }
  var tBtnM = document.getElementById("themeToggleM");
  if(tBtnM){ tBtnM.addEventListener("click", toggleTheme); }
  applyTheme(currentTheme());

  /* ---- Header scroll + barra de progreso ---- */
  var header = document.getElementById("siteHeader"),
      ind = document.getElementById("scrollIndicator"),
      indH = 96,
      ticking = false;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        var scrollY = window.scrollY;
        header.classList.toggle("scrolled", scrollY > 40);
        if (ind) {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          var pct = h > 0 ? scrollY / h : 0;
          var trackH = window.innerHeight - indH;
          ind.style.setProperty("--scroll-y", (pct * trackH) + "px");
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---- Drag to scroll en el indicador de scroll ---- */
  if (ind) {
    var isDragging = false;
    var startY = 0;
    var startScrollY = 0;

    ind.addEventListener("pointerdown", function(e) {
      isDragging = true;
      startY = e.clientY;
      startScrollY = window.scrollY;
      ind.classList.add("dragging");
      document.documentElement.classList.add("is-dragging-scroll");
      document.documentElement.style.scrollBehavior = "auto";
      
      // Jump scroll on click
      var totalHeight = window.innerHeight;
      var availableTrack = totalHeight - indH;
      if (availableTrack > 0) {
        var targetY = e.clientY - (indH / 2);
        targetY = Math.max(0, Math.min(targetY, availableTrack));
        var percentage = targetY / availableTrack;
        var scrollTarget = percentage * (document.documentElement.scrollHeight - totalHeight);
        window.scrollTo(0, scrollTarget);
        startScrollY = scrollTarget;
        startY = e.clientY;
      }
      e.preventDefault();
    });

    window.addEventListener("pointermove", function(e) {
      if (!isDragging) return;
      e.preventDefault();
      var totalHeight = window.innerHeight;
      var availableTrack = totalHeight - indH;
      if (availableTrack <= 0) return;
      
      var h = document.documentElement.scrollHeight - totalHeight;
      var ratio = h > 0 ? h / availableTrack : 0;
      var deltaY = e.clientY - startY;
      window.scrollTo(0, startScrollY + deltaY * ratio);
    }, { passive: false });

    var stopDragging = function() {
      if (isDragging) {
        isDragging = false;
        ind.classList.remove("dragging");
        document.documentElement.classList.remove("is-dragging-scroll");
        document.documentElement.style.scrollBehavior = "";
      }
    };

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
  }

  /* ---- Menú móvil ---- */
  var burger = document.getElementById("hamburger"),
      backdrop = document.getElementById("menuBackdrop");
  function toggleMenu(force){
    var open = (typeof force === "boolean") ? force : !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    if(burger){ burger.setAttribute("aria-expanded", open); }
    document.body.style.overflow = open ? "hidden" : "";
  }
  if(burger){
    burger.addEventListener("click", function(){ toggleMenu(); });
  }
  if(backdrop){
    backdrop.addEventListener("click", function(){ toggleMenu(false); });
  }
  var mClose = document.getElementById("mClose");
  if(mClose){ mClose.addEventListener("click", function(){ toggleMenu(false); }); }
  document.querySelectorAll(".mobile-menu a").forEach(function(a){
    a.addEventListener("click", function(){ toggleMenu(false); });
  });

  /* ---- Reveal on scroll ---- */
  var revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("in"); revealIO.unobserve(e.target); }
    });
  }, {threshold:.14});
  document.querySelectorAll(".reveal").forEach(function(el){ revealIO.observe(el); });

  /* ---- Contadores animados ---- */
  function animateCount(el){
    var target = parseInt(el.getAttribute("data-count"), 10);
    if(reduced){ el.textContent = target; return; }
    var t0 = null, dur = 1500;
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if(p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, {threshold:.6});
  document.querySelectorAll(".count").forEach(function(el){ countIO.observe(el); });

  /* ---- Nav activo según sección visible ---- */
  var navLinks = document.querySelectorAll(".main-nav a");
  var secIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        navLinks.forEach(function(a){
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      }
    });
  }, {rootMargin:"-40% 0px -55% 0px"});
  ["inicio","nosotros","talleres","galeria","contacto"].forEach(function(id){
    var s = document.getElementById(id);
    if(s) secIO.observe(s);
  });

  /* ---- Carrusel de galería (móvil) ---- */
  var gal = document.querySelector(".gallery"),
      galPrev = document.getElementById("galPrev"),
      galNext = document.getElementById("galNext");
  if(gal && galPrev && galNext){
    var galStep = function(){
      var item = gal.querySelector(".g-item");
      return item ? item.getBoundingClientRect().width + 14 : gal.clientWidth;
    };
    galPrev.addEventListener("click", function(){ gal.scrollBy({left:-galStep(), behavior:"smooth"}); });
    galNext.addEventListener("click", function(){ gal.scrollBy({left:galStep(), behavior:"smooth"}); });
  }

  /* ---- Lightbox de galería ---- */
  var gItems = Array.prototype.slice.call(document.querySelectorAll(".g-item")),
      lb = document.getElementById("lightbox"),
      lbImg = document.getElementById("lbImg"),
      lbCap = document.getElementById("lbCap"),
      lbIndex = 0;
  function openLb(i){
    if(!lb) return;
    lbIndex = (i + gItems.length) % gItems.length;
    var img = gItems[lbIndex].querySelector("img");
    if(lbImg){ lbImg.src = img.src; lbImg.alt = img.alt; }
    if(lbCap){ lbCap.textContent = ""; }
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb(){
    if(!lb) return;
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  gItems.forEach(function(item, i){ item.addEventListener("click", function(){ openLb(i); }); });
  var lbClose = document.getElementById("lbClose");
  if(lbClose){ lbClose.addEventListener("click", closeLb); }
  var lbPrev = document.getElementById("lbPrev");
  if(lbPrev){ lbPrev.addEventListener("click", function(e){ e.stopPropagation(); openLb(lbIndex - 1); }); }
  var lbNext = document.getElementById("lbNext");
  if(lbNext){ lbNext.addEventListener("click", function(e){ e.stopPropagation(); openLb(lbIndex + 1); }); }
  if(lb){
    lb.addEventListener("click", function(e){ if(e.target === lb) closeLb(); });
  }
  document.addEventListener("keydown", function(e){
    if(!lb || !lb.classList.contains("open")) return;
    if(e.key === "Escape") closeLb();
    if(e.key === "ArrowLeft") openLb(lbIndex - 1);
    if(e.key === "ArrowRight") openLb(lbIndex + 1);
  });
})();
