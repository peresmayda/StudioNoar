# Studio Noar

Site do Studio Noar: estúdio de identidade de marca, direção criativa, fotografia, produção audiovisual e sites para marcas criativas.

**No ar:** [studionoar.com](https://studionoar.com)

## Como funciona

É um site de uma página só, feito em HTML, CSS e JavaScript puros, sem bibliotecas e sem etapa de build. Cada alteração enviada para a branch `main` no GitHub é publicada sozinha pela Vercel em cerca de um minuto.

## Estrutura

```
index.html                 a página inteira (conteúdo e logos embutidos)
assets/
  css/style.css            todos os estilos
  js/main.js               todo o comportamento (abertura, menu, serviços, projetos, formulário)
  img/
    og-image.jpg           imagem de prévia ao compartilhar o link (1200 × 630)
    projetos/<projeto>/    fotos de cada projeto, em WebP
  logo/                    logos originais em SVG (vermelho), para usar em outras peças
scripts/
  checar-viuvas.py         confere viúvas e texto vazando em 13 larguras de tela
favicon.svg                ícone da aba
favicon-32.png             ícone da aba para navegadores antigos
apple-touch-icon.png       ícone ao salvar o site na tela do celular
robots.txt, sitemap.xml    orientações para o Google
```

Os ícones, o `robots.txt` e o `sitemap.xml` ficam na raiz porque é lá que navegadores e buscadores procuram por eles.

## Seções da página

1. **Abertura:** painel amarelo com o menu, o selo que segue o mouse e o logo; ao lado, fotos dos projetos que se alternam.
2. **Frase e O estúdio:** "As histórias começam aqui." e o texto que escurece conforme a rolagem.
3. **Serviços (05):** no computador, a descrição aparece ao lado quando o mouse passa por cima; no celular, abre ao tocar.
4. **Método MENU (04):** cards empilhados como uma pasta.
5. **Projetos:** lista; cada projeto abre em tela cheia.
6. **Contato:** o formulário monta uma mensagem e abre o WhatsApp do estúdio.

## Adicionar um projeto

1. Converter as fotos para WebP, com até 2000 px no lado maior, e salvar em `assets/img/projetos/<nome-do-projeto>/`. A capa da lista deve ter 900 × 600 px.
2. Em `index.html`, na seção Projetos, copiar a linha `<li>` da EWM e trocar o nome, as informações, a capa e o `data-open`.
3. Copiar o bloco `<dialog id="proj-ewm">` e trocar o `id` (o mesmo valor do `data-open`), os textos e as fotos da galeria. Uma foto sozinha fica em `<figure class="full">`; duas lado a lado ficam num `<div class="pair">` com a proporção (largura ÷ altura) de cada foto em `--a` e `--b`.
4. Na abertura (`.reel`), incluir uma ou duas fotos do projeto, cada uma num `<figure>` com a legenda.
5. Atualizar o número entre parênteses no título da seção Projetos.

## Antes de publicar

```
pip install playwright
python3 scripts/checar-viuvas.py
```

Tudo certo quando todas as larguras mostram `ok`.
