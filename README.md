# QuestBloom: Focus RPG (Gestor de Tareas Gamificado)

QuestBloom es un administrador de tareas construido con la meta de convertir tu disciplina en un **ecosistema legendario**. Es una SPA interactiva (Single Page Application) construida en React + Vite que combina elementos de los videojuegos RPG, mecánicas de los jardines virtuales (Zen Gardens), música para enfoque (Focus Mode) y un sistema Gacha.

## Características Principales

### 🗡️ Sistema de Combate (Bestiario)
Cada tarea creada toma la forma de un enemigo dentro de un reino de fantasía.
- **Monstruos Diarios (Tareas Simples):** Tareas rápidas. Te enfrentarás azarosamente a variantes como el "Slime de la Procrastinación", el "Goblin del Desorden" o la "Gárgola de la Indecisión".
- **Jefes de Proyecto (Tareas Complejas):** Cuando creas una tarea con 5 o más subtareas, estás invocando a un Boss, como "Cronos, el Devorador de Plazos" o "La Hidra de los Pendientes Infinitos". 
- **Animaciones:** ¡Al completar tareas, verás animaciones (shake effects) donde destrozas a tus enemigos para ganar Experiencia (XP) y Monedas!

### 🌿 Jardín Zen de 10 Slots
Ganas semillas para tu jardín a medida que avanzas. Tienes 10 espacios físicos donde plantar.
- **Ciclo de Vida:** Las plantas entran como Semillas, luego Brotes, Plantas Jóvenes y, finalmente, Plantas Maestras, dependiendo de cuantas tareas completes.
- **Laboratorio de Fusión:** Cansado de semillas comunes, puedes fusionar varias semillas de menor rango (Ej. 2 Semillas Comunes) para obtener semillas más raras. 

### 🎶 Reproductor Focus Music
La concentración es clave. QuestBloom integra un panel musical donde puedes reproducir melodías Lofi y Zen (ej. "Lluvia suave") para acompañarte en tu aventura de estudio o trabajo.
- **Contraataque del Monstruo:** Si dejas la pestaña mientras concentras y escuchas música, ¡el monstruo contraatacará y te restará monedas como penalización! 

### 🎁 La Tienda "El Refugio del Jardinero"
Gasta el botín de tus victorias comprando Suministros o jugando a la **Caja de Semillas (Gacha)** para obtener semillas legendarias.
Probabilidades base de la Caja:
- **Común**: 50%
- **Rara**: 25%
- **Épica**: 20%
- **Exótica**: 4.9%
- **Mercado Negro**: 0.1% (Animaciones celestiales y plantas extremadamente únicas como la 'Enredadera del Caos').

## Demo (Modo Invitado)

La app está diseñada con un **Modo Invitado** que provee de "Mock Data" si decides probarla sin configurar un backend. Podrás interactuar con los layouts de tareas, la tienda y el jardín con algunas plantas ya desplegadas (como el Bonsái Galáctico).

## Despliegue Técnico
- **Framework:** React + Vite
- **Animaciones:** Framer Motion y canvas-confetti.
- **Base de Datos/Auth:** Supabase (PostgreSQL), protegiendo la visibilidad a través de Row Level Security (RLS).
- **Estética:** Glassmorphism, CSS Modules dinámico y Variables para modo oscuro con resplandores mágicos.

## Estructura Local
Para correr el proyecto localmente (si conectaste el Supabase, configura tu archivo `.env`):
```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev
```
