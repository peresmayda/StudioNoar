/* Studio Noar — comportamento do site (sem bibliotecas) */

// Sem viúvas: liga as duas últimas palavras de cada título e parágrafo com espaço não separável
(() => {
  const sel = 'h1, h2, h3, p, li > .svc-more p, dd, .svc-detail p, .rise > span, .float-title p';
  document.querySelectorAll(sel).forEach(el => {
    if (el.matches('.rise') || el.closest('.reveal') || el.querySelector('svg, input, button')) return;
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null; while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) last = walk.currentNode;
    if (!last) return;
    const t = last.nodeValue.replace(/\s+$/, ''), i = t.lastIndexOf(' ');
    if (i > 0 && !t.includes('\u00A0') && t.slice(0, i).trim().includes(' ')) last.nodeValue = t.slice(0, i) + '\u00A0' + t.slice(i + 1) + last.nodeValue.slice(t.length);
  });
})();

// Abertura: troca a foto a cada 4,5 s; pausa quando a aba não está visível ou quando o mouse está em cima
(() => {
  const reel = document.querySelector('.reel'); if (!reel) return;
  const figs = [...reel.querySelectorAll('figure')];
  let i = 0, timer = 0;
  const show = n => { i = (n + figs.length) % figs.length; figs.forEach((f, k) => f.classList.toggle('on', k === i)); };
  const next = () => { const f = figs[(i + 1) % figs.length].querySelector('img'); if (f.loading === 'lazy') f.loading = 'eager'; show(i + 1); };
  const play = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, 4500); };
  show(0); play();
  reel.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
  reel.parentElement.addEventListener('mouseleave', play);
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : play());
  // pré-carrega a próxima foto depois que a página termina de abrir
  addEventListener('load', () => figs.forEach(f => { const im = f.querySelector('img'); im.loading = 'eager'; }));
})();

// Revelação ao entrar na tela
(() => {
  const els = document.querySelectorAll('.rise, .fade, .floater');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -10% 0px' });
  els.forEach(e => io.observe(e));
})();

// O estúdio: o texto escurece palavra por palavra conforme a rolagem
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = document.querySelector('.reveal');
  const words = reveal.textContent.trim().split(/\s+/);
  const q = words.findIndex(w => w.startsWith('pergunta:')) + 1;   // a pergunta principal fica em vermelho
  reveal.innerHTML = words.map((w, i) => `<span class="w${q && i >= q ? ' q' : ''}">${w}</span>`).join(' ').replace(/ (<span[^>]*>[^<]*<\/span>)$/, '\u00A0$1');   // última palavra nunca sozinha
  const spans = [...reveal.querySelectorAll('.w')];
  const small = matchMedia('(max-width: 900px)');
  let raf = 0;
  const draw = () => {
    raf = 0;
    const r = reveal.getBoundingClientRect(), vh = innerHeight;
    const start = small.matches ? 1.05 : .85, span = small.matches ? .25 : .45;
    const p = calm ? 1 : Math.min(1, Math.max(0, (vh * start - r.top) / (r.height + vh * span)));
    const n = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle('on', i < n));
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); draw();
})();

// Adesivo: acompanha o mouse pelo painel amarelo, com atraso suave; volta ao lugar quando o mouse sai
(() => {
  const st = document.querySelector('.sticker'), panel = st.parentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const loop = () => {
    x += (tx - x) * .12; y += (ty - y) * .12;
    st.style.translate = `${x}px ${y}px`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(loop) : 0;
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const follow = (clientX, clientY, touch) => {
    const p = panel.getBoundingClientRect(), half = st.offsetWidth / 2;
    const home = { x: st.offsetLeft + half, y: st.offsetTop + half };
    // no toque fica centrado no dedo; com mouse, um pouco abaixo e à direita para não cobrir o clique
    const off = touch ? 0 : half + 18;
    const cx = Math.min(p.width - half - 12, Math.max(half + 12, clientX - p.left + off));
    const cy = Math.min(p.height - half - 12, Math.max(half + 12, clientY - p.top + off));
    tx = cx - home.x; ty = cy - home.y; go();
  };
  const home = () => { tx = 0; ty = 0; go(); };
  panel.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') follow(e.clientX, e.clientY, false); });
  panel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') home(); });
  // celular: o adesivo vai até onde o dedo toca e acompanha enquanto ele desliza
  let back = 0;
  const touch = e => { const t = e.touches[0]; if (!t) return; clearTimeout(back); panel.classList.add('touching'); follow(t.clientX, t.clientY, true); };
  panel.addEventListener('touchstart', touch, { passive: true });
  panel.addEventListener('touchmove', touch, { passive: true });
  panel.addEventListener('touchend', () => { back = setTimeout(() => { panel.classList.remove('touching'); home(); }, 1400); }, { passive: true });
})();

// Serviços: passar o mouse (ou focar com o teclado) mostra a descrição ao lado
(() => {
  const rows = [...document.querySelectorAll('.svc-row')], ds = [...document.querySelectorAll('.svc-detail .d')];
  const show = i => {
    rows.forEach((r, k) => r.setAttribute('aria-current', String(k === i)));
    ds.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  rows.forEach((r, i) => { r.addEventListener('mouseenter', () => show(i)); r.addEventListener('focus', () => show(i)); r.addEventListener('click', () => show(i)); });
})();

// Celular: menu em tela cheia
(() => {
  const btn = document.querySelector('.mbar-menu'), nav = document.getElementById('mnav');
  const set = open => { nav.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Fechar' : 'Menu'; document.body.classList.toggle('menu-open', open); };
  btn.addEventListener('click', () => set(nav.hidden));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) set(false); });
})();

