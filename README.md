# Clinch Supply, landing page

Site estático da Clinch Supply. A primeira tela é um provador: escolha categoria, modelo, cor e número (ou peso da luva) sem rolar; o guia de onças abre num painel. Abaixo, uma rolagem curta: a coleção passa na horizontal (clicar num card leva o produto para o provador), como funciona a compra e o fechamento com o WhatsApp da loja. Animações com GSAP e ScrollTrigger.

Atalhos: setas ←/→ (ou o gesto lateral do trackpad sobre a foto) trocam a cor, ↑/↓ trocam o modelo. O endereço guarda a escolha (ex.: `#hyperko-branca-dourada`), então dá para mandar o link de um produto.

- `index.html`: o site publicado (gerado, não edite à mão)
- `src/page.html`: estrutura e estilos
- `src/app.js`: catálogo (produtos, cores, preços), contato da loja e interações
- `fotos/`: fotos já recortadas que o site usa (`modelo-cor.webp`)
- `fotos/originais/`: fotos originais, antes do recorte
- `tools/recortar.py`: tira o fundo das fotos de `fotos/originais/` e salva em `fotos/`

Para alterar: edite os arquivos em `src/` e rode `python3 build.py` para gerar o `index.html`.
Para trocar fotos: coloque a original em `fotos/originais/` com o nome certo e rode `python3 tools/recortar.py`
(precisa de `pip install "rembg[cpu]" pillow numpy scipy`).
Para trocar o WhatsApp: edite `CONTATO.whatsapp` no começo de `src/app.js` e o número escrito na seção de contato em `src/page.html`.

Publicado pelo GitHub Pages (branch `main`, pasta raiz).
