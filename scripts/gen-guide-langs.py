# Generates content/{es,fr,ar,hi,zh}/ from the English guides + scripts/guides-i18n/<lang>.py (machine-assisted drafts).
# Every output is status: draft, needsReview: true. Counts of translated lists must match the English source.
import sys, re, glob, json, importlib.util, os, yaml
SRC = {'es': 'A verificar: traducción automática, sin revisión de hablante nativo', 'fr': 'À vérifier : traduction automatique, sans relecture par un locuteur natif',
       'ar': 'يحتاج تحققاً: ترجمة آلية دون مراجعة متحدث أصلي', 'hi': 'सत्यापन चाहिए: मशीन अनुवाद, मूल वक्ता की समीक्षा नहीं', 'zh': '待核实：机器翻译，未经母语者审校'}
def load_en():
    out = {}
    for f in glob.glob('content/en/**/*.md', recursive=True):
        raw = open(f, encoding='utf8').read()
        _, fm, body = raw.split('---\n', 2)
        d = yaml.safe_load(fm); d['_body'] = [l[2:].strip() for l in body.splitlines() if l.startswith('- ')]; d['_file'] = f
        out[d['id']] = d
    return out
def q(x): return json.dumps(x, ensure_ascii=False)
def lst(xs): return '[]' if not xs else '\n' + '\n'.join(f'  - {q(x)}' for x in xs)
def main(lang):
    spec = importlib.util.spec_from_file_location(lang, f'scripts/guides-i18n/{lang}.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    T, en = m.T, load_en()
    assert set(T) == set(en), (lang, set(T) ^ set(en))
    for id, e in en.items():
        t = T[id]; title, summary, warning, now, mistakes, understand = t[:6]
        mats, tags = (t[6], t[7]) if len(t) > 6 else (e.get('materials', []), e.get('tags', []))
        for name, a, b in (('now', now, e.get('now', [])), ('mistakes', mistakes, e.get('mistakes', [])), ('understand', understand, e['_body']), ('materials', mats, e.get('materials', []))):
            assert len(a) == len(b), (lang, id, name, len(a), len(b))
        assert bool(warning) == bool(e.get('warning')), (lang, id, 'warning')
        out = f"""---
id: {id}
kind: {e['kind']}
category: {e['category']}
plan: free
vital: {str(e['vital']).lower()}
status: draft
needsReview: true
title: {q(title)}
summary: {q(summary)}
minutes: {e.get('minutes', 0)}
""" + (f"difficulty: {e['difficulty']}\n" if e.get('difficulty') else '') + (f"warning: {q(warning)}\n" if warning else '') + f"""now: {lst(now)}
materials: {lst(mats)}
related: [{', '.join(e.get('related', []))}]
mistakes: {lst(mistakes)}
review:
  date: 2026-11-19
  level: draft
  source: {q(SRC[lang])}
tags: {lst(tags)}
---
""" + ''.join(f'- {x}\n' for x in understand)
        out = re.sub(r'(now|mistakes|materials|tags): \n', r'\1:\n', out)
        path = e['_file'].replace('content/en/', f'content/{lang}/', 1)
        os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w', encoding='utf8').write(out)
    print(lang, 'written', len(en))
if __name__ == '__main__':
    for l in sys.argv[1:]: main(l)
