// Слово дня - віджет для Scriptable (iPhone, безплатний застосунок Scriptable з App Store).
// Як поставити: Scriptable → «+» → вставити цей код → назвати «Слово дня» → на екрані iPhone
// утримати палець → «+» → Scriptable → обрати розмір → у налаштуваннях віджета Script = «Слово дня».
// Це короткий завантажувач: саму логіку (widget-logic.js) він щоразу бере з сайту, тому
// нові слова й правила доходять на телефон без повторного копіювання коду.
// Показує слова з уроків англійської частіше (2 з 3), ставить сповіщення щогодини 8-22
// з кнопками «Знаю» і «Ще раз». Працює на всіх розмірах і на екрані блокування.

const BASE = "https://hizhinskayanina-ops.github.io/slovo-dnia/";
const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), "slovo-dnia-logic.js");
try {
  const code = await new Request(BASE + "widget-logic.js?v=" + Date.now()).loadString();
  if (code && code.includes("module.exports.run")) fm.writeString(path, code);
} catch (e) { /* офлайн - працюємо з попередньою копією */ }
const logic = importModule(path);
await logic.run();
