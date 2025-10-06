const fs = require('fs');

// Small CRC32 implementation
function makeCRCTable() {
  let c;
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = makeCRCTable();
function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function dosDateTime(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = Math.floor(d.getSeconds() / 2);
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

function makeLocalFileHeader(filenameBuf, contentBuf) {
  const signature = 0x04034b50;
  const versionNeeded = 20; // 2.0
  const gpFlag = 0;
  const compression = 0; // stored
  const { dosTime, dosDate } = dosDateTime(new Date());
  const crc = crc32(contentBuf);
  const compSize = contentBuf.length;
  const uncompSize = contentBuf.length;
  const fnameLen = filenameBuf.length;
  const extraLen = 0;

  const header = Buffer.alloc(30);
  let offset = 0;
  header.writeUInt32LE(signature, offset); offset += 4;
  header.writeUInt16LE(versionNeeded, offset); offset += 2;
  header.writeUInt16LE(gpFlag, offset); offset += 2;
  header.writeUInt16LE(compression, offset); offset += 2;
  header.writeUInt16LE(dosTime, offset); offset += 2;
  header.writeUInt16LE(dosDate, offset); offset += 2;
  header.writeUInt32LE(crc, offset); offset += 4;
  header.writeUInt32LE(compSize, offset); offset += 4;
  header.writeUInt32LE(uncompSize, offset); offset += 4;
  header.writeUInt16LE(fnameLen, offset); offset += 2;
  header.writeUInt16LE(extraLen, offset); offset += 2;

  return Buffer.concat([header, filenameBuf, contentBuf]);
}

function makeCentralDirHeader(filenameBuf, contentBuf, localHeaderOffset) {
  const signature = 0x02014b50;
  const versionMade = 20;
  const versionNeeded = 20;
  const gpFlag = 0;
  const compression = 0;
  const { dosTime, dosDate } = dosDateTime(new Date());
  const crc = crc32(contentBuf);
  const compSize = contentBuf.length;
  const uncompSize = contentBuf.length;
  const fnameLen = filenameBuf.length;
  const extraLen = 0;
  const commentLen = 0;
  const diskStart = 0;
  const intAttrs = 0;
  const extAttrs = 0;
  const localOffset = localHeaderOffset;

  const header = Buffer.alloc(46);
  let offset = 0;
  header.writeUInt32LE(signature, offset); offset += 4;
  header.writeUInt16LE(versionMade, offset); offset += 2;
  header.writeUInt16LE(versionNeeded, offset); offset += 2;
  header.writeUInt16LE(gpFlag, offset); offset += 2;
  header.writeUInt16LE(compression, offset); offset += 2;
  header.writeUInt16LE(dosTime, offset); offset += 2;
  header.writeUInt16LE(dosDate, offset); offset += 2;
  header.writeUInt32LE(crc, offset); offset += 4;
  header.writeUInt32LE(compSize, offset); offset += 4;
  header.writeUInt32LE(uncompSize, offset); offset += 4;
  header.writeUInt16LE(fnameLen, offset); offset += 2;
  header.writeUInt16LE(extraLen, offset); offset += 2;
  header.writeUInt16LE(commentLen, offset); offset += 2;
  header.writeUInt16LE(diskStart, offset); offset += 2;
  header.writeUInt16LE(intAttrs, offset); offset += 2;
  header.writeUInt32LE(extAttrs, offset); offset += 4;
  header.writeUInt32LE(localOffset, offset); offset += 4;

  return Buffer.concat([header, filenameBuf]);
}

function makeEndCentralDir(numEntries, centralSize, centralOffset) {
  const signature = 0x06054b50;
  const disk = 0;
  const startDisk = 0;
  const entriesThisDisk = numEntries;
  const entriesTotal = numEntries;
  const commentLen = 0;

  const header = Buffer.alloc(22);
  let offset = 0;
  header.writeUInt32LE(signature, offset); offset += 4;
  header.writeUInt16LE(disk, offset); offset += 2;
  header.writeUInt16LE(startDisk, offset); offset += 2;
  header.writeUInt16LE(entriesThisDisk, offset); offset += 2;
  header.writeUInt16LE(entriesTotal, offset); offset += 2;
  header.writeUInt32LE(centralSize, offset); offset += 4;
  header.writeUInt32LE(centralOffset, offset); offset += 4;
  header.writeUInt16LE(commentLen, offset); offset += 2;

  return header;
}

// Minimal OpenXML parts
const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="/word/document.xml"/>\n</Relationships>`;

const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body>\n    <w:p><w:r><w:t>Informe de Pruebas y Cobertura</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Fecha: 2025-10-06</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Proyecto: gestion-proyectos-frontend</w:t></w:r></w:p>\n    <w:p><w:r><w:t>\nResumen ejecutivo:\nSe actualizó la suite de pruebas unitarias e integración para alcanzar y superar la cobertura requerida. Se añadieron tests, se corrigieron condiciones de carrera y se mejoró la robustez de pruebas asíncronas.\n</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Detalles de lo cubierto:</w:t></w:r></w:p>\n    <w:p><w:r><w:t>1) Cobertura superior al 70% - Estado: Done</w:t></w:r></w:p>\n    <w:p><w:r><w:t> - Statements: 80.03% | Branches: 70.4% | Functions: 73.42% | Lines: 80.5%</w:t></w:r></w:p>\n    <w:p><w:r><w:t>2) Pruebas de interacción complejas - Estado: Good (Partial)</w:t></w:r></w:p>\n    <w:p><w:r><w:t>3) Mocking de APIs y Contextos - Estado: Mostly done / Partial</w:t></w:r></w:p>\n    <w:p><w:r><w:t>4) Pruebas de accesibilidad (a11y) - Estado: Not covered / Partial</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Cambios realizados (archivos clave): src/pages/__tests__/LibraryPage.integration.test.js, src/context/__tests__/AuthContext.test.js, src/components/ai/__tests__/SummaryCard.test.jsx</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Warnings: act(...) in tests, console.error expected in some error-handling tests.</w:t></w:r></w:p>\n    <w:p><w:r><w:t>Comandos: cd 'd:\\Proyectos\\AI\\AI-Research-Assistant-MERN-main\\gestion-proyectos-frontend' && npm run test:cov</w:t></w:r></w:p>\n    <w:sectPr/>\n  </w:body>\n</w:document>`;

const files = [
  { path: '[Content_Types].xml', content: Buffer.from(contentTypes, 'utf8') },
  { path: '_rels/.rels', content: Buffer.from(rels, 'utf8') },
  { path: 'word/document.xml', content: Buffer.from(docXml, 'utf8') },
];

let parts = [];
let centralParts = [];
let offset = 0;

for (const f of files) {
  const fnameBuf = Buffer.from(f.path, 'utf8');
  const contentBuf = f.content;
  const local = makeLocalFileHeader(fnameBuf, contentBuf);
  parts.push(local);
  const central = makeCentralDirHeader(fnameBuf, contentBuf, offset);
  centralParts.push(central);
  offset += local.length;
}

const centralStart = offset;
const centralBuf = Buffer.concat(centralParts);
const centralSize = centralBuf.length;
const endBuf = makeEndCentralDir(centralParts.length, centralSize, centralStart);

const final = Buffer.concat([...parts, centralBuf, endBuf]);

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/test_coverage_report.docx', final);
console.log('Report generated at reports/test_coverage_report.docx');
