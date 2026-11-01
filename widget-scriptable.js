// Слово дня - віджет для Scriptable (iPhone, безплатний застосунок Scriptable з App Store).
// Як поставити: Scriptable → «+» → вставити цей код → назвати «Слово дня» → на екрані iPhone
// утримати палець → «+» → Scriptable → обрати розмір → у налаштуваннях віджета Script = «Слово дня».
// Віджет показує те саме слово дня, що й застосунок. Також ставить нагадування щоранку о 8:00.
// Працює на всіх розмірах: малий, середній, великий і на екрані блокування.

const URL_WORDS = "https://hizhinskayanina-ops.github.io/slovo-dnia/words.json";
const URL_APP = "https://hizhinskayanina-ops.github.io/slovo-dnia/";

const req = new Request(URL_WORDS + "?v=" + Date.now());
const data = await req.loadJSON();
const words = data.words;

function seededOrder(n, seed) {
  const arr = [...Array(n).keys()];
  let s = seed;
  for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
const SLOT_MIN = 30;            // нове слово кожні 30 хвилин
const NOTIFY_FROM = 8, NOTIFY_TO = 22;  // сповіщення щогодини в цьому вікні
const SLOT_MS = SLOT_MIN * 60000;
const order = seededOrder(words.length, 2027);
function slotOf(date) { return Math.floor(date.getTime() / SLOT_MS); }
function wordAt(date) { return words[order[slotOf(date) % words.length]]; }

const now = new Date();
const w = wordAt(now);

// Сповіщення: щогодини з NOTIFY_FROM до NOTIFY_TO на найближчу добу, кожне зі своїм словом
const ids = [];
for (let h = 0; h < 24; h++) ids.push("slovo-" + h);
await Notification.removePending(ids);
for (let h = NOTIFY_FROM; h <= NOTIFY_TO; h++) {
  const t = new Date(); t.setHours(h, 0, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  const nw = wordAt(t);
  const n = new Notification();
  n.identifier = "slovo-" + h;
  n.title = nw.en + " - " + nw.uk;
  n.subtitle = nw.ex;
  n.body = nw.asoc ? "💡 " + nw.asoc : "";
  n.openURL = URL_APP;
  n.addAction("Знаю ✓", URL_APP + "?id=" + nw.id + "&grade=ok", false);
  n.addAction("Ще раз", URL_APP + "?id=" + nw.id + "&grade=again", false);
  n.setTriggerDate(t);
  await n.schedule();
}

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

  const tag = wd.addText(("слово · " + w.tag).toUpperCase());
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

  // Дві зони-кнопки: кожна відкриває застосунок і записує оцінку цього слова
  if (!small) {
    const row = wd.addStack(); row.layoutHorizontally(); row.spacing = 10;
    const mk = (label, grade) => {
      const b = row.addStack(); b.layoutHorizontally(); b.centerAlignContent();
      b.setPadding(big ? 10 : 7, 12, big ? 10 : 7, 12); b.cornerRadius = 12;
      b.backgroundColor = grade === "ok" ? white : new Color("#FFFFFF", 0.18);
      b.url = URL_APP + "?id=" + w.id + "&grade=" + grade;
      b.addSpacer();
      const t = b.addText(label); t.font = Font.semiboldSystemFont(big ? 15 : 13);
      t.textColor = grade === "ok" ? emerald : white;
      b.addSpacer();
    };
    mk("✗ Ще раз", "again");
    mk("✓ Знаю", "ok");
  }
}

// Оновити на межі наступного 30-хвилинного слота (iOS може трохи затримати)
wd.refreshAfterDate = new Date((slotOf(now) + 1) * SLOT_MS);

if (config.runsInWidget) Script.setWidget(wd); else await wd.presentLarge();
Script.complete();
