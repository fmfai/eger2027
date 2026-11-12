#!/usr/bin/env python3
"""Compile trusted LaTeX abstracts using Pandoc, then regenerate the listing.
Run with `python scripts/build_abstracts.py`. GitHub Actions will use this script.
"""
import json, html, subprocess, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=(ROOT/'abstracts.html').read_text(encoding='utf-8')
if '<!-- GENERATED_ABSTRACTS_START -->' not in base:
    print('Abstracts listing is in Coming soon mode; leaving it unchanged.')
    raise SystemExit(0)
start=base.index('<!-- GENERATED_ABSTRACTS_START -->')+len('<!-- GENERATED_ABSTRACTS_START -->')
end=base.index('<!-- GENERATED_ABSTRACTS_END -->',start)
sub=base[:base.index('<main class="container main">')]
footer=base[base.index('</main>')+7:]
# The header/footer resource URLs are relative to the site root; retarget for /abstracts/.
for x in ['index.html','invited-lectures.html','important-dates.html','submission.html','abstracts.html','program.html','venue.html','fees.html','registration.html','committees.html','privacy.html','downloads/FMF_AI_2025_Program.pdf','assets/fmf-ai-sigmoid-logo.png','assets/fmf-ai-sigmoid-symbol.png','assets/university.png','assets/style.css','assets/site.js','assets/settings.js']:
    sub=sub.replace('"'+x+'"','"../'+x+'"')
    footer=footer.replace('"'+x+'"','"../'+x+'"')
entries=json.loads((ROOT/'abstracts/entries.json').read_text(encoding='utf-8'))
links=[]
for data in entries:
    slug=data['slug']
    if not re.fullmatch(r'[A-Za-z0-9_-]+',slug):raise ValueError('Invalid slug')
    tex=(ROOT/'abstracts'/data['source']).resolve()
    if tex.suffix!='.tex' or tex.parent!=(ROOT/'abstracts').resolve():raise ValueError('Invalid source path')
    fragment=subprocess.run(['pandoc','-f','latex','-t','html5','--mathjax',str(tex)],check=True,text=True,capture_output=True).stdout
    title=html.escape(data['title']);authors=html.escape(data['authors']);inst=html.escape(data['institution'])
    kind='Technical example — not an accepted contribution' if data.get('kind')=='example' else 'Conference abstract'
    content=f'<main class="container main"><p><a href="../abstracts.html">← Abstracts</a></p><div class="example-label">{kind}</div><article class="abstract-body"><h1>{title}</h1><p class="muted">{authors} · {inst}</p><div class="tex-content">{fragment}</div></article></main>'
    mathjax='<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"],["$","$"]],displayMath:[["\\\\[","\\\\]"]]}}</script><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>'
    (ROOT/'abstracts'/f'{slug}.html').write_text(sub+content+footer.replace('</body>',mathjax+'</body>'),encoding='utf-8')
    # A searchable / sortable author-first list. Escaped metadata are safe in attributes.
    author_attr=html.escape(data['authors'],quote=True)
    title_attr=html.escape(data['title'],quote=True)
    label=f'<div class="example-label">{kind}</div>' if data.get('kind')=='example' else ''
    links.append(f'<article class="abstract-entry" data-author="{author_attr}" data-title="{title_attr}">{label}<div class="abstract-author">{authors}</div><h2><a href="abstracts/{slug}.html">{title}</a></h2></article>')
updated=base[:start]+''.join(links)+base[end:]
(ROOT/'abstracts.html').write_text(updated,encoding='utf-8')
print('Built',len(entries),'abstract(s)')
