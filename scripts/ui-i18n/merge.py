# Merges scripts/ui-i18n/<lang>.txt (one translated value per line, same order as keys.txt) into src/i18n/locales/<lang>.json.
# Machine-assisted drafts: need native-speaker review. Placeholders must match English.
import json, re, sys
keys = open('scripts/ui-i18n/keys.txt', encoding='utf8').read().split('\n')[:-1]
en = json.load(open('src/i18n/locales/en.json'))
ph = lambda s: sorted(re.findall(r'\{\w+\}', s))
for lang in sys.argv[1:]:
    vals = open(f'scripts/ui-i18n/{lang}.txt', encoding='utf8').read().split('\n')
    if vals and vals[-1] == '': vals.pop()
    assert len(vals) == len(keys), (lang, len(vals), len(keys))
    p = f'src/i18n/locales/{lang}.json'; d = json.load(open(p))
    for k, v in zip(keys, vals):
        assert v.strip(), (lang, k)
        assert ph(v) == ph(en[k]), (lang, k, v, en[k])
        d[k] = v
    json.dump(dict(sorted(d.items())), open(p, 'w'), ensure_ascii=False, indent=2); open(p, 'a').write('\n')
    print(lang, len(d), 'keys')
