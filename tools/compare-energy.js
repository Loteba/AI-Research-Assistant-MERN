#!/usr/bin/env node
/**
 * Comparador de energía: mide antes y después de optimización
 * Compara consumo de componente optimizado vs. versión estándar
 * Uso: node tools/compare-energy.js
 */

let lighthouse;
let chromeLauncher;
const fs = require('fs');
const path = require('path');

async function launchChrome() {
  if (!chromeLauncher) {
    const mod = await import('chrome-launcher');
    chromeLauncher = mod.default || mod;
  }
  return chromeLauncher.launch({ chromeFlags: ['--headless'] });
}

async function measurePage(url, label) {
  console.log(`\n  Measuring: ${label}`);
  console.log(`  URL: ${url}\n`);

  let chrome;
  try {
    chrome = await launchChrome();
    const options = {
      logLevel: 'silent',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      emulatedFormFactor: 'mobile',
    };

    if (!lighthouse) {
      const mod = await import('lighthouse');
      lighthouse = mod.default || mod;
    }
    const runnerResult = await lighthouse(url, options);
    const reportJson = JSON.parse(runnerResult.report);

    const metrics = {
      performance: reportJson.categories.performance.score * 100,
      lcp: reportJson.audits['largest-contentful-paint']?.numericValue || 0,
      tbt: reportJson.audits['total-blocking-time']?.numericValue || 0,
      cls: reportJson.audits['cumulative-layout-shift']?.numericValue || 0,
      byteWeight: reportJson.audits['total-byte-weight']?.numericValue || 0,
    };

    return metrics;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function calculateEnergy(metrics) {
  const lcpFactor = Math.min(metrics.lcp / 2500, 1) * 0.1;
  const tbtFactor = Math.min(metrics.tbt / 200, 1) * 0.05;
  const clsFactor = Math.min(metrics.cls / 0.1, 1) * 0.02;
  return lcpFactor + tbtFactor + clsFactor;
}

async function compare() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`⚡ Energy Comparison: Green vs. Standard Component`);
  console.log(`${'='.repeat(60)}\n`);

  // Determine URLs from args or defaults
  const greenUrl = process.argv[2] || 'http://localhost:3000/projects';
  const standardUrl = process.argv[3] || 'http://localhost:3000/projects-standard';

  // Medir componente optimizado (GreenProjectList)
  const greenMetrics = await measurePage(greenUrl, 'GreenProjectList (optimized)');
  const greenEnergy = calculateEnergy(greenMetrics);

  // Medir componente estándar (simulado - ruta hipotética)
  const standardMetrics = await measurePage(standardUrl, 'Standard ProjectList (baseline)');
  const standardEnergy = calculateEnergy(standardMetrics);

  // Comparación
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 COMPARISON RESULTS\n`);

  const comparison = {
    'Performance Score': {
      green: greenMetrics.performance.toFixed(0),
      standard: standardMetrics.performance.toFixed(0),
      improvement: ((greenMetrics.performance - standardMetrics.performance)).toFixed(1),
    },
    'Largest Contentful Paint (ms)': {
      green: greenMetrics.lcp.toFixed(0),
      standard: standardMetrics.lcp.toFixed(0),
      improvement: ((standardMetrics.lcp - greenMetrics.lcp) / standardMetrics.lcp * 100).toFixed(1) + '%',
    },
    'Total Blocking Time (ms)': {
      green: greenMetrics.tbt.toFixed(0),
      standard: standardMetrics.tbt.toFixed(0),
      improvement: ((standardMetrics.tbt - greenMetrics.tbt) / standardMetrics.tbt * 100).toFixed(1) + '%',
    },
    'Total Byte Weight (KB)': {
      green: (greenMetrics.byteWeight / 1024).toFixed(1),
      standard: (standardMetrics.byteWeight / 1024).toFixed(1),
      improvement: ((standardMetrics.byteWeight - greenMetrics.byteWeight) / standardMetrics.byteWeight * 100).toFixed(1) + '%',
    },
    'Estimated Energy (Wh)': {
      green: greenEnergy.toFixed(4),
      standard: standardEnergy.toFixed(4),
      improvement: ((standardEnergy - greenEnergy) / standardEnergy * 100).toFixed(1) + '%',
    },
  };

  Object.entries(comparison).forEach(([metric, values]) => {
    console.log(`${metric}`);
    console.log(`  Green (optimized):  ${values.green}`);
    console.log(`  Standard (baseline): ${values.standard}`);
    console.log(`  Improvement:         ${values.improvement}\n`);
  });

  console.log(`${'='.repeat(60)}\n`);
  console.log(`✅ Comparison complete!\n`);
}

compare().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
