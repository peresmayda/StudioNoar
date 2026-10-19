"""Procura viúvas (uma palavra sozinha na última linha) e texto vazando em 13 larguras de tela.

Uso:  python3 scripts/checar-viuvas.py            (precisa de: pip install playwright)
Saída: uma linha por largura. Tudo certo quando aparece "ok" em todas.
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

PAGE = pathlib.Path(__file__).resolve().parent.parent / "index.html"
WIDTHS = (320, 360, 375, 390, 414, 430, 600, 768, 900, 1024, 1280, 1440, 1920)

SCAN = r"""(() => {
  const out = [];
  document.querySelectorAll('h1,h2,h3,p,dd,blockquote').forEach(el => {
    if (!el.offsetWidth || el.closest('.mnav,[hidden],.svc-more,dialog')) return;
    const words = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const n = walk.currentNode, re = /[^\s ]+/g; let m;
      while ((m = re.exec(n.nodeValue))) {
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const b = r.getClientRects()[0]; if (b) words.push(Math.round(b.top));
      }
    }
    if (words.length < 3) return;
    const last = Math.max(...words);
    if (new Set(words).size > 1 && words.filter(t => Math.abs(t - last) < 4).length === 1)
      out.push('viúva: …' + el.textContent.trim().slice(-45));
    if (el.scrollWidth > el.clientWidth + 2) out.push('vazando: ' + el.textContent.trim().slice(0, 40));
  });
  if (document.documentElement.scrollWidth > innerWidth) out.push('rolagem lateral na página');
  return out;
})()"""

problems = 0
with sync_playwright() as p:
    browser = p.chromium.launch()
    for w in WIDTHS:
        page = browser.new_page(viewport={"width": w, "height": 900})
        page.goto(PAGE.as_uri()); page.wait_for_timeout(400)
        for y in range(0, page.evaluate("document.body.scrollHeight"), 600):   # rola para disparar as animações
            page.evaluate(f"scrollTo(0,{y})"); page.wait_for_timeout(15)
        page.wait_for_timeout(1200)
        found = page.evaluate(SCAN); problems += len(found)
        print(f"{w:>5}px  " + ("ok" if not found else " | ".join(found)))
        page.close()
    browser.close()
sys.exit(1 if problems else 0)
