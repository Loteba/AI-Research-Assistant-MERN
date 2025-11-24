const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
if (!fs.existsSync(file)) {
  console.error('coverage-final.json no encontrado en coverage/');
  process.exit(1);
}

const cov = JSON.parse(fs.readFileSync(file, 'utf8'));

function percent(covered, total) {
  if (total === 0) return '100.0';
  return (100 * covered / total).toFixed(1);
}

let totals = { stmTotal: 0, stmCovered: 0, brTotal: 0, brCovered: 0, fnTotal: 0, fnCovered: 0 };

const rows = [];
for (const fullPath of Object.keys(cov)) {
  const rel = path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/');
  const data = cov[fullPath];
  const s = data.s || {};
  const f = data.f || {};
  const b = data.b || {};

  const stmTotal = Object.keys(s).length;
  const stmCovered = Object.values(s).filter(v => v > 0).length;

  let brTotal = 0, brCovered = 0;
  for (const k of Object.keys(b)) {
    const arr = b[k] || [];
    brTotal += arr.length;
    brCovered += arr.filter(x => x > 0).length;
  }

  const fnTotal = Object.keys(f).length;
  const fnCovered = Object.values(f).filter(v => v > 0).length;

  totals.stmTotal += stmTotal; totals.stmCovered += stmCovered;
  totals.brTotal += brTotal; totals.brCovered += brCovered;
  totals.fnTotal += fnTotal; totals.fnCovered += fnCovered;

  rows.push({ file: rel, stmTotal, stmCovered, brTotal, brCovered, fnTotal, fnCovered });
}

// Print table header
console.log('Coverage summary (calculated from coverage-final.json)');
console.log('--------------------------------------------------------------------------------');
console.log('| File'.padEnd(50) + '| % Stmts | % Branch | % Funcs | Stmts | Branch | Funcs');
console.log('--------------------------------------------------------------------------------');
for (const r of rows) {
  const pStm = percent(r.stmCovered, r.stmTotal);
  const pBr = percent(r.brCovered, r.brTotal);
  const pFn = percent(r.fnCovered, r.fnTotal);
  console.log(r.file.padEnd(50) + `| ${pStm.padStart(6)} | ${pBr.padStart(8)} | ${pFn.padStart(6)} | ${String(r.stmCovered).padStart(5)}/${String(r.stmTotal).padEnd(5)} | ${String(r.brCovered).padStart(6)}/${String(r.brTotal).padEnd(6)} | ${String(r.fnCovered).padStart(5)}/${String(r.fnTotal).padEnd(5)}`);
}

console.log('--------------------------------------------------------------------------------');
const pStmTot = percent(totals.stmCovered, totals.stmTotal);
const pBrTot = percent(totals.brCovered, totals.brTotal);
const pFnTot = percent(totals.fnCovered, totals.fnTotal);
console.log(`Total`.padEnd(50) + `| ${pStmTot.padStart(6)} | ${pBrTot.padStart(8)} | ${pFnTot.padStart(6)} | ${String(totals.stmCovered).padStart(5)}/${String(totals.stmTotal).padEnd(5)} | ${String(totals.brCovered).padStart(6)}/${String(totals.brTotal).padEnd(6)} | ${String(totals.fnCovered).padStart(5)}/${String(totals.fnTotal).padEnd(5)}`);

console.log('\nPara ver el reporte HTML, abre: coverage/lcov-report/index.html');
