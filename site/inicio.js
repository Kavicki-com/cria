// Cria — the home page. The Churrapp v4 motion, adapted: Lenis for the
// smooth scroll, GSAP and ScrollTrigger for everything tied to it — the
// logo's steps drawing themselves, words rising out of a blur, the manifesto
// lighting up word by word, the band that runs with the scroll, the chart
// lines tracing as they arrive, the pinned document and the page fading
// between blue and paper. Under reduced motion, or if the libraries fail to
// load, the page stays still and fully readable.

(() => {
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temas = [...document.querySelectorAll('[data-tema]')];

  // The theme follows the section in the middle of the screen. Done without
  // GSAP so it works even when the animation is off.
  const trocarTema = () => {
    const meio = innerHeight * 0.5;
    for (const s of temas) {
      const r = s.getBoundingClientRect();
      if (r.top <= meio && r.bottom > meio) {
        document.body.classList.toggle('claro', s.dataset.tema === 'claro');
        break;
      }
    }
  };

  if (parado || !window.gsap || !window.ScrollTrigger || !window.Lenis) {
    addEventListener('scroll', trocarTema, { passive: true });
    trocarTema();
    return;
  }

  document.documentElement.classList.add('anima');
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Smooth scroll ----------

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  lenis.on('scroll', trocarTema);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  for (const a of document.querySelectorAll('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { duration: 1.8 });
    });
  }

  // The bar slips away while reading downwards and returns on the way up.
  const barra = document.querySelector('.barra');
  lenis.on('scroll', ({ scroll, direction }) => {
    barra.classList.toggle('escondida', direction === 1 && scroll > innerHeight * 0.6);
  });

  // ---------- Splitting words ----------

  function dividir(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const embrulhar = (no) => {
      for (const filho of [...no.childNodes]) {
        if (filho.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          for (const parte of filho.textContent.split(/(\s+)/)) {
            if (!parte) continue;
            if (/^\s+$/.test(parte)) {
              frag.append(' ');
              continue;
            }
            const palavra = document.createElement('span');
            palavra.className = 'palavra';
            palavra.setAttribute('aria-hidden', 'true');
            const dentro = document.createElement('span');
            dentro.textContent = parte;
            palavra.append(dentro);
            frag.append(palavra);
          }
          filho.replaceWith(frag);
        } else if (filho.nodeType === Node.ELEMENT_NODE) {
          embrulhar(filho);
        }
      }
    };
    embrulhar(el);
    return [...el.querySelectorAll('.palavra')];
  }

  // A stroke that draws itself: dash it to its own length, then run the
  // offset down to zero.
  function tracar(caminho, vars) {
    const n = caminho.getTotalLength();
    gsap.set(caminho, { strokeDasharray: n, strokeDashoffset: n });
    return gsap.to(caminho, { strokeDashoffset: 0, ease: 'none', ...vars });
  }

  // ---------- Headings rise word by word, out of a blur ----------

  for (const h of document.querySelectorAll('.linhas')) {
    const palavras = dividir(h).map((p) => p.firstElementChild);
    gsap.to(palavras, {
      opacity: 1,
      y: 0,
      rotate: 0,
      filter: 'blur(0px)',
      duration: 1.4,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  }

  for (const el of document.querySelectorAll('.revela')) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.3,
      ease: 'expo.out',
      delay: el.closest('.abertura') ? 0.5 : 0.1,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  }

  // The board lines, the sums and the plan lists arrive one after another.
  for (const lista of document.querySelectorAll('.quadros, .contas, .plano ul')) {
    gsap.from(lista.children, {
      opacity: 0,
      y: 18,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: lista, start: 'top 85%' },
    });
  }

  for (const el of document.querySelectorAll('.pontos')) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => el.classList.add('visto'),
    });
  }

  // ---------- Opening ----------

  // The steps climb once on arrival; the dot lands at the top.
  for (const svg of document.querySelectorAll('.abertura .degraus')) {
    tracar(svg.querySelector('path'), { duration: 2.4, ease: 'expo.inOut', delay: 0.2 });
    gsap.from(svg.querySelector('circle'), {
      scale: 0,
      transformOrigin: 'center',
      duration: 1.2,
      ease: 'back.out(1.6)',
      delay: 1.9,
    });
  }

  gsap.from('.vitrine .capa', {
    y: 60,
    rotate: -14,
    opacity: 0,
    duration: 1.8,
    ease: 'expo.out',
    delay: 0.3,
  });
  gsap.from('.vitrine .celular', {
    y: 120,
    opacity: 0,
    duration: 1.8,
    ease: 'expo.out',
    delay: 0.5,
  });
  gsap.to('.abertura-texto', {
    y: -80,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.abertura', start: 'top top', end: 'bottom 20%', scrub: true },
  });

  // ---------- Parallax ----------

  // data-vel: the element drifts against the scroll, in % of its height.
  for (const el of document.querySelectorAll('[data-vel]')) {
    const v = Number(el.dataset.vel);
    const gira = Number(el.dataset.gira || 0);
    gsap.fromTo(
      el,
      { yPercent: -v, rotate: -gira },
      {
        yPercent: v,
        rotate: gira * 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    );
  }

  // ---------- The manifesto lights up word by word ----------

  const acende = document.querySelector('.acende');
  if (acende) {
    gsap.to(dividir(acende), {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: acende, start: 'top 80%', end: 'bottom 45%', scrub: 0.8 },
    });
  }

  // ---------- The band runs with the scroll ----------

  const faixa = document.querySelector('.faixa-trilho');
  if (faixa) {
    gsap.fromTo(
      faixa,
      { xPercent: 0 },
      {
        xPercent: -35,
        ease: 'none',
        scrollTrigger: { trigger: '.faixa', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      },
    );
  }

  // ---------- The chart traces its lines, then marks the break-even ----------

  const grafico = document.querySelector('.grafico');
  if (grafico) {
    const linha = gsap.timeline({ scrollTrigger: { trigger: grafico, start: 'top 70%' } });
    linha
      .add(tracar(grafico.querySelector('.custo'), { duration: 1.4, ease: 'power2.inOut' }))
      .add(
        tracar(grafico.querySelector('.receita'), { duration: 1.4, ease: 'power2.inOut' }),
        '<0.2',
      )
      .from(grafico.querySelectorAll('.area'), { opacity: 0, duration: 0.8 }, '-=0.4')
      .from(
        grafico.querySelector('.empate'),
        { scale: 0, transformOrigin: 'center', duration: 0.8, ease: 'back.out(2)' },
        '-=0.5',
      )
      .from(
        grafico.querySelectorAll('.empate-texto'),
        { opacity: 0, y: 10, duration: 0.6 },
        '-=0.4',
      );
  }

  // ---------- The document: pinned, the pages slide sideways ----------

  const doc = document.querySelector('.documento');
  const trilha = doc?.querySelector('.trilha');
  if (doc && trilha) {
    const distancia = () => Math.max(0, trilha.scrollWidth - innerWidth);
    gsap.to(trilha, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: doc,
        start: 'top top',
        end: () => `+=${distancia() + innerHeight * 0.3}`,
        pin: '.doc-pino',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
  }

  // ---------- Closing: the steps draw with the scroll ----------

  for (const svg of document.querySelectorAll('.fecho .degraus')) {
    tracar(svg.querySelector('path'), {
      scrollTrigger: { trigger: '.fecho', start: 'top 80%', end: 'center center', scrub: 0.8 },
    });
    gsap.from(svg.querySelector('circle'), {
      scale: 0,
      transformOrigin: 'center',
      ease: 'none',
      scrollTrigger: { trigger: '.fecho', start: 'top 30%', end: 'center center', scrub: 0.8 },
    });
  }

  // ---------- Questions open and close smoothly ----------

  for (const d of document.querySelectorAll('details')) {
    const resumo = d.querySelector('summary');
    const resposta = d.querySelector('.resposta');
    resumo.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(resposta, {
          height: 0,
          opacity: 0,
          duration: 0.6,
          ease: 'expo.out',
          onComplete: () => {
            d.open = false;
            ScrollTrigger.refresh();
          },
        });
      } else {
        d.open = true;
        gsap.fromTo(
          resposta,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.8,
            ease: 'expo.out',
            onComplete: () => ScrollTrigger.refresh(),
          },
        );
      }
    });
  }

  trocarTema();
  // Lazy images change heights as they load.
  addEventListener('load', () => ScrollTrigger.refresh());
})();
