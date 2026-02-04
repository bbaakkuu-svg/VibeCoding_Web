# 🎓 Aula Virtual de Programación --> https://bbaakkuu-svg.github.io/VibeCoding_Web/

Plataforma web educativa moderna orientada al aprendizaje de programación mediante **video‑tutoriales en español de YouTube**, con rutas personalizadas, comunidad, gamificación y una experiencia de usuario intuitiva.

El proyecto está diseñado para desarrollarse con **HTML5, CSS3 y JavaScript puro**, siguiendo un enfoque **Review‑Driven Development asistido por Agentes (Visual Studio Code IDE)**.

---

##  Objetivo del Proyecto

Crear un **aula virtual interactiva** que permita a los usuarios:

* Aprender los principales lenguajes de programación
* Seguir rutas de aprendizaje personalizadas según su perfil y objetivos
* Practicar con retos y proyectos integradores
* Participar en una comunidad activa
* Reconocer y agradecer a los creadores de contenido educativo

---

##  Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Diseño:** Flexbox, Grid, CSS Variables, Animaciones CSS
* **UX/UI:** Diseño moderno, responsive, accesible
* **Persistencia simulada:** JSON local, localStorage
* **Multimedia:** YouTube (embebido / enlaces)
* **Voz:** Web Speech API (si el navegador lo permite)

---

##  Lenguajes Incluidos

* Java
* Python
* JavaScript
* SQL
* Bash
* HTML5
* CSS3
* Git / GitHub

Cada lenguaje se presenta mediante **cards interactivas** con:

* Icono representativo
* Imagen clicable enlazada a video‑tutoriales
* Estructura de contenidos:

  * Explicación teórica
  * Coding en vivo
  * Retos prácticos
  * Proyecto integrador

---

##  Funcionalidades Principales

###  Interfaz Moderna

* Dashboard limpio e intuitivo
* Diseño responsive (desktop, tablet, mobile)
* Modo **Dark / Light**
* Animaciones suaves y micro‑interacciones

###  Rutas de Aprendizaje Personalizadas

* Por nivel: Principiante, Intermedio, Avanzado
* Por objetivo: Frontend, Backend, Data, DevOps
* Incluyen contenidos, retos, proyectos y métodos de evaluación

###  Evaluación y Progreso

* Tests teóricos
* Retos prácticos
* Proyecto integrador
* Indicadores visuales de progreso

###  Gamificación

* Puntos por progreso
* Reconocimiento por contribuciones
* Participación en comunidad

###  Buzón de Sugerencias

* Mensajes escritos
* Mensajes de voz
* Sistema de votación democrática
* Histórico transparente

###  Comunidad y Networking

* Foro de discusión
* Grupos de estudio
* Tablero de empleos (mock)

###  Autores Recomendados

* Reconocimiento a creadores de contenido
* Enlaces a canales de YouTube
* Mensajes de agradecimiento visibles

---

## 📁 Estructura del Proyecto

```text
/
├── index.html
├── styles.css
├── app.js
├── data/
│   ├── languages.json
│   ├── authors.json
│   └── learning-paths.json
└── README.md
```

---

##  Roadmap de Desarrollo

### Fase 1 — Fundamentos

* Estructura HTML semántica
* Navegación principal
* Layout base responsive

### Fase 2 — Diseño y Experiencia

* Estilos CSS modernos
* Tipografía tecnológica
* Dark / Light mode
* Animaciones y micro‑interacciones

### Fase 3 — Lógica y Dinamismo

* Renderizado dinámico desde JSON
* Búsqueda inteligente
* Gestión de estado básica

### Fase 4 — Aprendizaje y Evaluación

* Rutas personalizadas
* Sistema de progreso
* Retos y proyectos

### Fase 5 — Comunidad y Participación

* Foro simulado
* Grupos de estudio
* Buzón de sugerencias

### Fase 6 — Optimización y Offline

* Service Worker
* Modo offline
* Optimización de rendimiento

---

##  Arquitectura de Agentes (Visual Studio Code IDE)

El desarrollo se apoya en **sub‑agentes especializados**, cada uno con responsabilidades claras:

###  Agente de Arquitectura

* Diseña estructura del proyecto
* Define componentes y flujo de navegación

###  Agente UI/UX

* Define estilos visuales
* Experiencia de usuario
* Accesibilidad

###  Agente de Contenidos Educativos

* Organización de lenguajes y videos
* Estructura pedagógica

###  Agente JavaScript

* Lógica de renderizado
* Interactividad
* Gestión de estado

###  Agente de Comunidad y Feedback

* Buzón de sugerencias
* Gamificación
* Participación del usuario

###  Agente de Evaluación

* Tests
* Retos
* Seguimiento de progreso

> Cada agente **propone cambios**, que deben ser **revisados y aprobados manualmente** (Review‑Driven Development).

---

##  Buenas Prácticas

* Revisión de diffs antes de aceptar cambios de agentes
* Separación clara de responsabilidades
* Código comentado y legible

---

##  Licencia

Proyecto educativo y demostrativo. El contenido de terceros (videos de YouTube) pertenece a sus respectivos autores y se utiliza únicamente con fines educativos y de reconocimiento.

---

##  Agradecimientos