// Celular: tocar no serviço abre a descrição embaixo
(() => {
  const small = matchMedia('(max-width: 900px)'), rows = [...document.querySelectorAll('.svc-row')];
  const sync = () => rows.forEach(r => small.matches ? r.setAttribute('aria-expanded', r.getAttribute('aria-expanded') === 'true' ? 'true' : 'false') : r.removeAttribute('aria-expanded'));
  rows.forEach(r => r.addEventListener('click', () => {
    if (!small.matches) return;
    const open = r.getAttribute('aria-expanded') === 'true';
    rows.forEach(x => x.setAttribute('aria-expanded', 'false'));
    r.setAttribute('aria-expanded', String(!open));
  }));
  small.addEventListener('change', sync); sync();
})();

// Projetos: abre o projeto completo
document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
  const d = document.getElementById(btn.dataset.open); d.showModal(); d.scrollTop = 0; document.body.classList.add('lock');
}));
document.querySelectorAll('.pdialog').forEach(d => {
  d.querySelector('.pclose').addEventListener('click', () => d.close());
  d.addEventListener('close', () => document.body.classList.remove('lock'));
});

// Formulário: monta a mensagem e abre uma conversa no WhatsApp do estúdio
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, st = f.querySelector('.status');
  const nome = f.nome.value.trim(), email = f.email.value.trim(), arroba = f.instagram.value.trim();
  if (!nome) { st.textContent = 'Falta o seu nome.'; f.nome.focus(); return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { st.textContent = 'Confira o e-mail: precisa ter @ e domínio.'; f.email.focus(); return; }
  const quer = [...f.querySelectorAll('input[name="interesse"]:checked')].map(i => i.value);
  const linhas = ['Olá, Studio Noar! Vim pelo site.', `Nome: ${nome}`, `E-mail: ${email}`];
  if (arroba) linhas.push(`@: ${arroba.startsWith('@') ? arroba : '@' + arroba}`);
  if (quer.length) linhas.push(`Procuro: ${quer.join(', ')}`);
  const url = 'https://wa.me/5522992132258?text=' + encodeURIComponent(linhas.join('\n'));
  const w = window.open(url, '_blank');
  if (w) w.opener = null; else location.href = url;
  st.textContent = 'Abrimos o WhatsApp com a sua mensagem. É só apertar enviar por lá.';
});

// Percorre a página e aproxima diferentes composições. Toque ou espaço pausa.
(() => {
  const dialog = document.getElementById('proj-duda');
  const stage = dialog.querySelector('.duda-showroom');
  const screen = stage.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation, visible = false, paused = false;
  function build() {
    animation?.cancel();
    if (!screen.complete || !screen.naturalWidth) return;
    const width = stage.clientWidth, height = stage.clientHeight;
    const imageHeight = width * screen.naturalHeight / screen.naturalWidth;
    // Tempos em segundos; foco normalizado na captura: card, botão e letra.
    // A ida leva 24s, e a volta direta ao topo leva apenas 4s.
    const stops = [
      [0, 0, 1, .5],
      [1, .18, 1, .5],
      [3, .18, 1.32, .32, .20], // Card de emagrecimento.
      [4.5, .18, 1, .5],
      [6, 0, 1, .5],
      [7.5, 0, 1.48, .27, .103], // Botão de agendamento na abertura.
      [9, 0, 1, .5],
      [11, .24, 1, .5],
      [12.5, .24, 1.4, .5, .262], // Tipografia de “Um plano que cabe na sua vida”.
      [14, .24, 1, .5],
      [16, .46, 1, .5],
      [17.5, .46, 1.22, .65, .415], // Texto ao lado do retrato.
      [19, .46, 1, .5],
      [21, .66, 1.25, .66, .67], // Segundo formato de acompanhamento.
      [22.5, .66, 1, .5],
      [24, 1, 1, .5],
      [28, 0, 1, .5]
    ];
    const frames = stops.map(([time, progress, zoom, focusX, focusY]) => {
      const x = -width * (zoom - 1) * focusX;
      const target = focusY === undefined
        ? (imageHeight * zoom - height) * progress
        : imageHeight * zoom * focusY - height / 2;
      const y = -Math.max(0, Math.min(imageHeight * zoom - height, target));
      return {offset:time / 28, transform:`translate3d(${x}px, ${y}px, 0) scale(${zoom})`, easing:'cubic-bezier(.45,0,.2,1)'};
    });
    animation = screen.animate(frames,{duration:28000,iterations:Infinity,fill:'both'});
    sync();
  }
  function sync() {
    const active = dialog.open && visible && !document.hidden && !paused && !reduced.matches;
    if (animation) active ? animation.play() : animation.pause();
    if (reduced.matches && animation) animation.currentTime = 0;
    stage.setAttribute('aria-pressed', String(paused));
    stage.setAttribute('aria-label', paused ? 'Retomar apresentação animada do site' : 'Pausar apresentação animada do site');
  }
  function toggle() { paused = !paused; sync(); }
  stage.addEventListener('click', toggle);
  stage.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggle(); }
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); },{threshold:.2}).observe(stage);
  new MutationObserver(() => { if (dialog.open) { paused = false; build(); } else { animation?.cancel(); animation = null; } }).observe(dialog,{attributes:true,attributeFilter:['open']});
  new ResizeObserver(build).observe(stage);
  screen.addEventListener('load', build);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
})();
