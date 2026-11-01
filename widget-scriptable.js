// Слово дня - віджет для Scriptable (iPhone, безплатний застосунок Scriptable з App Store).
// Як поставити: Scriptable → «+» → вставити цей код → назвати «Слово дня» → на екрані iPhone
// утримати палець → «+» → Scriptable → обрати розмір → у налаштуваннях віджета Script = «Слово дня».
// Віджет показує те саме слово дня, що й застосунок. Також ставить нагадування щоранку о 8:00.
// Працює на всіх розмірах: малий, середній, великий і на екрані блокування.

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
n.title = nw.en + " - " + nw.uk;
n.subtitle = nw.ex;
n.body = nw.asoc ? "💡 " + nw.asoc : "";
n.openURL = URL_APP;
n.setTriggerDate(next);
await n.schedule();

// Віджет
const family = config.widgetFamily || "large";
const emerald = new Color("#1E4D3F");
const white = Color.white();
const mint = new Color("#CDE8DB");
const wd = new ListWidget();
wd.url = URL_APP;

if (family === "accessoryRectangular" || family === "accessoryInline" || family === "accessoryCircular") {
  // Екран блокування: дуже мало місця, лише слово й переклад
  wd.setPadding(2, 4, 2, 4);
  if (family === "accessoryInline") {
    const t = wd.addText(w.en + " · " + w.uk); t.font = Font.mediumSystemFont(13); t.lineLimit = 1;
  } else {
    const en = wd.addText(w.en); en.font = Font.boldSystemFont(15); en.lineLimit = 1; en.minimumScaleFactor = 0.7;
    const uk = wd.addText(w.uk); uk.font = Font.systemFont(12); uk.lineLimit = 2; uk.minimumScaleFactor = 0.8;
  }
} else {
  wd.backgroundColor = emerald;
  const big = family === "large";
  const small = family === "small";
  wd.setPadding(big ? 22 : 16, big ? 22 : 16, big ? 20 : 14, big ? 22 : 16);

  const tag = wd.addText(("слово дня · " + w.tag).toUpperCase());
  tag.font = Font.semiboldSystemFont(small ? 9 : 11); tag.textColor = mint;
  wd.addSpacer(small ? 6 : 10);

  const en = wd.addText(w.en);
  en.font = Font.boldSystemFont(big ? 34 : small ? 20 : 26); en.textColor = white; en.minimumScaleFactor = 0.6; en.lineLimit = 2;
  wd.addSpacer(small ? 3 : 6);

  const uk = wd.addText(w.uk);
  uk.font = Font.regularSystemFont(big ? 20 : small ? 13 : 16); uk.textColor = white; uk.lineLimit = small ? 2 : 2;

  if (!small) {
    wd.addSpacer(big ? 16 : 10);
    const ex = wd.addText(w.ex);
    ex.font = Font.italicSystemFont(big ? 17 : 13); ex.textColor = mint; ex.lineLimit = big ? 3 : 2;
    if (big) {
      const exuk = wd.addText(w.ex_uk);
      exuk.font = Font.lightSystemFont(14); exuk.textColor = mint; exuk.lineLimit = 2;
      if (w.asoc) {
        wd.addSpacer(16);
        const as = wd.addText("💡 " + w.asoc);
        as.font = Font.regularSystemFont(14); as.textColor = white; as.lineLimit = 3;
      }
    }
  }
  wd.addSpacer();
}

// Оновлювати не частіше, ніж раз на годину
wd.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);

if (config.runsInWidget) Script.setWidget(wd); else await wd.presentLarge();
Script.complete();
