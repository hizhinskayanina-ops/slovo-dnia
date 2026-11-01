// Слово дня - віджет для Scriptable (iPhone, безплатний застосунок Scriptable з App Store).
// Як поставити: Scriptable → «+» → вставити цей код → назвати «Слово дня» → на екрані iPhone
// утримати палець → «+» → Scriptable → середній розмір → обрати скрипт «Слово дня».
// Віджет показує те саме слово дня, що й застосунок, і ставить нагадування щоранку о 8:00.

const URL_WORDS = "https://hizhinskayanina-ops.github.io/slovo-dnia/words.json";
const URL_APP = "https://hizhinskayanina-ops.github.io/slovo-dnia/";
const HOUR = 8, MINUTE = 0;

const req = new Request(URL_WORDS + "?v=" + Date.now());
const data = await req.loadJSON();
const words = data.words;

function seededOrder(n, seed) {
  const arr = [...Array(n).keys()];
  let s = seed;
  for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
const DAY = 86400000;
function dayIndexOf(date) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); return Math.floor(d.getTime() / DAY); }
const order = seededOrder(words.length, 2027);
function wordFor(date) { return words[order[dayIndexOf(date) % words.length]]; }

const w = wordFor(new Date());

// Нагадування: наступне 8:00 зі словом того дня
const next = new Date(); next.setHours(HOUR, MINUTE, 0, 0);
if (next <= new Date()) next.setDate(next.getDate() + 1);
const nw = wordFor(next);
await Notification.removePending(["slovo-dnia"]);
const n = new Notification();
n.identifier = "slovo-dnia";
n.title = nw.en;
n.subtitle = nw.uk;
n.body = nw.ex;
n.openURL = URL_APP;
n.setTriggerDate(next);
await n.schedule();

// Віджет
const emerald = new Color("#1E4D3F");
const wd = new ListWidget();
wd.backgroundColor = Color.white();
wd.url = URL_APP;
wd.setPadding(16, 16, 14, 16);

const tag = wd.addText(("слово дня · " + w.tag).toUpperCase());
tag.font = Font.mediumSystemFont(10); tag.textColor = emerald;
wd.addSpacer(6);
const en = wd.addText(w.en);
en.font = Font.boldSystemFont(22); en.textColor = Color.black(); en.minimumScaleFactor = 0.6; en.lineLimit = 2;
wd.addSpacer(3);
const uk = wd.addText(w.uk);
uk.font = Font.lightSystemFont(14); uk.textColor = new Color("#333333"); uk.lineLimit = 2;
wd.addSpacer(8);
const ex = wd.addText(w.ex);
ex.font = Font.italicSystemFont(12); ex.textColor = new Color("#5E655F"); ex.lineLimit = 2;

// Оновлювати не частіше, ніж раз на годину
wd.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);

if (config.runsInWidget) Script.setWidget(wd); else await wd.presentMedium();
Script.complete();
