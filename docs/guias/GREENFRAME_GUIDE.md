# 🌿 Guía de Medición Energética — GreenFrame CLI & Lighthouse

## Introducción
Este documento explica cómo usar las herramientas de medición energética en el proyecto **ProyectifyIA** para auditar y comparar el consumo de energía de componentes optimizados (green).

---

## Opción 1: GreenFrame CLI (Recomendado para producción)

### Instalación
GreenFrame CLI es una herramienta SaaS que proporciona análisis detallado de consumo energético de aplicaciones web. Para instalarlo:

```bash
# Opción A: Instalador shell (requiere bash, no disponible en Windows nativo)
curl https://assets.greenframe.io/install.sh | bash

# Opción B: Descarga manual (Windows, macOS, Linux)
# Visita: https://greenframe.io/download
# Descarga el binario correspondiente a tu sistema operativo
```

Verifica la instalación:
```bash
greenframe -v
```

### Configuración para ProyectifyIA
Se ha incluido un archivo `greenframe.json` en la raíz del proyecto con escenarios predefinidos:

```json
{
  "scenarios": [
    {
      "name": "GreenProjectList - Initial Visit",
      "url": "http://localhost:3000/projects",
      "actions": [...]
    },
    {
      "name": "GreenProjectList - Expand Tasks",
      "url": "http://localhost:3000/projects",
      "actions": [...]
    },
    {
      "name": "GreenProjectList - Cache Hit (Reload)",
      "url": "http://localhost:3000/projects",
      "actions": [...]
    }
  ]
}
```

### Uso de GreenFrame CLI

1. **Asegúrate de que tu aplicación está corriendo:**
   ```powershell
   cd gestion-proyectos-frontend
   npm start  # o REACT_APP_API_URL=http://localhost:3001 npm start para usar el mock API
   ```

2. **En otra terminal, ejecuta greenframe:**
   ```bash
   cd d:\Proyectos\ProyectifyIA
   greenframe --config greenframe.json
   ```

3. **Revisa el reporte en la consola:**
   - GreenFrame muestra métricas de energía (Wh) por escenario.
   - Incluye desglose de consumo del navegador, pantalla y red.
   - Proporciona recomendaciones de optimización.

### Interpretación de Resultados (GreenFrame)
- **Browser Energy (Wh):** Consumo de CPU, memoria y operaciones DOM.
- **Screen Energy (Wh):** Consumo de la pantalla (depende del brillo y píxeles iluminados).
- **Network Energy (Wh):** Energía gastada transmitiendo datos (radio, antena).
- **Total:** Suma de los anteriores.

---

## Opción 2: Lighthouse + Energy Estimator (Alternativa gratuita)

Como alternativa (especialmente útil en Windows sin bash), usamos **Lighthouse** con estimaciones energéticas basadas en Web Vitals.

### Instalación (ya completada)
```bash
npm install -g lighthouse
# o en el proyecto:
npm install --save-dev lighthouse chrome-launcher
```

Verifica:
```bash
lighthouse --version
```

### Configuración
Se incluyen archivos de configuración:
- `.lighthouserc.json`: Configuración de auditorías (métricas clave).
- `tools/measure-energy.js`: Script que ejecuta Lighthouse y estima energía.
- `tools/compare-energy.js`: Script para comparar componente optimizado vs. estándar.

### Uso en ProyectifyIA

#### Opción A: Medir una URL
```bash
cd d:\Proyectos\ProyectifyIA
npm run energy:measure
```

Esto:
1. Lanza una auditoría Lighthouse en `http://localhost:3000/projects`.
2. Recopila métricas clave (FCP, LCP, TBT, CLS, byte weight).
3. Estima consumo energético basado en esas métricas.
4. Guarda reportes HTML y JSON en `energy-reports/`.

**Ejemplo de salida:**
```
⚡ GreenFrame CLI Alternative: Energy Audit with Lighthouse

URL: http://localhost:3000/projects
Output: energy-reports

📊 AUDIT RESULTS:

Performance Score: 89/100
  First Contentful Paint (FCP): 1.2 s
  Largest Contentful Paint (LCP): 2.5 s
  Total Blocking Time (TBT): 42 ms
  Cumulative Layout Shift (CLS): 0.05
  Speed Index: 2.1 s
  Total Byte Weight: 245 KB

⚡ ESTIMATED ENERGY CONSUMPTION:
  0.125 Wh (per visit)

✅ Reports saved to:
  HTML: energy-reports/audit-2025-11-16T12-34-56-789Z.html
  JSON: energy-reports/audit-2025-11-16T12-34-56-789Z.json
```

#### Opción B: Comparar antes vs. después
```bash
cd d:\Proyectos\ProyectifyIA
npm run energy:compare
```

Esto compara el componente optimizado (`GreenProjectList`) contra una versión estándar y muestra:
- Diferencia en Performance Score.
- Reducción en LCP, TBT, byte weight.
- Mejora estimada en consumo energético (Wh).

