(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Año dinámico ---- */
  document.getElementById("yearNow").textContent = new Date().getFullYear();

  /* ---- Header scroll + barra de progreso ---- */
  var header = document.getElementById("siteHeader"),
      bar = document.getElementById("progressBar"),
      ind = document.getElementById("scrollIndicator"),
      indH = 96,
      ticking = false;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        header.classList.toggle("scrolled", window.scrollY > 40);
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? window.scrollY / h : 0;
        bar.style.width = (p * 100) + "%";
        ind.style.transform = "translateY(" + (p * (window.innerHeight - indH)) + "px)";
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---- Menú móvil ---- */
  var burger = document.getElementById("hamburger"),
      backdrop = document.getElementById("menuBackdrop");
  function toggleMenu(force){
    var open = (typeof force === "boolean") ? force : !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function(){ toggleMenu(); });
  backdrop.addEventListener("click", function(){ toggleMenu(false); });
  document.getElementById("mClose").addEventListener("click", function(){ toggleMenu(false); });
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

  /* ---- Efecto scramble/decode en kicker del hero ---- */
  var scrambleEl = document.getElementById("scrambleKicker");
  if(scrambleEl && !reduced){
    var finalText = scrambleEl.getAttribute("data-text"),
        glyphs = "✦#%&@*<>/+=?",
        frame = 0, total = finalText.length * 3 + 12;
    setTimeout(function tickStart(){
      (function tick(){
        var out = "";
        for(var i = 0; i < finalText.length; i++){
          var ch = finalText[i];
          if(ch === " " || ch === "·"){ out += ch; continue; }
          out += (i < frame / 3) ? ch : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        scrambleEl.textContent = out;
        frame++;
        if(frame <= total) window.requestAnimationFrame(tick);
        else scrambleEl.textContent = finalText;
      })();
    }, 500);
  }

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

  /* ---- Lightbox de galería ---- */
  var gItems = Array.prototype.slice.call(document.querySelectorAll(".g-item")),
      lb = document.getElementById("lightbox"),
      lbImg = document.getElementById("lbImg"),
      lbCap = document.getElementById("lbCap"),
      lbIndex = 0;
  function openLb(i){
    lbIndex = (i + gItems.length) % gItems.length;
    var img = gItems[lbIndex].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = gItems[lbIndex].getAttribute("data-cap");
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb(){
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  gItems.forEach(function(item, i){ item.addEventListener("click", function(){ openLb(i); }); });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function(e){ e.stopPropagation(); openLb(lbIndex - 1); });
  document.getElementById("lbNext").addEventListener("click", function(e){ e.stopPropagation(); openLb(lbIndex + 1); });
  lb.addEventListener("click", function(e){ if(e.target === lb) closeLb(); });
  document.addEventListener("keydown", function(e){
    if(!lb.classList.contains("open")) return;
    if(e.key === "Escape") closeLb();
    if(e.key === "ArrowLeft") openLb(lbIndex - 1);
    if(e.key === "ArrowRight") openLb(lbIndex + 1);
  });
})();