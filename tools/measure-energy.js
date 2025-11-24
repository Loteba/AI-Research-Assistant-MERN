#!/usr/bin/env node
/**
 * Script para ejecutar auditoría energética con Lighthouse
 * Mide métricas clave de performance y estima consumo energético
 * Uso: node tools/measure-energy.js [url] [output-dir]
 */

let lighthouse;
let chromeLauncher;
const fs = require('fs');
const path = require('path');

async function launchChrome(headless = true) {
  if (!chromeLauncher) {
    const mod = await import('chrome-launcher');
    chromeLauncher = mod.default || mod;
  }
  return chromeLauncher.launch({ chromeFlags: ['--headless'] });
}

async function runAudit(url, outputDir = './energy-reports') {
  console.log(`\n⚡ GreenFrame CLI Alternative: Energy Audit with Lighthouse\n`);
  console.log(`URL: ${url}`);
  console.log(`Output: ${outputDir}\n`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let chrome;
  try {
    chrome = await launchChrome();
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['performance'],
      port: chrome.port,
      emulatedFormFactor: 'mobile', // Opción para medir energía (móvil típicamente usa más)
    };

    if (!lighthouse) {
      const mod = await import('lighthouse');
      lighthouse = mod.default || mod;
    }
    const runnerResult = await lighthouse(url, options);
    const reportHtml = runnerResult.report[0];
    const reportJson = JSON.parse(runnerResult.report[1]);

    // Guardar reportes
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlPath = path.join(outputDir, `audit-${timestamp}.html`);
    const jsonPath = path.join(outputDir, `audit-${timestamp}.json`);

    fs.writeFileSync(htmlPath, reportHtml);
    fs.writeFileSync(jsonPath, JSON.stringify(reportJson, null, 2));

    // Extraer métricas clave
    const metrics = reportJson.audits;
    const performance = reportJson.categories.performance.score * 100;

    console.log(`\n📊 AUDIT RESULTS:\n`);
    console.log(`Performance Score: ${performance.toFixed(0)}/100`);

    const keyMetrics = {
      'First Contentful Paint (FCP)': metrics['first-contentful-paint'],
      'Largest Contentful Paint (LCP)': metrics['largest-contentful-paint'],
      'Total Blocking Time (TBT)': metrics['total-blocking-time'],
      'Cumulative Layout Shift (CLS)': metrics['cumulative-layout-shift'],
      'Speed Index': metrics['speed-index'],
      'Total Byte Weight': metrics['total-byte-weight'],
    };

    Object.entries(keyMetrics).forEach(([name, audit]) => {
      if (audit && audit.displayValue) {
        console.log(`  ${name}: ${audit.displayValue}`);
      }
    });

    // Estimación simple de consumo energético
    const estimatedEnergy = estimateEnergy(reportJson);
    console.log(`\n⚡ ESTIMATED ENERGY CONSUMPTION:`);
    console.log(`  ${estimatedEnergy.toFixed(3)} Wh (per visit)`);

    console.log(`\n✅ Reports saved to:`);
    console.log(`  HTML: ${htmlPath}`);
    console.log(`  JSON: ${jsonPath}`);

  } catch (e) {
    console.error(`❌ Error running audit:`, e.message);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function estimateEnergy(reportJson) {
  /**
   * Estimación muy simplificada de energía basada en Web Vitals.
   * Fórmula: (LCP_ms / 2500) * 0.1 + (TBT_ms / 200) * 0.05 + (CLS / 0.1) * 0.02 Wh
   * Esto es ilustrativo; la energía real depende del hardware, SO, navegador, etc.
   */
  const lcp = reportJson.audits['largest-contentful-paint']?.numericValue || 0;
  const tbt = reportJson.audits['total-blocking-time']?.numericValue || 0;
  const cls = reportJson.audits['cumulative-layout-shift']?.numericValue || 0;

  // Factor simplificado: más tiempo = más energía
  const lcpFactor = Math.min(lcp / 2500, 1) * 0.1;
  const tbtFactor = Math.min(tbt / 200, 1) * 0.05;
  const clsFactor = Math.min(cls / 0.1, 1) * 0.02;

  return lcpFactor + tbtFactor + clsFactor;
}

// Main
const url = process.argv[2] || 'http://localhost:3000/projects';
const outputDir = process.argv[3] || './energy-reports';

runAudit(url, outputDir);
