(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------ */
  /* Tema claro/escuro                                                   */
  /* ------------------------------------------------------------------ */
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("portfolioTheme", theme);
    } catch (e) {}
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  }

  var themeToggle = document.getElementById("themeToggle");
  var themeToggleMobile = document.getElementById("themeToggleMobile");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleMobile)
    themeToggleMobile.addEventListener("click", toggleTheme);

  /* ------------------------------------------------------------------ */
  /* Menu mobile                                                         */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("mainNavLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Barra de progresso de rolagem                                       */
  /* ------------------------------------------------------------------ */
  var scrollProgress = document.getElementById("scrollProgress");
  var ticking = false;

  function updateScrollProgress() {
    var scrollTop = window.scrollY;
    var docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + "%";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Scroll reveal (também dispara as barras de habilidade)              */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ano no rodapé                                                       */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Voltar ao topo                                                      */
  /* ------------------------------------------------------------------ */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot screen (só na primeira visita da aba)                          */
  /* ------------------------------------------------------------------ */
  (function bootScreen() {
    var screen = document.getElementById("bootScreen");
    var log = document.getElementById("bootLog");
    if (!screen || !log) return;

    var alreadyBooted = false;
    try {
      alreadyBooted = sessionStorage.getItem("portfolioBooted") === "1";
    } catch (e) {}

    if (alreadyBooted || prefersReducedMotion) return;

    var lines = [
      "> iniciando portfolio.sh",
      "> carregando modulos de interface...",
      "> conectando stack: html + css + js",
      "> tudo pronto. bem-vindo(a)."
    ];

    screen.classList.add("active");
    document.body.style.overflow = "hidden";

    var lineIndex = 0;
    function typeNextLine() {
      if (lineIndex >= lines.length) {
        setTimeout(function () {
          screen.classList.add("fade-out");
          document.body.style.overflow = "";
          setTimeout(function () {
            screen.classList.remove("active", "fade-out");
          }, 500);
        }, 400);
        try {
          sessionStorage.setItem("portfolioBooted", "1");
        } catch (e) {}
        return;
      }
      log.textContent += (lineIndex > 0 ? "\n" : "") + lines[lineIndex];
      lineIndex++;
      setTimeout(typeNextLine, 260);
    }

    typeNextLine();
  })();

  /* ------------------------------------------------------------------ */
  /* Constelação de código (canvas 2D puro)                               */
  /*                                                                      */
  /* Em vez de pontos, cada "partícula" é um símbolo de código (chaves,   */
  /* colchetes, operadores...) ligado aos vizinhos próximos por linhas    */
  /* finas, como uma constelação.                                        */
  /* ------------------------------------------------------------------ */
  (function codeConstellation() {
    var canvas = document.getElementById("particlesCanvas");
    if (!canvas || prefersReducedMotion) return;

    var ctx = canvas.getContext("2d");
    var particlesArr = [];
    var width, height;
    var paused = false;
    var PARTICLE_COUNT = 42;
    var MAX_DIST = 150;
    var SYMBOLS = [
      "{ }", "< >", "( )", "[ ]", ";", "//", "=>", "#", "&&", "||", "0", "1"
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particlesArr = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particlesArr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        });
      }
    }

    function step() {
      if (paused) return;
      ctx.clearRect(0, 0, width, height);

      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (var a = 0; a < particlesArr.length; a++) {
        for (var b = a + 1; b < particlesArr.length; b++) {
          var dx = particlesArr[a].x - particlesArr[b].x;
          var dy = particlesArr[a].y - particlesArr[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(particlesArr[a].x, particlesArr[a].y);
            ctx.lineTo(particlesArr[b].x, particlesArr[b].y);
            ctx.strokeStyle =
              "rgba(255, 43, 61, " + (1 - dist / MAX_DIST) * 0.25 + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (var i = 0; i < particlesArr.length; i++) {
        var p = particlesArr[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = "rgba(255, 43, 61, 0.65)";
        ctx.fillText(p.symbol, p.x, p.y);
      }

      requestAnimationFrame(step);
    }

    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
      if (!paused) step();
    });

    window.addEventListener("resize", function () {
      resize();
      createParticles();
    });

    resize();
    createParticles();
    step();
  })();

  /* ------------------------------------------------------------------ */
  /* TV de tubo retrô (canvas 2D puro)                                    */
  /*                                                                      */
  /* 3 canais: 1) logo "DVD" quicando nas bordas (estilo protetor de      */
  /* tela clássico), 2) foto de perfil, 3) estática/sem sinal. Botão de   */
  /* ligar/desligar e botão de trocar canal.                              */
  /* ------------------------------------------------------------------ */
  (function retroTV() {
    var widget = document.getElementById("tvWidget");
    var powerBtn = document.getElementById("tvPower");
    var channelBtn = document.getElementById("tvChannel");
    var canvas = document.getElementById("tvCanvas");
    var photo = document.getElementById("tvPhoto");
    if (!widget || !powerBtn || !channelBtn || !canvas || !photo) return;

    var ctx = canvas.getContext("2d");
    var channels = ["dvd", "photo", "static"];
    var channelIndex = 0;
    var isOn = true;
    var rafId = null;
    var width = 0;
    var height = 0;

    var DVD_COLORS = [
      "#ff2b3d",
      "#ffb020",
      "#2bd4ff",
      "#39e06a",
      "#c758ff",
      "#ffffff"
    ];
    var dvd = null;

    var staticCanvas = document.createElement("canvas");
    var staticCols = 80;
    var staticRows = 60;
    staticCanvas.width = staticCols;
    staticCanvas.height = staticRows;
    var staticCtx = staticCanvas.getContext("2d");

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initDvd() {
      var w = width * 0.34;
      var h = height * 0.18;
      dvd = {
        x: Math.random() * (width - w),
        y: Math.random() * (height - h),
        w: w,
        h: h,
        vx: width * 0.0045,
        vy: height * 0.006,
        color: DVD_COLORS[0]
      };
    }

    function drawDvd() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        dvd.x += dvd.vx;
        dvd.y += dvd.vy;
        var bounced = false;

        if (dvd.x <= 0) {
          dvd.x = 0;
          dvd.vx *= -1;
          bounced = true;
        } else if (dvd.x + dvd.w >= width) {
          dvd.x = width - dvd.w;
          dvd.vx *= -1;
          bounced = true;
        }

        if (dvd.y <= 0) {
          dvd.y = 0;
          dvd.vy *= -1;
          bounced = true;
        } else if (dvd.y + dvd.h >= height) {
          dvd.y = height - dvd.h;
          dvd.vy *= -1;
          bounced = true;
        }

        if (bounced) {
          dvd.color =
            DVD_COLORS[Math.floor(Math.random() * DVD_COLORS.length)];
        }
      }

      ctx.save();
      ctx.font =
        "italic bold " + Math.round(dvd.h * 0.62) + "px 'Chakra Petch', sans-serif";
      ctx.fillStyle = dvd.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = dvd.color;
      ctx.shadowBlur = 10;
      ctx.fillText("DVD", dvd.x + dvd.w / 2, dvd.y + dvd.h / 2);
      ctx.restore();

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawDvd);
      }
    }

    function drawStatic() {
      var imgData = staticCtx.createImageData(staticCols, staticRows);
      for (var i = 0; i < imgData.data.length; i += 4) {
        var v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
      }
      staticCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        staticCanvas,
        0,
        0,
        staticCols,
        staticRows,
        0,
        0,
        width,
        height
      );

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawStatic);
      }
    }

    function stopLoop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function playChannel() {
      stopLoop();
      var ch = channels[channelIndex];

      if (ch === "photo") {
        canvas.style.display = "none";
        photo.style.display = "block";
        return;
      }

      canvas.style.display = "block";
      photo.style.display = "none";
      resizeCanvas();

      if (ch === "dvd") {
        initDvd();
        drawDvd();
      } else if (ch === "static") {
        drawStatic();
      }
    }

    function render() {
      if (!isOn) {
        stopLoop();
        return;
      }
      playChannel();
    }

    powerBtn.addEventListener("click", function () {
      isOn = !isOn;
      powerBtn.setAttribute("aria-pressed", String(isOn));
      widget.classList.toggle("is-off", !isOn);
      render();
    });

    channelBtn.addEventListener("click", function () {
      if (!isOn) return;
      channelIndex = (channelIndex + 1) % channels.length;
      render();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopLoop();
      } else if (isOn) {
        playChannel();
      }
    });

    window.addEventListener("resize", function () {
      if (isOn && channels[channelIndex] !== "photo") {
        playChannel();
      }
    });

    render();
  })();

  /* ------------------------------------------------------------------ */
  /* "Ler mais" nos cards de projeto (abre em modal, não expande a caixa) */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".project-more-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dialog = document.getElementById(btn.getAttribute("data-target"));
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll(".project-dialog").forEach(function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    var closeBtn = dialog.querySelector("[data-close-dialog]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dialog.close();
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* Ampliar screenshot dos projetos (lightbox)                          */
  /* ------------------------------------------------------------------ */
  var lightbox = document.getElementById("screenshotLightbox");
  var lightboxImage = document.getElementById("lightboxImage");

  if (lightbox && lightboxImage) {
    document.querySelectorAll(".project-shot-zoom").forEach(function (btn) {
      btn.addEventListener("click", function () {
        lightboxImage.src = btn.getAttribute("data-full");
        lightboxImage.alt = btn.getAttribute("data-alt") || "";
        lightbox.showModal();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Formulário de contato (Web3Forms)                                    */
  /*                                                                      */
  /* Este site é 100% estático: sem uma Access Key do Web3Forms, o        */
  /* formulário NÃO envia nada de verdade. Crie uma conta gratuita em     */
  /* https://web3forms.com, pegue sua Access Key e cole no input hidden   */
  /* "access_key" dentro do <form id="contactForm"> em index.html.        */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        status.textContent = "Preencha todos os campos corretamente.";
        return;
      }

      var accessKey = form.elements["access_key"]
        ? form.elements["access_key"].value
        : "";

      if (!accessKey || accessKey === "SUA_ACCESS_KEY") {
        status.textContent =
          "Formulário ainda não configurado. Veja as instruções em script.js.";
        return;
      }

      status.textContent = "Enviando...";

      var formData = new FormData(form);
      var payload = Object.fromEntries(formData.entries());

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            status.textContent = "Mensagem enviada com sucesso!";
            form.reset();
          } else {
            status.textContent =
              "Não foi possível enviar agora. Tente novamente mais tarde.";
          }
        })
        .catch(function () {
          status.textContent =
            "Não foi possível enviar agora. Tente novamente mais tarde.";
        });
    });
  }
})();
