"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addImported } from "@/lib/imported";
import { parseNovelJson } from "@/lib/parse-novel";
import { useLanguage } from "./LanguageProvider";

const SAMPLE_HREF = "/examples/hikaya-novel.sample.json";

export function ImportPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [dragging, setDragging] = useState(false);

  function ingest(text: string) {
    const result = parseNovelJson(text);
    if (!result.ok) {
      setOk("");
      setError(t("importError"));
      return;
    }
    const [first] = addImported(result.novels);
    setError("");
    setOk(t("importSuccess"));
    if (first) router.push(`/n/${first.slug}`);
  }

  async function fromFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".json") && file.type && file.type !== "application/json") {
      setError(t("importError"));
      return;
    }
    if (file.size > 2_000_000) {
      setError(t("importError"));
      return;
    }
    ingest(await file.text());
  }

  return (
    <section className={compact ? "" : "mx-auto w-full max-w-3xl px-4 py-8"} data-testid="import-panel">
      {compact ? null : (
        <>
          <h1 className="font-display text-4xl">{t("importTitle")}</h1>
          <p className="mt-2 text-[color:var(--muted)]">{t("importHint")}</p>
        </>
      )}
      <label
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-4 py-10 text-center ${
          dragging ? "border-[color:var(--accent)] bg-white" : "border-[color:var(--line)] bg-white/50"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void fromFile(file);
        }}
      >
        <span>{t("importDrop")}</span>
        <input
          data-testid="json-file-input"
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void fromFile(file);
          }}
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-[color:var(--muted)]">{t("importPaste")}</span>
        <textarea
          data-testid="json-paste"
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          rows={compact ? 6 : 10}
          className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 font-mono text-sm outline-none ring-[color:var(--accent)] focus:ring-2"
          spellCheck={false}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          data-testid="json-read"
          className="rounded-full bg-[color:var(--ink)] px-5 py-2 text-[color:var(--paper)]"
          onClick={() => ingest(paste)}
        >
          {t("importRead")}
        </button>
        <a
          href={SAMPLE_HREF}
          download="hikaya-novel.sample.json"
          className="rounded-full border border-[color:var(--line)] px-5 py-2"
        >
          {t("importSample")}
        </a>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-[color:var(--accent)]" data-testid="import-error">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="mt-3 text-sm" data-testid="import-ok">
          {ok}
        </p>
      ) : null}
    </section>
  );
}
