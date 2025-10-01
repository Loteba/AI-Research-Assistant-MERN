import React, { useMemo, useState } from 'react';
import './SummaryCard.css';

/**
 * Normaliza el texto generado por la IA:
 * - Acepta bullets con "*", "-", "•" o numerados ("1.", "1)")
 * - Quita el marcador de viñeta
 * - Borra asteriscos sueltos al inicio (p. ej. "*Objetivo:** ...")
 * - Si no detecta viñetas, devuelve un único ítem con todo el texto (modo párrafo)
 */
const parseBullets = (text) => {
  if (!text) return [];

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bulletRegexes = [
    /^\*\s+/,       // "* item"
    /^-\s+/,        // "- item"
    /^•\s+/,        // "• item"
    /^\d+[\.\)]\s+/ // "1. item" / "1) item"
  ];

  const isBullet = (line) => bulletRegexes.some((rx) => rx.test(line));
  const stripBullet = (line) =>
    bulletRegexes.reduce((acc, rx) => acc.replace(rx, ''), line).trim();

  const bulletCount = lines.filter(isBullet).length;
  let items = [];

  if (bulletCount >= Math.ceil(lines.length / 2)) {
    items = lines.filter(isBullet).map(stripBullet);
  } else {
    const collapsed = lines.join(' ').replace(/\s+/g, ' ').trim();
    items = collapsed ? [collapsed] : [];
  }

  // Limpieza adicional:
  return items.map((s) => {
    let out = s;

    // 1) Si arranca con "*", bórralo (con o sin espacios posteriores)
    out = out.replace(/^\*\s*/, '');

    // 2) Si hay un "*" justo antes de "**", bórralo (caso "* **Etiqueta:** ...")
    out = out.replace(/(^|\s)\*(?=\*\*)/g, '$1');

    // 3) Colapsa triples/duplicados de "*" raros
    out = out.replace(/\*{3,}/g, '**');

    // 4) Trim final
    out = out.trim();

    return out;
  });
};

/**
 * Destaca etiquetas. Soporta:
 *  - **Etiqueta:** texto
 *  - Etiqueta:** texto  (sin ** de apertura, solo cierre)
 */
const Highlighted = ({ text }) => {
  // Caso 1: **Etiqueta:** texto
  let m = text.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
  if (m) {
    return (
      <span>
        <strong className="sc-strong">{m[1]}:</strong> {m[2]}
      </span>
    );
  }

  // Caso 2: Etiqueta:** texto  (faltan los ** de apertura)
  m = text.match(/^([^:*]{2,}?):\*\*\s*(.*)$/);
  if (m) {
    return (
      <span>
        <strong className="sc-strong">{m[1]}:</strong> {m[2]}
      </span>
    );
  }

  // Caso 3: *Etiqueta:** texto (quedó una * suelta al inicio)
  m = text.match(/^\*([^:*]{2,}?):\*\*\s*(.*)$/);
  if (m) {
    return (
      <span>
        <strong className="sc-strong">{m[1]}:</strong> {m[2]}
      </span>
    );
  }

  return <span>{text.replace(/^\*\s*/, '')}</span>; // fallback borra "*" inicial
};

export default function SummaryCard({
  title = 'Resumen Generado',
  summary,
  model,
  isLoading = false,
  onRegenerate
}) {
  const bullets = useMemo(() => parseBullets(summary), [summary]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([summary || ''], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${(title || 'resumen').toLowerCase().replace(/\s+/g, '_')}.md`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sc-card sc-card--light">
      <div className="sc-header">
        <div className="sc-header-left">
          <h3 className="sc-title">{title}</h3>
          {model && <span className="sc-badge" title="Modelo IA">{model}</span>}
        </div>

        <div className="sc-actions">
          <button className="sc-btn" onClick={handleCopy} disabled={!summary}>
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
          <button className="sc-btn" onClick={handleDownload} disabled={!summary}>
            Descargar .md
          </button>
          {onRegenerate && (
            <button className="sc-btn sc-btn-ghost" onClick={onRegenerate} disabled={isLoading}>
              {isLoading ? 'Generando…' : 'Regenerar'}
            </button>
          )}
        </div>
      </div>

      <div className="sc-content">
        {isLoading && (
          <div className="sc-skeleton">
            <div className="sc-line" />
            <div className="sc-line" />
            <div className="sc-line short" />
          </div>
        )}

        {!isLoading && bullets.length > 0 && (
          <ul className="sc-list">
            {bullets.map((b, i) => (
              <li key={i} className="sc-item">
                <Highlighted text={b} />
              </li>
            ))}
          </ul>
        )}

        {!isLoading && bullets.length === 0 && (
          <div className="sc-empty">No hay viñetas para mostrar.</div>
        )}
      </div>
    </div>
  );
}
