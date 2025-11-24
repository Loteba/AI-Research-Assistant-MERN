# Reporte de Mejora Energética — Componente `GreenProjectList`

## Resumen ejecutivo
Se implementó `GreenProjectList`, un componente React optimizado para reducir consumo energético asociado a la carga y renderizado de la lista de proyectos. Las optimizaciones aplicadas incluyen:

- Caché en `sessionStorage` con política stale-while-revalidate (reduce peticiones de red repetidas).
- Carga perezosa (lazy) de tareas: las tareas de cada proyecto se solicitan únicamente cuando el usuario expande el proyecto.
- Componentes memoizados (`React.memo`) y uso de `useMemo`/`useCallback` para evitar renders innecesarios.

Estas técnicas reducen consumo de CPU en cliente y cantidad de bytes transferidos desde el servidor, lo que a su vez reduce consumo energético en el dispositivo del usuario y en la infraestructura backend.

---

## Cambios implementados (resumen técnico)
- Archivo: `gestion-proyectos-frontend/src/components/projects/GreenProjectList.js`
  - Lectura/escritura de cache en `sessionStorage` con TTL de 5 minutos.
  - Si hay cache válida, muestra datos inmediatamente y en segundo plano actualiza cache (stale-while-revalidate).
  - Lazy loading de tareas con `projectService.getTasksForProject(projectId)` solo al expandir.
  - `ProjectItem` memoizado para reducir re-render.
- Archivo: `gestion-proyectos-frontend/src/components/projects/GreenProjectList.css`
  - Estilos simples y accesibles.

---

## Estimación del impacto energético
> Nota: No se ejecutaron herramientas externas (EcoGrader/GreenFrame) directamente; las estimaciones siguientes usan métricas y referencias públicas sobre ahorro energético por reducción de tráfico de red y trabajo de CPU en cliente/servidor.

Supuestos conservadores:
- Peticiones promedio a `/projects` devuelven 100 KB de JSON.
- Peticiones a `/projects/:id/tasks` devuelven 20 KB por proyecto.
- Usuario medio abre la página de proyectos 10 veces por semana.
- Sin caché, cada carga de página realiza 1 petición `/projects` y 3 peticiones `/projects/:id/tasks` (suponiendo el usuario explora 3 proyectos), total bytes = 100 + 3*20 = 160 KB por visita.
- Con la estrategia aplicada (cache + lazy): 70% de visitas usan cache y no hacen petición `/projects` al cargar (solo una petición en segundo plano ocasional); tareas se piden solo si usuario expande proyecto.

Cálculo simplificado (por visita):
- Sin optimización: 160 KB
- Con optimización (promedio):
  - 70% de visitas: sólo tareas cuando expande → si expande 3 proyectos: 3*20 = 60 KB
  - 30% de visitas: petición `/projects` + 1 petición adicional de tareas = 100 + 20 = 120 KB
  - Promedio bytes = 0.7*60 + 0.3*120 = 42 + 36 = 78 KB

Ahorro de transferencia de datos por visita: (160 - 78) / 160 = 51.25% de reducción.

Efecto sobre consumo energético (estimación usando factor de energía por GB transferido):
- Referencia: transmisión de datos móvil/ISP varía entre 0.5 - 5 kWh/GB; tomamos un valor conservador intermedio de 2 kWh/GB para infraestructura+red.
- Reducción por visita en kWh = (0.160 - 0.078) MB * 2 kWh/GB = (0.082 MB) * 0.002 kWh/MB = 0.000164 kWh ≈ 0.164 Wh
- Para 10 visitas/semana por usuario → ahorro ≈ 1.64 Wh/semana ≈ 85.3 Wh/año (~0.085 kWh/año) por usuario.

Para 1.000 usuarios activos:
- Ahorro anual ≈ 85.3 kWh/año (aprox. 0.085 MWh/año).

Observaciones adicionales (CPU y renderizado):
- Al reducir renders innecesarios (memo + hooks), la carga de CPU en cliente se reduce; estimamos una reducción de ~10-25% en tiempo de CPU por visita en escenarios típicos, lo que reduce consumo en dispositivos (difícil de cuantificar exactamente sin mediciones). Esto mejora latencia y disminuye energía de la CPU del dispositivo.

---

## Recomendaciones para maximizar ahorro energético
1. Extender caché a `localStorage` o IndexedDB para sesiones recurrentes más largas (cuidado con coherencia de datos).
2. Implementar paginación o virtualización (react-window/react-virtualized) para listas muy largas, reduciendo renderizado y memoria.
3. Comprimir respuestas JSON en el servidor (gzip/brotli) para reducir bytes transferidos.
4. Servir recursos estáticos desde CDN con políticas de cache optimizadas.
5. Medir con herramientas reales:
   - Usar GreenFrame para analizar carga de página (render + CPU) y calcular KPIs de energía de frontend.
   - Usar EcoGrader (o métricas internas) para estimar impacto en infraestructura y CO2.

---

## Métrica objetivo y seguimiento
- KPI recomendado: "Bytes transferidos por visita" y "Tiempo de CPU en renderizado (ms)".
- Objetivo inicial: reducir bytes por visita en ≥40% y tiempo de CPU en ≥15% para páginas de lista.

---

## Conclusión
La implementación de `GreenProjectList` proporciona una reducción inmediata estimada del 50% en transferencia media por visita y una reducción adicional en CPU por renderizado gracias a memoización y lazy-loading. Para escalar este ahorro a nivel de producto, recomendamos combinar estas técnicas con paginación/virtualización y compresión de red, y medir con herramientas como GreenFrame o EcoGrader para obtener métricas reales.
