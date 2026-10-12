"""Recorta o fundo das fotos de produto.

Uso: python3 tools/recortar.py [pasta_entrada] [pasta_saida]
Padrão: fotos/originais -> fotos/

Cada foto vira um .webp com fundo transparente, cortado rente ao produto,
com no máximo 1400 px no lado maior. O nome do arquivo é mantido
(ex.: hyperko-preta.jpg -> hyperko-preta.webp), e é esse nome que o site usa.
Precisa de: pip install "rembg[cpu]" pillow numpy scipy
"""
import sys, pathlib, subprocess
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from rembg import new_session, remove

MAX = 1400
MODEL = 'birefnet-general'

def fundo_claro(rgb):
    borda = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    return borda.min(axis=1).mean() > 225

def mask_branco(rgb, tol=10):
    """Fundo claro ligado à borda da foto (para fotos de estúdio em fundo branco)."""
    a = np.asarray(rgb).astype(int)
    claro = (a.min(axis=2) > 255 - tol) & (a.max(axis=2) - a.min(axis=2) < 14)
    lab, _ = ndimage.label(claro)
    borda = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    return np.isin(lab, borda[borda > 0])

def recortar(src, session):
    im = Image.open(src).convert('RGB')
    if max(im.size) > 2600:
        im.thumbnail((2600, 2600), Image.LANCZOS)
    alpha = np.asarray(remove(im, session=session, only_mask=True)).astype(np.float32) / 255
    rgb = np.asarray(im).astype(np.float32)
    h, w = alpha.shape
    # A IA às vezes deixa "furos" em partes brancas do produto (cadarço, sola).
    # Fecha e preenche o contorno do produto e devolve opacidade total ao miolo.
    k = max(2, int(min(h, w) * 0.012))
    corpo = ndimage.binary_fill_holes(ndimage.binary_closing(alpha > 0.5, iterations=k))
    if fundo_claro(rgb):
        # em fundo branco, o que é claro e liga na borda é fundo de verdade: não preencher
        corpo &= ~mask_branco(im)
        corpo = ndimage.binary_fill_holes(corpo)
    miolo = ndimage.binary_erosion(corpo, iterations=3)
    alpha = np.maximum(alpha, miolo.astype(np.float32))
    # aperta 1 px a borda e tira o halo da cor do fundo
    alpha = np.clip((alpha - 0.12) / 0.88, 0, 1)
    bg = np.median(np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]), axis=0)
    a3 = np.maximum(alpha, 0.05)[..., None]
    borda = (alpha > 0) & (alpha < 0.98)
    limpo = np.clip((rgb - (1 - a3) * bg) / a3, 0, 255)
    rgb = np.where(borda[..., None], limpo, rgb)
    im = Image.fromarray(rgb.astype(np.uint8))
    a8 = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8))
    out = im.convert('RGBA'); out.putalpha(a8)
    bbox = a8.point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        out = out.crop(bbox)
    out.thumbnail((MAX, MAX), Image.LANCZOS)
    return out

def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    entrada = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'fotos' / 'originais'
    saida = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root / 'fotos'
    saida.mkdir(parents=True, exist_ok=True)
    fotos = sorted(p for p in entrada.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'))
    if not fotos:
        print('Nenhuma foto em', entrada); return
    # uma foto por processo: o modelo acumula memória entre fotos e estoura a RAM
    for p in fotos:
        subprocess.run([sys.executable, __file__, '--uma', str(p), str(saida)], check=True)

def uma(p, saida):
    p, saida = pathlib.Path(p), pathlib.Path(saida)
    out = recortar(p, new_session(MODEL))
    dst = saida / (p.stem + '.webp')
    out.save(dst, 'WEBP', quality=86, method=6)
    print(f'{p.name} -> {dst.name} {out.size[0]}x{out.size[1]}', flush=True)

if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == '--uma':
        uma(sys.argv[2], sys.argv[3])
    else:
        main()
