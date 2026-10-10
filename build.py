"""Monta index.html a partir de src/. Uso: python3 build.py"""
import re, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
page = (src / 'page.html').read_text()
mod = re.sub(r'^export ', '', (src / 'clinch3d.js').read_text(), flags=re.M) + (src / 'app3d.js').read_text()
ui = (src / 'ui.js').read_text()
body = page.replace('/*__MODULE__*/', mod).replace(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>\n<script>\n' + ui + '</script>')
head = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Sapatilhas Nike e Adidas e luvas Cleto Reyes e Rival originais, importadas dos EUA. Pré-venda aberta.">
<meta property="og:title" content="Clinch Supply">
<meta property="og:description" content="Equipamento de boxe de quem treina sério. Pré-venda de sapatilhas aberta.">
<meta name="theme-color" content="#0a0a0a">
'''
# título e links de fonte vão para o <head>; o resto vai para o <body>
m = re.match(r'(<title>.*?</title>\s*(?:<link[^>]*>\s*)*)(<style>.*?</style>)', body, re.S)
html = head + m.group(1) + m.group(2) + '\n</head>\n<body>\n' + body[m.end():] + '\n</body>\n</html>\n'
(root / 'index.html').write_text(html)
print('index.html', len(html), 'bytes')
