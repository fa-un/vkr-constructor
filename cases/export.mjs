// Явная выгрузка кейса из конструктора: node cases/export.mjs cases/<кейс>.json
// Читает набор опций из JSON, прогоняет index.html в jsdom и пишет паспорт в cases/<кейс>.md.
// Зависимость: npm install jsdom (один раз, в корне репозитория).
import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
const html = readFileSync(resolve(here, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s);
const click = sel => { const e = $(sel); if (!e) throw new Error('нет элемента ' + sel); e.click(); };
const check = (sel, on) => { const e = $(sel); if (!e) throw new Error('нет элемента ' + sel); if (e.checked !== on && !e.disabled) e.click(); };
const type = (sel, v) => { const e = $(sel); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };

click(`input[name=form][value=${spec.form}]`);
click(`input[name=base][value=${spec.base}]`);
click(`input[name=sector][value=${spec.sector}]`);
click(`input[name=ptype][value=${spec.ptype}]`);
click(`input[name=process][value=${spec.process}]`);
type('#p-owner', spec.owner || ''); type('#p-exec', spec.exec || ''); type('#p-stake', spec.stake || '');
if (spec.topic) type('#p-topic', spec.topic);
click(`#asis-${spec.asis}`); click(`#tobe-${spec.tobe}`);
if (spec.contours) for (const c of d.querySelectorAll('input[name=contour]')) check('#' + c.id, spec.contours.includes(c.value));
for (const k of d.querySelectorAll('input[name=kpi]')) check('#' + k.id, (spec.kpi || []).includes(k.value));
for (const m of d.querySelectorAll('input[name=method]')) check('#' + m.id, (spec.methods || []).includes(m.value));
for (const b of d.querySelectorAll('input[name=babok]')) check('#' + b.id, b.disabled ? b.checked : (spec.babok || []).includes(b.value));
if (spec.pm) click(`#pm-${spec.pm}`);
check('#pm-evm', !!spec.evm);
for (const x of d.querySelectorAll('input[name=deliv]')) check('#' + x.id, (spec.deliv || []).includes(x.value));

const head = `<!-- Сформировано конструктором тем ВКР (https://fa-un.github.io/vkr-constructor/) из ${basename(process.argv[2])}: node cases/export.mjs.\n${spec.note || ''}\nРекомендуемая формулировка темы: «${spec.topic || $('#topic').textContent}». -->\n\n`;
const out = resolve(here, basename(process.argv[2]).replace(/\.json$/, '.md'));
writeFileSync(out, head + $('#md').value);
console.log(out, '|', $('#topic').textContent, '|', $('#meta').textContent.slice(0, 16));
const warn = [...d.querySelectorAll('#alerts .alert.warn')].map(x => x.textContent);
if (warn.length) console.log('предупреждения:\n' + warn.join('\n'));
