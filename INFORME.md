# Informe Breve: QuestBloom (Focus RPG)

## 1. Diagrama Simple de la Arquitectura
La aplicación sigue una arquitectura cliente-servidor Serverless (BaaS - Backend as a Service) fuertemente acoplada a través de un estado global en React.



+-------------------------------------------------------------+
|                     FRONTEND (React + Vite)                 |
|                                                             |
|  +--------------+   +--------------+   +-----------------+  |
|  | Auth UI      |   | TaskManager  |   | Garden / Tienda |  |
|  +------+-------+   +------+-------+   +-------+---------+  |
|         |                  |                   |            |
|         v                  v                   v            |
|  +-------------------------------------------------------+  |
|  |                GameContext (Global State)             |  |
|  |  (Maneja optimismo UI, sincronización e inventario)   |  |
|  +--------------------------+----------------------------+  |
+-----------------------------|-------------------------------+
                              |
                     (WebSocket / REST API)
                              |
+-----------------------------v-------------------------------+
|                    SUPABASE (BaaS Cloud)                    |
|                                                             |
|  +--------------+   +--------------+   +-----------------+  |
|  | GoTrue Auth  |   | PostgreSQL   |   | Realtime Engine |  |
|  | (Autenticación)| | (DB Relacional)| | (Suscripciones) |  |
|  +--------------+   +--------------+   +-----------------+  |
+-------------------------------------------------------------+
```

## 2. Sincronización en Tiempo Real y Servicio Elegido

Para la capa de backend y sincronización se eligió **Supabase**. Las razones y métodos de implementación son:
- **Optimistic UI:** Cuando el usuario completa una tarea o planta una semilla, el estado de React (`GameContext`) se actualiza inmediatamente (reflejando el XP, monedas, o aparición de la semilla) brindando una experiencia inmersiva sin tiempos de carga (0 ms de latencia percibida).
- **Aseguramiento asíncrono:** Inmediatamente después del estado local, `GameContext.jsx` despacha las promesas concurrentes (`supabase.from('table').update()`) en modo silencioso.
- **Identidad Fuerte y RLS:** Se usa `Row Level Security` (RLS) en las tablas de PostgreSQL, vinculando cada transacción (inserts de jardín, updates de inventario, bajas de monstruos) estrictamente al `session.user.id`. Si otra conexión corrompe el ID, la transacción a la base de datos se rechaza por seguridad nativa.
- **Funcionalidad Adicional (Polyfill Móvil):** Dadas las limitantes criptográficas (`crypto.randomUUID`) en conexiones HTTP móviles o contextos no seguros, implementamos un Polyfill temporal para inyectar IDs únicos garantizados en el frontend al añadir tareas (UUIDv4 Mock) permitiendo jugar ininterrumpidamente desde cualquier equipo de testing en red local.

## 3. Capturas de Pantalla (Desktop y Mobile)

*(Nota: Espacios reservados para adjuntar las capturas reales tras el despliegue final)*

### Desktop (1920x1080)
![Captura Desktop - Sistema de Jardinería](./_CAPTURAS/desktop_garden.png)
*Destacando la cuadrícula de plantación tipo matriz isométrica (CSS Grid) y el modal dinámico de la Tienda que se ancla al cristal de la pantalla (Viewport).*

### Mobile (iPhone/Android)
![Captura Mobile - Bestiario de Tareas](./_CAPTURAS/mobile_tasks.png)
*Destacando el Flex-wrap adaptativo que apila el 'Salón de los Caídos' bajo la Arena de Combate, rediseñando la barra de navegación lateral a un dock inferior para usabilidad de un solo dedo.*

## 4. Dificultades Encontradas y Soluciones

1. **Bug de Persistencia Silenciosa al Plantar:**
   - **Problema:** Al plantar, el inventario borraba localmente la semilla pero el objeto no se guardaba en la base de datos, desvaneciéndose al recargar la página.
   - **Causa:** En la lógica del jardín (UI) introdujimos una bandera `needs_water: false`, la cual no formaba parte del esquema original de PostgreSQL. Supabase rechazaba silenciosamente el `update/insert` entero al no reconocer esa columna.
   - **Solución:** Implementamos un algoritmo de limpieza (*Destructuring*) en el envío a Supabase (`const { needs_water, ...updateData } = slot;`) para que a la nube únicamente viajen datos estrictamente tipados al esquema.

2. **Modales Desviados por Efectos de Animación (Framer Motion Blur):**
   - **Problema:** En móviles iOS, los cuadros de diálogo (Confirmación de Borrar Tareas) salían movidos o invisibles en pantalla impidiendo usarlos sin hacer Scroll vertical. Se rompió la propiedad CSS `position: fixed`.
   - **Causa:** La transición de entrada de `App.jsx` usaba un atributo `filter: blur(...)`. Los motores Webkit (Safari, Chrome) desactivan el renderizado de cajas de posicionamiento `fixed` de forma nativa cuando un div padre tiene filtros como Blur o Transformaciones.
   - **Solución:** Se retiró el `blur` de la montura principal de la app y para las alertas se generó un contenedor envolvente CSS personalizado llamado `.modal-backdrop-fixed` directamente en el `index.css` que garantiza 100vw/100vh constantes sobre el flujo de impresión (Render Tree).
