const fs = require('fs');
const officegen = require('officegen');

const docx = officegen('docx');

docx.on('error', function(err) {
  console.log('Officegen error:', err);
});

const p = docx.createP({ align: 'left' });
p.addText('Informe de Pruebas y Cobertura', { bold: true, font_size: 20 });

docx.createP().addText('Fecha: 2025-10-06');
docx.createP().addText('Proyecto: gestion-proyectos-frontend');

docx.createP().addText('Resumen ejecutivo', { bold: true });
docx.createP().addText('Se actualizó la suite de pruebas unitarias e integración para alcanzar y superar la cobertura requerida. Se añadieron tests, se corrigieron condiciones de carrera y se mejoró la robustez de pruebas asíncronas.');

docx.createP().addText('Detalles de lo cubierto', { bold: true });
docx.createP().addText('1. Cobertura superior al 70%', { bold: true });
docx.createP().addText('Estado: Done');
docx.createP().addText('Evidencia: Tras añadir tests, la cobertura global quedó:');

// Table
const table = [[{ val: 'Métrica' }, { val: 'Valor' }], [{ val: 'Statements' }, { val: '80.03%' }], [{ val: 'Branches' }, { val: '70.4%' }], [{ val: 'Functions' }, { val: '73.42%' }], [{ val: 'Lines' }, { val: '80.5%' }]];
docx.createTable(table, { tableColWidth: 4261, borders: true });

docx.createP().addText('2. Pruebas de interacción complejas', { bold: true });
docx.createP().addText('Estado: Good (Partial)');
docx.createP().addText('Se mantiene un test de integración principal: src/pages/__tests__/LibraryPage.integration.test.js. Cubre flujo de subida de archivo, debounce y refetch. Se hizo la prueba más robusta para aceptar múltiples llamadas a getItems y evitar condiciones de carrera.');

docx.createP().addText('3. Mocking de APIs y Contextos', { bold: true });
docx.createP().addText('Estado: Mostly done / Partial');
docx.createP().addText('- Se emplearon mocks por test para servicios clave: jest.mock para libraryService en tests de integración y unitarios.');
docx.createP().addText('- Se añadió test para AuthContext que espía useNavigate en tiempo de ejecución y verifica login/logout y localStorage.');
docx.createP().addText('Recomendación: Añadir mock global centralizado para apiClient en src/setupTests.js');

docx.createP().addText('4. Pruebas de accesibilidad (a11y)', { bold: true });
docx.createP().addText('Estado: Not covered / Partial');
docx.createP().addText('Observación: jest-axe está en devDependencies pero no se añadieron tests de a11y durante esta iteración. Recomendación: añadir 1-2 tests con jest-axe (por ejemplo para LibraryPage y SummaryCard) como plantilla para el resto.');

docx.createP().addText('Cambios realizados (archivos clave)', { bold: true });
docx.createP().addText('- src/pages/__tests__/LibraryPage.integration.test.js  (ajustes async y mocks)');
docx.createP().addText('- src/context/__tests__/AuthContext.test.js  (login/logout, localStorage, navigate spy)');
docx.createP().addText('- src/components/ai/__tests__/SummaryCard.test.jsx  (parsing, copy, download, regenerate)');

docx.createP().addText('Warnings y observaciones de test run', { bold: true });
docx.createP().addText('- Aparición de warnings act(...) en algunos tests que hacen updates asíncronos (p.ej. UploadItemModal, SummaryCard).');
docx.createP().addText('- Mensajes de console.error esperados en tests que validan manejo de errores.');

docx.createP().addText('Comandos útiles', { bold: true });
docx.createP().addText("cd 'd:\\Proyectos\\AI\\AI-Research-Assistant-MERN-main\\gestion-proyectos-frontend'");
docx.createP().addText('npm run test:cov');

docx.createP().addText('Recomendaciones y próximos pasos', { bold: true });
docx.createP().addText('1. Añadir tests de accesibilidad con jest-axe para componentes/páginas clave.');
docx.createP().addText('2. Centralizar mocks de red (por ejemplo mockear apiClient en src/setupTests.js).');
docx.createP().addText('3. Añadir 1 E2E (Cypress/Playwright) para flujos críticos si se desea mayor confianza end-to-end.');

const out = 'reports/test_coverage_report.docx';
fs.mkdirSync('reports', { recursive: true });
const outStream = fs.createWriteStream(out);
outStream.on('close', function() {
  console.log('Report generated at', out);
});

docx.generate(outStream);