**Ejemplo:**
```
============================================================
⚡ Energy Comparison: Green vs. Standard Component
============================================================

📊 COMPARISON RESULTS

Performance Score
  Green (optimized):  89
  Standard (baseline): 72
  Improvement:         17

Largest Contentful Paint (ms)
  Green (optimized):  2500
  Standard (baseline): 4200
  Improvement:         40.5%

...

Estimated Energy (Wh)
  Green (optimized):  0.0125
  Standard (baseline): 0.0245
  Improvement:         49%
```

#### Opción C: Auditoría manual con Lighthouse
```bash
# Mide una URL específica y guarda reporte:
lighthouse http://localhost:3000/projects --view

# Con más opciones:
lighthouse http://localhost:3000/projects \
  --output html \
  --output-path ./energy-reports/audit.html \
  --only-categories performance \
  --emulated-form-factor mobile
```

---

## Flujo completo: Medición paso a paso

### 1. Preparar el entorno
```powershell
# Terminal 1: Inicia el mock API (opcional, si usas JSON Server)
cd d:\Proyectos\ProyectifyIA
npm run mock:start

# Terminal 2: Inicia el frontend
cd d:\Proyectos\ProyectifyIA\gestion-proyectos-frontend
npm start
```

Espera a que ambos servidores estén listos (frontend en `http://localhost:3000`, mock en `http://localhost:3001`).

### 2. Ejecutar medición energética
```powershell
# Terminal 3: Mide GreenProjectList
cd d:\Proyectos\ProyectifyIA
npm run energy:measure

# O si prefieres Lighthouse directo:
lighthouse http://localhost:3000/projects --view
```

### 3. Revisar reportes
- Los reportes se guardan en `energy-reports/` (HTML + JSON).
- Abre el archivo HTML en el navegador para visualización interactiva.
- El JSON contiene datos estructurados para análisis automatizado.

### 4. (Opcional) Comparar con baseline
Si tienes una versión estándar (sin optimizaciones) en otra ruta:
```powershell
npm run energy:compare
```

---

## Métricas explicadas

| Métrica | Qué mide | Impacto en energía | Objetivo |
|---------|----------|-------------------|----------|
| **FCP** (First Contentful Paint) | Tiempo hasta que aparece contenido | Bajo | < 1.8s |
| **LCP** (Largest Contentful Paint) | Tiempo hasta que se carga el contenido principal | Alto | < 2.5s |
| **TBT** (Total Blocking Time) | Tiempo bloqueado por tareas JavaScript | Alto | < 200ms |
| **CLS** (Cumulative Layout Shift) | Cambios inesperados de layout | Medio | < 0.1 |
| **Speed Index** | Velocidad visual de carga | Medio | < 3.4s |
| **Byte Weight** | Tamaño total de recursos descargados | Alto (red) | < 200KB |

**Conversión a energía:** Cuanto mejor el score en estas métricas, menor el consumo de energía (CPU, memoria, red).

---

## Integración con CI/CD (GitHub Actions)

Para ejecutar auditorías energéticas automáticamente en cada push/PR:

```yaml
# .github/workflows/energy-audit.yml
name: Energy Audit
on: [push, pull_request]
jobs:
  energy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd gestion-proyectos-frontend && npm start &
      - run: sleep 5
      - run: npm run energy:measure
      - uses: actions/upload-artifact@v3
        with:
          name: energy-reports
          path: energy-reports/
```

---

## Recomendaciones finales

1. **Ejecuta auditorías regularmente** (semanalmente o antes de releases).
2. **Compara siempre contra baseline** para medir mejora.
3. **Usa Mobile emulation** en Lighthouse (consume más energía, escenario realista).
4. **Optimiza en orden:**
   - Reduce LCP (lazy load, code splitting, comprensión).
   - Reduce TBT (web workers, defer JS).
   - Reduce byte weight (compresión, remove unused code).
   - Reduce CLS (asignar dimensiones, fonts).

5. **Mantén un log de mejoras:**
   ```
   2025-11-16: GreenProjectList implementado → 49% menos energía (0.0245 → 0.0125 Wh)
   2025-11-20: Implementar image lazy loading → predicción +15% mejora
   ```

---

## Recursos externos

- **GreenFrame oficial:** https://greenframe.io
- **Lighthouse docs:** https://developers.google.com/web/tools/lighthouse
- **Web Vitals:** https://web.dev/vitals/
- **Green Coding Standards:** https://standard.greensoftware.foundation/

---

## Troubleshooting

### GreenFrame CLI: "Command not found"
- Asegúrate de que está en tu `$PATH`: `which greenframe` (o `where greenframe` en Windows).
- Si no lo está, añade el directorio de instalación a `$PATH`.

### Lighthouse: "Chrome/Chromium not found"
- Lighthouse intenta encontrar Chrome automáticamente.
- Si falla, especifica el path: `lighthouse --chrome-path "C:\Program Files\Google\Chrome\Application\chrome.exe" <url>`

### "Cannot connect to localhost:3000"
- Asegúrate de que el frontend está corriendo: `npm start` en `gestion-proyectos-frontend`.
- Verifica el puerto: `netstat -an | findstr :3000` (Windows).

---

**¡Esperamos verte midiendo y optimizando el consumo energético de tu app! 🌱⚡**
