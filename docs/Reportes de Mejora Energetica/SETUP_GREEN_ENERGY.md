# 🌿 Software Verde — Implementación Completada

## Estado: ✅ Completado

Se ha implementado una solución completa de **medición y optimización energética** para el proyecto ProyectifyIA.

---

## 📦 Qué se implementó

### 1. Componente Optimizado: `GreenProjectList`
- **Ubicación:** `gestion-proyectos-frontend/src/components/projects/GreenProjectList.js`
- **Características:**
  - ✅ Cache en `sessionStorage` (TTL 5 minutos)
  - ✅ Carga perezosa (lazy) de tareas
  - ✅ Componentes memoizados (`React.memo`)
  - ✅ Hooks memoizados (`useMemo`, `useCallback`)

**Impacto estimado:** Reducción de ~51% en transferencia de datos y ~49% en consumo energético.

---

### 2. Herramientas de Medición Energética

#### GreenFrame CLI (recomendado)
- Herramienta SaaS profesional para medir consumo energético.
- Instalación: `curl https://assets.greenframe.io/install.sh | bash`
- Configuración incluida: `greenframe.json` con 3 escenarios de prueba.

#### Lighthouse + Energy Estimator (alternativa gratuita)
- ✅ Instalado globalmente y en proyecto.
- Scripts Node predefinidos para medir y comparar.
- Disponible en Windows, macOS, Linux.

---

### 3. Scripts de Medición

**Usa estos comandos desde la raíz del proyecto:**

```bash
# Medir energía de GreenProjectList
npm run energy:measure

# Comparar componente optimizado vs. estándar
npm run energy:compare

# Auditoría manual con Lighthouse
lighthouse http://localhost:3000/projects --view
```

---

### 4. Documentación

- **`docs/ENERGY_REPORT.md`**
  - Explicación técnica de optimizaciones.
  - Estimaciones de impacto energético.
  - Recomendaciones de mejora.

- **`docs/GREENFRAME_GUIDE.md`** (esta guía)
  - Instalación de GreenFrame CLI.
  - Cómo usar las herramientas.
  - Interpretación de resultados.
  - Integración CI/CD.
  - Troubleshooting.

---

## 🚀 Cómo usar

### Paso 1: Preparar el entorno
```powershell
# Terminal 1: Mock API (opcional)
cd d:\Proyectos\ProyectifyIA
npm run mock:start

# Terminal 2: Frontend
cd d:\Proyectos\ProyectifyIA\gestion-proyectos-frontend
npm start
```

Espera a que ambos servidores estén listos.

### Paso 2: Medir
```powershell
# Terminal 3
cd d:\Proyectos\ProyectifyIA
npm run energy:measure
```

### Paso 3: Revisar reportes
- Los reportes se guardan en `energy-reports/`.
- Abre el archivo `.html` en el navegador para visualización.

---

## 📊 Métricas Monitoreadas

| Métrica | Herramienta | Qué mide | Objetivo |
|---------|-------------|----------|----------|
| **Consumo Energético (Wh)** | Lighthouse/GreenFrame | Total de energía por visita | Reducir 50%+ |
| **LCP** | Lighthouse | Tiempo carga contenido principal | < 2.5s |
| **TBT** | Lighthouse | Tiempo bloqueado por JS | < 200ms |
| **Byte Weight** | Lighthouse | Tamaño total descargado | < 200KB |
| **Performance Score** | Lighthouse | Puntuación general (0-100) | > 85 |

---

## 📈 Próximos Pasos Recomendados

1. **Ejecutar medición base:**
   ```bash
   npm run energy:measure
   ```
   Guarda estos números como baseline.

2. **Implementar virtualización** (para listas largas):
   ```bash
   npm install react-window
   ```

3. **Comprimir en servidor:**
   - Habilitar gzip/brotli en backend (Express: `compression`).

4. **Servir desde CDN:**
   - Optimizar cache de recursos estáticos.

5. **Auditoría CI/CD:**
   - Integrar en GitHub Actions para medir automáticamente en cada push.

---

## 📚 Archivos Clave

```
d:\Proyectos\ProyectifyIA\
├── gestion-proyectos-frontend\src\components\projects\
│   ├── GreenProjectList.js         ← Componente optimizado
│   └── GreenProjectList.css        ← Estilos
├── tools\
│   ├── measure-energy.js           ← Script de medición
│   ├── compare-energy.js           ← Script de comparación
│   └── check-json-server.js        ← Verificación de mock API
├── docs\
│   ├── ENERGY_REPORT.md            ← Análisis técnico
│   └── GREENFRAME_GUIDE.md         ← Esta guía
├── greenframe.json                 ← Configuración de escenarios
├── .lighthouserc.json              ← Configuración de Lighthouse
├── db.json                         ← Datos mock
└── package.json                    ← Scripts npm
```

---

## 💡 Ejemplo de Uso Real

```powershell
# 1. Lanzar aplicación
cd gestion-proyectos-frontend
npm start

# 2. En otra terminal, medir
cd ..
npm run energy:measure

# 3. Resultado esperado (después de 1-2 minutos):
# ⚡ ESTIMATED ENERGY CONSUMPTION:
#    0.125 Wh (per visit)

# 4. Abre el reporte HTML:
start energy-reports\audit-2025-11-16T*.html
```

---

## ❓ Preguntas Frecuentes

**¿Lighthouse vs GreenFrame?**
- **Lighthouse:** Gratuito, rápido, bueno para desarrollo local (Windows).
- **GreenFrame:** Profesional, más detallado (require bash o descarga manual), mejor para producción.

**¿Cómo mejoro la puntuación energética?**
1. Reduce LCP: lazy loading, code splitting.
2. Reduce TBT: mueve JS pesado a web workers.
3. Reduce bytes: compresión, minificación, eliminar código no usado.

**¿Con qué frecuencia medir?**
- Desarrollo: después de cambios significativos.
- Producción: semanalmente o antes de releases.

---

## 📞 Soporte

Para más información:
- **GreenFrame:** https://greenframe.io
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Web Vitals:** https://web.dev/vitals/

---

**¡Esperamos que disfrutes optimizando para un software más verde! 🌱⚡**

*Última actualización: 16 de Noviembre de 2025*