Gracias a todos los **creadores de contenido educativo en español** que comparten su conocimiento y hacen posible el aprendizaje abierto.

---

> **Estado del proyecto:** En desarrollo 

PROMPTS USADOS EN EL PROYECTO: 
PROMPT 1: Actúa como un arquitecto frontend senior, diseñador UX/UI y desarrollador JavaScript experto.
Diseña y desarrolla una plataforma web tipo “Aula Virtual” para programación, basada en HTML5, CSS3 y JavaScript puro (sin frameworks), cuyo contenido principal sean video-tutoriales en español de YouTube sobre los principales lenguajes de programación.

La web debe ser moderna, tecnológica, accesible, modular, escalable y completamente responsive.

LENGUAJES A INCLUIR:
Java, Python, JavaScript, SQL, Bash, HTML5, CSS3, Git/GitHub.

ARQUITECTURA Y ESTRUCTURA:
- Separar el proyecto en archivos claros: index.html, styles.css y app.js.
- Proponer y explicar previamente:
  - Estructura de carpetas
  - Componentes principales de la UI
  - Flujo de navegación
  - Gestión de estado en JavaScript
  - Estrategia responsive
  - Dark / Light mode
  - Modo offline mediante Service Worker
- No inventar backend; simular datos con JSON local y localStorage.
- Usar español en la interfaz, textos y comentarios de código.
- No aplicar cambios sin mostrar diff y explicación.

PROMPT 2: ESTRUCTURA DE LA WEB (HTML SEMÁNTICO):
- Header con navegación principal
- Dashboard inicial
- Sección de lenguajes de programación
- Rutas de aprendizaje personalizadas
- Comunidad y Networking
- Buzón de sugerencias
- Autores recomendados
- Footer

PROMPT 3: MÓDULO DE LENGUAJES Y VIDEOS:
Cada lenguaje debe mostrarse como una card interactiva con:
- Icono representativo del lenguaje
- Imagen clicable que enlace a un video de YouTube (placeholder)
- Organización del contenido en:
  - Explicación teórica
  - Coding en vivo
  - Retos prácticos
  - Proyecto integrador
- Renderizado dinámico desde datos simulados (JSON).

PROMPT 4: DISEÑO UI/UX Y CSS:
- Estilo moderno y actual (glassmorphism o neumorphism ligero).
- Uso de Flexbox y Grid.
- Animaciones suaves (hover, scroll, transiciones).
- Elementos visuales interactivos:
  - Diagramas animados simples
  - Comparativas visuales entre lenguajes
  - Mockups dinámicos
  - Indicadores de progreso animados
- Accesibilidad (contraste, navegación por teclado, ARIA).
- Diseño 100% responsive.

PROMPT 5: TIPOGRAFÍA:
- Usar tipografías modernas y tecnológicas desde Google Fonts
  (por ejemplo: Inter, Space Grotesk, IBM Plex, JetBrains Mono).
- Definir jerarquía tipográfica clara:
  - Títulos
  - Subtítulos
  - Texto de lectura
  - Código
- Implementar con variables CSS.
- Integrar correctamente con dark/light mode.
- Mantener legibilidad en desktop y mobile.

PROMPT 6: JAVASCRIPT (LÓGICA PRINCIPAL):
- Renderizar dinámicamente contenidos desde JSON.
- Navegación entre secciones.
- Búsqueda inteligente por lenguaje y tipo de contenido.
- Gestión de dark/light mode.
- Sistema básico de gamificación (puntos, progreso, contribuciones).
- Mantener código claro, comentado y sin librerías externas.

PROMPT 7: BUZÓN DE SUGERENCIAS:
- Mensajes escritos.
- Grabación de mensajes de voz (Web Speech API si es posible).
- Sistema de votación democrática.
- Histórico transparente de sugerencias.
- Gamificación por participación.
- Persistencia simulada con localStorage.

PROMPT 8: AUTORES RECOMENDADOS:
- Cards con:
  - Nombre del creador
  - Lenguajes que enseña
  - Enlace a su canal de YouTube
  - Mensaje visible de agradecimiento
- Datos simulados.

PROMPT 9: RUTAS DE APRENDIZAJE PERSONALIZADAS:
- Rutas según perfil:
  - Principiante
  - Intermedio
  - Avanzado
- Rutas según objetivo:
  - Frontend
  - Backend
  - Data
  - DevOps
- Cada ruta debe incluir:
  - Secuencia de contenidos
  - Lenguajes recomendados
  - Retos y proyectos finales
  - Métodos de evaluación
- Implementar lógica básica en JavaScript.

PROMPT 10: EVALUACIÓN Y PROGRESO:
- Tests teóricos.
- Retos prácticos.
- Proyecto integrador.
- Seguimiento visual del progreso del usuario.
- Sin backend.

PROMPT 11: COMUNIDAD Y NETWORKING:
- Foro de discusión (simulado).
- Grupos de estudio.
- Tablero de empleos (mock).
- Diseño tipo dashboard.
- Datos simulados con JSON.

PROMPT 12: REGLAS IMPORTANTES:
- No usar frameworks ni librerías externas.
- Mantener código modular y legible.
- Mostrar siempre el plan antes de escribir código.
- Mostrar diffs antes de aplicar cambios.
- Priorizar un enfoque Review-Driven Development.
