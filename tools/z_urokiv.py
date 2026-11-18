"""Синхронізує «Слово дня» з тим, що зараз вчиться на уроках англійської.

Бере ../../anhliiska/uroky/aktyvni-slova.json (оновлює чат «Англійська» після кожного уроку),
знаходить ці слова в words.json і записує їхні id у поле "fokus". Віджет і застосунок показують
слова з "fokus" у двох слотах із трьох (два сповіщення з трьох), решту словника - у третьому.

Слова, яких ще немає в words.json, скрипт лише перелічує: їх треба додати вручну з прикладом
(ex, ex_uk) і асоціацією (asoc), tag "урок". Репозиторій публічний - нічого особистого.

Запуск: python tools/z_urokiv.py        (показати, що зміниться)
        python tools/z_urokiv.py --push (записати, закомітити й запушити)
"""
import json, pathlib, subprocess, sys, time

HERE = pathlib.Path(__file__).resolve().parent.parent
WORDS = HERE / "words.json"
UROK = HERE.parent / "anhliiska" / "uroky" / "aktyvni-slova.json"


def norm(s):
    s = s.lower().strip()
    return s[3:] if s.startswith("to ") else s


def main():
    d = json.loads(WORDS.read_text(encoding="utf-8"))
    u = json.loads(UROK.read_text(encoding="utf-8"))
    by = {norm(w["en"]): w["id"] for w in d["words"]}
    fokus, ne_vystachaie = [], []
    for w in u["slova"]:
        i = by.get(norm(w["en"]))
        (fokus.append(i) if i else ne_vystachaie.append(w["en"]))
    # незрозумілі на уроці - двічі, щоб траплялися частіше
    dvichi = [by[norm(w["en"])] for w in u["slova"] if w.get("nezrozumile") and norm(w["en"]) in by]
    d["fokus"] = fokus
    d["fokus_dvichi"] = dvichi
    d["fokus_tema"] = (u.get("blok", "") + " " + u.get("blok_nazva", "")).strip()[:120]
    d["version"] = time.strftime("%Y-%m-%d")
    print(f"fokus: {len(fokus)} слів, з них частіше {len(dvichi)}")
    if ne_vystachaie:
        print("НЕМАЄ в words.json (додати з ex/ex_uk/asoc, tag «урок»):", "; ".join(ne_vystachaie))
    if "--push" in sys.argv:
        WORDS.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
        g = lambda *a: subprocess.run(["git", *a], cwd=HERE, capture_output=True, text=True, encoding="utf-8")
        g("add", "words.json")
        c = g("-c", "user.name=Yanina Hizhinska", "-c", "user.email=hizhinskayanina@gmail.com",
              "commit", "-m", "Слова з уроків " + d["version"])
        p = g("push")
        print("commit:", (c.stdout or c.stderr).strip()[:200])
        print("push:", "ok" if p.returncode == 0 else p.stderr.strip()[:300])


if __name__ == "__main__":
    main()
