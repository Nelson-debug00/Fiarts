(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Año dinámico ---- */
  document.getElementById("yearNow").textContent = new Date().getFullYear();

  /* ---- Header scroll + barra de progreso ---- */
  var header = document.getElementById("siteHeader"),
      ind = document.getElementById("scrollIndicator"),
      indH = 96,
      ticking = false;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        header.classList.toggle("scrolled", window.scrollY > 40);
        var h = document.documentElement.scrollHeight - window.innerHeight;
        ticking = false;
      });
      ticking = true;
    }
  }

  /* ---- Drag to scroll en el indicador de scroll ---- */
  var isDragging = false;
  function handleDrag(clientY) {
    var totalHeight = window.innerHeight;
    var availableTrack = totalHeight - indH;
    if (availableTrack <= 0) return;
    
    var targetY = clientY - (indH / 2);
    targetY = Math.max(0, Math.min(targetY, availableTrack));
    
    var percentage = targetY / availableTrack;
    var scrollTarget = percentage * (document.documentElement.scrollHeight - totalHeight);
    
    // Temporariamente quitamos la transición de scroll suave si existe
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({
      top: scrollTarget,
      behavior: "auto" // 'auto' es instantáneo para evitar retrasos al arrastrar
    });
  }

  ind.addEventListener("mousedown", function(e){
    isDragging = true;
    document.documentElement.style.scrollBehavior = "auto";
    handleDrag(e.clientY);
    e.preventDefault();
  });

  window.addEventListener("mousemove", function(e){
    if (isDragging) {
      handleDrag(e.clientY);
    }
  });

  window.addEventListener("mouseup", function(){
    if (isDragging) {
      isDragging = false;
      // Restauramos el comportamiento suave por defecto para clics/anclas del menú
      document.documentElement.style.scrollBehavior = "";
    }
  });

  // Soporte para gestos táctiles (móvil)
  ind.addEventListener("touchstart", function(e){
    isDragging = true;
    document.documentElement.style.scrollBehavior = "auto";
    if(e.touches.length > 0) {
      handleDrag(e.touches[0].clientY);
    }
    e.preventDefault();
  }, {passive: false});

  window.addEventListener("touchmove", function(e){
    if (isDragging && e.touches.length > 0) {
      handleDrag(e.touches[0].clientY);
    }
  }, {passive: true});

  window.addEventListener("touchend", function(){
    isDragging = false;
    document.documentElement.style.scrollBehavior = "";
  });
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  if(ind){
    var isDragging = false, startY = 0, startScrollY = 0;
    ind.addEventListener("pointerdown", function(e){
      isDragging = true;
      startY = e.clientY;
      startScrollY = window.scrollY;
      ind.classList.add("dragging");
      document.documentElement.classList.add("is-dragging-scroll");
      e.preventDefault();
    });
    window.addEventListener("pointermove", function(e){
      if(!isDragging) return;
      e.preventDefault();
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = h > 0 ? h / (window.innerHeight - indH) : 0;
      var deltaY = e.clientY - startY;
      window.scrollTo(0, startScrollY + deltaY * ratio);
    }, {passive:false});
    window.addEventListener("pointerup", function(){
      isDragging = false;
      ind.classList.remove("dragging");
      document.documentElement.classList.remove("is-dragging-scroll");
    });
    window.addEventListener("pointercancel", function(){
      isDragging = false;
      ind.classList.remove("dragging");
      document.documentElement.classList.remove("is-dragging-scroll");
    });
  }

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
    lbCap.textContent = "";
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