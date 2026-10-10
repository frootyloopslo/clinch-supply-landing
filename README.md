# Clinch Supply, landing page

Site estático da Clinch Supply: vitrine de sapatilhas e luvas de boxe com fotos de produto recortadas e animações (GSAP).

- `index.html`: o site publicado (gerado, não edite à mão)
- `src/page.html`: estrutura e estilos
- `src/app.js`: catálogo (produtos, cores, preços), contato da loja e interações
- `fotos/`: fotos já recortadas que o site usa (`modelo-cor.webp`)
- `fotos/originais/`: fotos originais, antes do recorte
- `tools/recortar.py`: tira o fundo das fotos de `fotos/originais/` e salva em `fotos/`

Para alterar: edite os arquivos em `src/` e rode `python3 build.py` para gerar o `index.html`.
Para trocar fotos: coloque a original em `fotos/originais/` com o nome certo e rode `python3 tools/recortar.py`
(precisa de `pip install "rembg[cpu]" pillow numpy scipy`).
Para ligar o WhatsApp: preencha `CONTATO.whatsapp` no começo de `src/app.js`.

Publicado pelo GitHub Pages (branch `main`, pasta raiz).
