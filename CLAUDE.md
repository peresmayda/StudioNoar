# Studio Noar: instruções para o Claude

Site do estúdio de Mayda Peres. Veja o `README.md` para a estrutura de pastas e o passo a passo de adicionar um projeto. Responda sempre em português.

## Regras que não mudam

- **Nunca deixar viúvas** (uma palavra sozinha na última linha), em nenhum formato e em nenhuma largura de tela. O CSS usa `text-wrap: balance/pretty`, e o primeiro bloco de `assets/js/main.js` liga as duas últimas palavras de cada texto com espaço não separável. Antes de cada push, rode `python3 scripts/checar-viuvas.py`.
- **Texto direto e seco**, sem clichê e sem tom de venda. O site fala "a gente" quando é o estúdio e "trabalhei" quando é o relato de um projeto.
- **Conferir sempre no computador e no celular**: tirar print em 1440 px e em 390 px antes de dizer que terminou.
- **Colaboração consultiva**: quando um pedido tiver mais de uma leitura, apresente as opções e pergunte antes de mudar algo grande.

## Identidade

- **Cores** (variáveis em `:root`):
  - `--red` #E61E19
  - `--blue` #0078D0
  - `--yellow` #FFCF1F
  - `--cream` #FFFFFA
  - `--ink` #000
  - `--stone`, mistura de creme e preto
- **Fonte:** Inter Tight, no lugar da Helvetica Now. Títulos em peso 600–700 com letter-spacing negativo.
- **Formas:** cantos retos (`--r: 0px`) e botões sempre em pílula com borda de 1,5 px. No hover, o botão fica azul.
- **Logos:** ficam embutidos no `index.html` como SVG com `fill="currentColor"`, para mudar de cor pelo CSS. São três: na barra do celular, no selo e no logo da abertura. Os originais estão em `assets/logo/`. Não use `<use>` para reaproveitar o logo, porque não renderizou.
- **Movimento:** easing `--ease: cubic-bezier(.32,.72,0,1)`. Tudo respeita `prefers-reduced-motion`. O zoom ao passar o mouse só existe em `(hover:hover)`, e na abertura ele age só na foto: a legenda nunca se move junto.

## O que já foi testado e descartado (não propor de novo)

- Imagens que se movem em velocidades diferentes ao rolar (parallax).
- Animação de rolagem na foto da abertura.
- Carrossel na seção O estúdio.
- Moldura vermelha na abertura.
- Seção de citação.
- CTA no meio da página.
- Logo grande no rodapé.
- Contador ou tracinhos no slideshow da abertura.
- Linhas separando os serviços no celular.

Os serviços no computador devem ficar como estão: nomes grandes e descrição ao lado.

## Publicação

- Repositório: github.com/peresmayda/StudioNoar, branch `main`. A Vercel publica sozinha a cada push.
- Domínio studionoar.com, com DNS na GoDaddy: registro A `@` → 216.198.79.1 e CNAME `www` apontando para a Vercel.
- Commits com autoria `Mayda Peres <peres.mayda@gmail.com>`.

## Detalhes que quebram fácil

- O formulário não envia dados para lugar nenhum: ele monta uma mensagem e abre `wa.me/5522992132258`. Não trocar o texto do aviso para "recebido".
- No celular (até 900 px), a barra fixa `.mbar` tem altura `--bar` (60 px). Elementos fixos ou grudados no topo precisam descontar essa altura.
- Os cards do MENU usam `position: sticky` com alturas escalonadas. Mudar alturas ou o `--peek` pode fazer um card cobrir o título do anterior.
- Os títulos `.rise` têm `padding-bottom` negativo compensado para não cortar o "j" e o "ç".
- Ao mudar textos, serviços ou projetos, atualizar também a descrição e o JSON-LD no `<head>` e a data em `sitemap.xml`.

## Pendências

- "Sabor e Cia." e "Fominha" são projetos de exemplo, com imagens em retícula. Perguntar se devem sair ou ser trocados por projetos reais.
- O favicon pode ficar mais legível usando só o "N".
- Search Console: a Mayda ia verificar o domínio e enviar o `sitemap.xml`.
