import assert from "node:assert/strict";
import test from "node:test";
import { parseNovelJson } from "./parse-novel";

test("parses a simple Arabic JSON novel", () => {
  const result = parseNovelJson(`{
    "title": "سقف من نحاس",
    "author": "مثال",
    "chapters": [
      { "title": "واحد", "text": "فقرة أولى.\\n\\nفقرة ثانية." },
      { "title": "اثنان", "text": "فقرة واحدة." }
    ]
  }`);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.novels.length, 1);
  assert.equal(result.novels[0].title.ar, "سقف من نحاس");
  assert.equal(result.novels[0].chapters.length, 2);
  assert.equal(result.novels[0].chapters[0].paragraphs.length, 2);
  assert.equal(result.novels[0].imported, true);
});

test("parses bilingual objects and a novels array", () => {
  const result = parseNovelJson(`{
    "novels": [{
      "slug": "red-gate",
      "title": { "ar": "الباب", "en": "The Gate" },
      "chapters": [{
        "id": "a",
        "title": { "ar": "ليل", "en": "Night" },
        "paragraphs": [{ "ar": "نص عربي", "en": "English text" }]
      }]
    }]
  }`);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.novels[0].slug, "red-gate");
  assert.equal(result.novels[0].title.en, "The Gate");
  assert.equal(result.novels[0].chapters[0].id, "a");
  assert.equal(result.novels[0].chapters[0].paragraphs[0].en, "English text");
});

test("parses pages[] dumps with chapterNumber", () => {
  const result = parseNovelJson(`{
    "id": "sample-1",
    "title": "سقف من نحاس",
    "pages": [
      {
        "chapterNumber": 1,
        "number": 1,
        "title": "سقف من نحاس - Chapter 1: طرقات فوق الرأس",
        "text": "سطر أول.\\nسطر ثان."
      },
      {
        "chapterNumber": 2,
        "number": 2,
        "title": "Chapter 2: دفتر السقف",
        "text": "فقرة واحدة."
      }
    ]
  }`);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.novels[0].chapters.length, 2);
  assert.equal(result.novels[0].chapters[0].id, "1");
  assert.equal(result.novels[0].chapters[0].title.ar.includes("طرقات فوق الرأس"), true);
  assert.ok(result.novels[0].chapters[0].paragraphs.length >= 2);
});

test("rejects aggregator dumps from freewebnovel", () => {
  const result = parseNovelJson(`{
    "title": "Anything",
    "source": "freewebnovel.com",
    "startUrl": "https://freewebnovel.com/novel/example/chapter-1",
    "pages": [{ "chapterNumber": 1, "title": "Ch 1", "text": "hello" }]
  }`);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "blocked-source");
});
