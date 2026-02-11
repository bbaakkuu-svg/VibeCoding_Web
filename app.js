(function(){
  'use strict';

  const LANG_DATA_ID = 'languages-data';
  const LS_KEY = 'vibe_user_state_v1';
  const LEADERBOARD_KEY = 'vibe_leaderboard_v1';
  const POINTS_LOG_KEY = 'vibe_points_log_v1';

  // ====== GAMIFICATION SYSTEM ======
  // Punto values for different actions
  const POINT_VALUES = {
    videoWatch: 15,
    categoryExplore: 5,
    routeStep: 10,
    forumPost: 20,
    forumVote: 2,
    compareView: 5,
    suggestionComplete: 3,
    dailyStreak: 50,
    weeklyStreak: 100
  };

  // ====== FIREBASE INITIALIZATION ======
  const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyExample123456789",
    authDomain: "vibecoding-demo.firebaseapp.com",
    projectId: "vibecoding-demo",
    storageBucket: "vibecoding-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456ghi789"
  };

  let db = null;
  let firebaseReady = false;

  // Initialize Firebase when DOM is ready
  function initializeFirebase(){
    try{
      if(typeof firebase !== 'undefined'){
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('Firebase initialized successfully');
        loadForumPosts();
      }
    }catch(e){
      console.warn('Firebase init error:', e.message);
      firebaseReady = false;
    }
  }

  // ====== FORUM FUNCTIONS ======
  function loadForumPosts(){
    if(!db) return;
    const forumList = document.getElementById('forum-list');
    if(!forumList) return;

    // Real-time listener for forum posts
    db.collection('forum')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        forumList.innerHTML = '';
        snapshot.forEach(doc => {
          const post = doc.data();
          post.id = doc.id;
          renderForumPost(post);
        });
      }, error => {
        console.warn('Forum load error:', error);
        forumList.innerHTML = '<li class="muted">Error al cargar el foro. Intenta más tarde.</li>';
      });
  }

  function renderForumPost(post){
    const forumList = document.getElementById('forum-list');
    if(!forumList) return;

    const li = document.createElement('li');
    li.style.background = 'var(--surface)';
    li.style.padding = '0.8rem';
    li.style.marginBottom = '0.6rem';
    li.style.borderRadius = '10px';
    li.style.border = '1px solid var(--glass-border)';

    const timestamp = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString('es-ES', {year:'numeric',month:'short',day:'numeric'}) : 'Hace poco';
    const upvotes = post.upvotes || 0;
    const downvotes = post.downvotes || 0;

    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.4rem">
        <div>
          <strong style="color:var(--accent)">${post.author || 'Anónimo'}</strong>
          <span style="color:var(--muted);font-size:0.85rem;margin-left:0.5rem">${timestamp}</span>
        </div>
        <button class="vote-btn" data-post-id="${post.id}" data-vote="up" style="background:transparent;border:none;color:var(--accent);cursor:pointer;font-weight:600">👍 ${upvotes}</button>
        <button class="vote-btn" data-post-id="${post.id}" data-vote="down" style="background:transparent;border:none;color:var(--muted);cursor:pointer">👎 ${downvotes}</button>
      </div>
      <h4 style="margin:0.4rem 0;font-size:1rem">${post.title}</h4>
      <p style="margin:0.4rem 0;color:var(--text);line-height:1.5">${post.body}</p>
    `;

    forumList.appendChild(li);

    // Add vote listeners
    li.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const postId = btn.dataset.postId;
        const voteType = btn.dataset.vote;
        handleVote(postId, voteType);
      });
    });
  }

  function handleVote(postId, voteType){
    if(!db) return;
    const fieldName = voteType === 'up' ? 'upvotes' : 'downvotes';
    db.collection('forum').doc(postId).update({
      [fieldName]: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
      // Award points for voting
      const state = loadState();
      awardPoints(state, POINT_VALUES.forumVote, `Votaste en el foro`);
    }).catch(error => console.warn('Vote error:', error));
  }

  function submitForumPost(){
    if(!db) return;
    const titleInput = document.getElementById('forum-title');
    const bodyInput = document.getElementById('forum-body');

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if(!title || !body){
      alert('Por favor completa título y descripción');
      return;
    }

    db.collection('forum').add({
      title: title,
      body: body,
      author: 'Usuario ' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0
    }).then(() => {
      titleInput.value = '';
      bodyInput.value = '';
      alert('¡Post publicado correctamente!');
      // Award points for posting
      const state = loadState();
      awardPoints(state, POINT_VALUES.forumPost, `Publicaste en el foro`);
    }).catch(error => {
      console.error('Post error:', error);
      alert('Error al publicar. Intenta de nuevo.');
    });
  }

  // ====== AFTER ORIGINAL CODE ======

  // Helper: Get video URL for a language name
  function getVideoUrlByLanguage(langName){
    const dataEl = document.getElementById(LANG_DATA_ID);
    if(!dataEl) return null;
    try{
      const data = JSON.parse(dataEl.textContent);
      const lang = data.languages.find(l => l.name === langName);
      return lang ? lang.video : null;
    }catch(e){
      return null;
    }
  }

  // Helper: Get learning tool URL based on tool type
  function getLearningToolUrl(toolName){
    const toolMap = {
      'Quiz teórico': 'https://quizlet.com/',
      'Quiz': 'https://quizlet.com/',
      'Test': 'https://www.examtimizer.com/',
      'Checklist': 'https://www.notion.so/',
      'Revisión de proyecto por pares': 'https://github.com/',
      'Code review': 'https://github.com/pulls',
      'Tests automáticos básicos': 'https://jestjs.io/',
      'Integración continua': 'https://www.github.com/features/actions',
      'Pruebas unitarias simples': 'https://jestjs.io/',
      'Pruebas de resiliencia': 'https://www.gremlin.com/',
      'Despliegue en GitHub Pages': 'https://pages.github.com/',
      'Demo en vídeo': 'https://www.loom.com/',
      'Auditoría de rendimiento': 'https://web.dev/measure/',
      'Checklist de accesibilidad': 'https://www.a11yproject.com/checklist/',
      'Presentación técnica': 'https://www.canva.com/',
      'Documentación de API': 'https://swagger.io/',
      'Seguridad básica': 'https://owasp.org/',
      'Cobertura de tests': 'https://istanbul.js.org/',
      'Notebook evaluado': 'https://jupyter.org/',
      'Reproducibilidad': 'https://github.com/',
      'Explicación en vídeo': 'https://www.loom.com/',
      'Métricas del modelo': 'https://scikit-learn.org/',
      'Reporte técnico': 'https://www.overleaf.com/',
      'Benchmark': 'https://www.sysbench.com/',
      'Peer review': 'https://github.com/features/code-review',
      'Revisión de scripts': 'https://www.shellcheck.net/',
      'Checklists de buenas prácticas': 'https://www.notion.so/',
      'Pipeline funcional': 'https://www.github.com/features/actions',
      'Logs y monitoreo': 'https://www.datadoghq.com/',
      'Documentación de runbooks': 'https://www.notion.so/',
      'Revisión de arquitectura': 'https://www.draw.io/',
      'Plan de escalado': 'https://www.lucidchart.com/'
    };
    return toolMap[toolName] || '#';
  }

  // Utilities
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function parseJsonFromScript(id){
    const el = document.getElementById(id);
    if(!el) return null;
    try{ return JSON.parse(el.textContent); }catch(e){ console.warn('JSON parse error', e); return null; }
  }

  // State management
  function loadState(){
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return {points:0, progress:{}, userId: generateUserId(), streakDays: 0, lastActiveDay: null};
    try{ 
      const state = JSON.parse(raw);
      // Initialize missing fields
      if(!state.userId) state.userId = generateUserId();
      if(state.points === undefined) state.points = 0;
      if(!state.streakDays) state.streakDays = 0;
      if(!state.lastActiveDay) state.lastActiveDay = getTodayDateString();
      return state;
    }catch(e){ 
      return {points:0, progress:{}, userId: generateUserId(), streakDays: 0, lastActiveDay: null}; 
    }
  }

  function saveState(state){ 
    // Check streak
    const today = getTodayDateString();
    if(state.lastActiveDay !== today){
      // New day - check streak
      if(state.lastActiveDay === getYesterdayDateString()){
        state.streakDays = (state.streakDays || 0) + 1;
        // Daily streak bonus
        if(state.streakDays >= 3 && state.streakDays % 3 === 0){
          state.points += POINT_VALUES.dailyStreak;
          console.log('🔥 Bono de 3 días seguidos: +50 puntos');
        }
        // Weekly streak bonus
        if(state.streakDays >= 7 && state.streakDays % 7 === 0){
          state.points += POINT_VALUES.weeklyStreak;
          console.log('🏆 Bono de 7 días seguidos: +100 puntos');
        }
      } else {
        state.streakDays = 1;
      }
      state.lastActiveDay = today;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    updateLeaderboard(state);
  }

  // ====== LEADERBOARD SYSTEM ======
  function generateUserId(){
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    return id;
  }

  function getTodayDateString(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getYesterdayDateString(){
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getWeekStartDate(){
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function updateLeaderboard(state){
    const leaderboard = getLeaderboard();
    const userId = state.userId;
    const today = getTodayDateString();
    const weekStart = getWeekStartDate();

    // Update or create user entry
    let userEntry = leaderboard.users[userId];
    if(!userEntry){
      userEntry = {
        userId: userId,
        dailyScores: {},
        weeklyScores: {},
        totalPoints: 0,
        lastUpdated: today
      };
    }

    // Daily score
    if(!userEntry.dailyScores) userEntry.dailyScores = {};
    userEntry.dailyScores[today] = state.points;

    // Weekly score
    if(!userEntry.weeklyScores) userEntry.weeklyScores = {};
    userEntry.weeklyScores[weekStart] = (userEntry.weeklyScores[weekStart] || 0) + state.points;

    // Total
    userEntry.totalPoints = state.points;
    userEntry.lastUpdated = today;

    leaderboard.users[userId] = userEntry;
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }

  function getLeaderboard(){
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if(!raw) return {users: {}, lastReset: getTodayDateString()};
    try{ return JSON.parse(raw); }catch(e){ return {users: {}, lastReset: getTodayDateString()}; }
  }

  function getDailyRanking(){
    const leaderboard = getLeaderboard();
    const today = getTodayDateString();
    const entries = Object.values(leaderboard.users)
      .map(u => ({
        userId: u.userId,
        points: u.dailyScores[today] || 0,
        totalPoints: u.totalPoints
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    return entries;
  }

  function getWeeklyRanking(){
    const leaderboard = getLeaderboard();
    const weekStart = getWeekStartDate();
    const entries = Object.values(leaderboard.users)
      .map(u => ({
        userId: u.userId,
        points: u.weeklyScores[weekStart] || 0,
        totalPoints: u.totalPoints
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    return entries;
  }

  function renderLeaderboards(){
    renderDailyLeaderboard();
    renderWeeklyLeaderboard();
  }

  function renderDailyLeaderboard(){
    const container = document.getElementById('daily-leaderboard');
    if(!container) return;

    const ranking = getDailyRanking();
    const state = loadState();

    let html = '<h4 style="margin-top:0">🔥 Hoy</h4><ol style="margin:0;padding-left:1.2rem">';
    ranking.forEach((entry, idx) => {
      const isCurrent = entry.userId === state.userId;
      const bgColor = isCurrent ? 'background:rgba(58,130,246,0.2);' : '';
      html += `
        <li style="padding:0.3rem 0;${bgColor}">
          <span style="font-weight:700">${entry.points}</span> pts 
          <span style="color:var(--muted);font-size:0.85rem">${entry.userId.substr(0,12)}</span>
        </li>
      `;
    });
    html += '</ol>';
    container.innerHTML = html;
  }

  function renderWeeklyLeaderboard(){
    const container = document.getElementById('weekly-leaderboard');
    if(!container) return;

    const ranking = getWeeklyRanking();
    const state = loadState();

    let html = '<h4 style="margin-top:0">🏆 Esta semana</h4><ol style="margin:0;padding-left:1.2rem">';
    ranking.forEach((entry, idx) => {
      const isCurrent = entry.userId === state.userId;
      const bgColor = isCurrent ? 'background:rgba(58,130,246,0.2);' : '';
      html += `
        <li style="padding:0.3rem 0;${bgColor}">
          <span style="font-weight:700">${entry.points}</span> pts 
          <span style="color:var(--muted);font-size:0.85rem">${entry.userId.substr(0,12)}</span>
        </li>
      `;
    });
    html += '</ol>';
    container.innerHTML = html;
  }

  /* --- Learning routes templates and logic --- */
  const ROUTE_TEMPLATES = {
    frontend: {
      beginner: {
        sequence:[
          {title:'Fundamentos de HTML y Semántica',type:'teoría'},
          {title:'CSS básicos: Box model y Layout',type:'teoría'},
          {title:'Interactividad con JavaScript',type:'coding'},
          {title:'Proyecto: Landing responsiva',type:'proyecto'}
        ],
        languages:['HTML5','CSS3','JavaScript'],
        finalProject:'Construir una web responsiva completa con componentes accesibles',
        evaluation:['Quiz teórico','Revisión de proyecto por pares','Despliegue en GitHub Pages']
      },
      intermediate: {
        sequence:[
          {title:'CSS avanzado: Grid y Animaciones',type:'teoría'},
          {title:'JS moderno: ES6+, módulos y fetch',type:'coding'},
          {title:'Frameworks: introducción a React/Vue',type:'teoría'},
          {title:'Proyecto: SPA interactiva',type:'proyecto'}
        ],
        languages:['JavaScript','HTML5','CSS3'],
        finalProject:'Crear una SPA con estado, rutas y consumo de API',
        evaluation:['Tests automáticos básicos','Code review','Demo en vídeo']
      },
      advanced: {
        sequence:[
          {title:'Optimización y accesibilidad',type:'teoría'},
          {title:'PWA y rendimiento',type:'coding'},
          {title:'Arquitecturas escalables front-end',type:'teoría'},
          {title:'Proyecto: Plataforma web con PWA',type:'proyecto'}
        ],
        languages:['JavaScript','HTML5','CSS3'],
        finalProject:'Plataforma PWA con offline y buenas prácticas de rendimiento',
        evaluation:['Auditoría de rendimiento','Checklist de accesibilidad','Presentación técnica']
      }
    },
    backend: {
      beginner: {
        sequence:[{title:'Fundamentos de programación (JS/Python)',type:'teoría'},{title:'APIs REST',type:'coding'},{title:'Bases de datos básicas',type:'teoría'},{title:'Proyecto: API simple',type:'proyecto'}],
        languages:['JavaScript','Python','SQL'],
        finalProject:'API REST con persistencia y endpoints CRUD',
        evaluation:['Pruebas unitarias simples','Revisión de endpoints','Documentación de API']
      },
      intermediate: {
        sequence:[{title:'Autenticación y seguridad',type:'teoría'},{title:'Microservicios básicos',type:'teoría'},{title:'Testing y despliegue',type:'coding'},{title:'Proyecto: Servicio con CI',type:'proyecto'}],
        languages:['Java','Python','SQL'],
        finalProject:'Servicio backend con autenticación, tests y CI',
        evaluation:['Integración continua','Cobertura de tests','Seguridad básica']
      },
      advanced: {
        sequence:[{title:'Escalabilidad y caché',type:'teoría'},{title:'Observabilidad',type:'teoría'},{title:'Optimización a nivel DB',type:'coding'},{title:'Proyecto: Sistema escalable',type:'proyecto'}],
        languages:['Java','SQL','Bash'],
        finalProject:'Sistema backend escalable con monitoreo',
        evaluation:['Benchmark','Revisión de arquitectura','Plan de escalado']
      }
    },
    data: {
      beginner: {
        sequence:[{title:'Introducción a Python y Numpy',type:'teoría'},{title:'Manipulación con Pandas',type:'coding'},{title:'Visualización básica',type:'teoría'},{title:'Proyecto: Análisis exploratorio',type:'proyecto'}],
        languages:['Python','SQL'],
        finalProject:'Análisis de dataset con visualizaciones y conclusiones',
        evaluation:['Notebook evaluado','Reproducibilidad','Explicación en vídeo']
      },
      intermediate: {
        sequence:[{title:'Modelos supervisados',type:'teoría'},{title:'Validación y pipelines',type:'coding'},{title:'Deploy de modelos',type:'teoría'},{title:'Proyecto: Modelo predictivo',type:'proyecto'}],
        languages:['Python','SQL'],
        finalProject:'Modelo predictivo con pipeline y evaluación',
        evaluation:['Métricas del modelo','Reproducibilidad','Reporte técnico']
      },
      advanced: {
        sequence:[{title:'Deep learning básico',type:'teoría'},{title:'Optimización y GPU',type:'coding'},{title:'Escalado de modelos',type:'teoría'},{title:'Proyecto: Sistema ML completo',type:'proyecto'}],
        languages:['Python','Bash'],
        finalProject:'Pipeline ML de extremo a extremo',
        evaluation:['Evaluación avanzada','Benchmark','Peer review']
      }
    },
    devops: {
      beginner: {
        sequence:[{title:'Conceptos de sistemas y redes',type:'teoría'},{title:'Scripting básico (Bash)',type:'coding'},{title:'Control de versiones',type:'teoría'},{title:'Proyecto: Automatización simple',type:'proyecto'}],
        languages:['Bash','Git'],
        finalProject:'Scripts de automatización y repositorio organizado',
        evaluation:['Revisión de scripts','Checklists de buenas prácticas']
      },
      intermediate: {
        sequence:[{title:'Contenedores y Docker',type:'teoría'},{title:'Orquestación básica',type:'coding'},{title:'CI/CD',type:'teoría'},{title:'Proyecto: Pipeline CI',type:'proyecto'}],
        languages:['Bash','Git'],
        finalProject:'Pipeline CI/CD que despliega una app en contenedor',
        evaluation:['Pipeline funcional','Logs y monitoreo']
      },
      advanced: {
        sequence:[{title:'Infraestructura como código',type:'teoría'},{title:'Observabilidad y SRE',type:'coding'},{title:'Escalado y alta disponibilidad',type:'teoría'},{title:'Proyecto: Infraestructura automatizada',type:'proyecto'}],
        languages:['Bash','SQL','Git'],
        finalProject:'Infraestructura reproducible con IaC',
        evaluation:['Pruebas de resiliencia','Documentación de runbooks']
      }
    }
  };

  function generateRoute(profile, objective){
    const obj = ROUTE_TEMPLATES[objective];
    if(!obj) return null;
    const tpl = obj[profile];
    if(!tpl) return null;
    // clone and add ids
    const seq = tpl.sequence.map((s,i)=> ({...s,id:`step_${i+1}`}));
    return {profile,objective,sequence:seq,languages:tpl.languages,finalProject:tpl.finalProject,evaluation:tpl.evaluation};
  }

  function renderRouteToDOM(route){
    const container = document.getElementById('route-result');
    if(!container) return;
    if(!route){ container.innerHTML = '<p class="muted">No se pudo generar la ruta.</p>'; return; }
    const seqHtml = route.sequence.map((s,idx)=> `
      <li class="route-step" data-step-id="${s.id}">
        <label><input type="checkbox" class="step-check" data-step-id="${s.id}"> <strong>${idx+1}. ${s.title}</strong> <span class="pill">${s.type}</span></label>
      </li>
    `).join('');

    container.innerHTML = `
      <div class="route-panel">
        <div class="route-meta">
          <div><strong>Perfil:</strong> ${route.profile}</div>
          <div><strong>Objetivo:</strong> ${route.objective}</div>
        </div>
        <h3>Secuencia de contenidos</h3>
        <ol class="route-sequence">${seqHtml}</ol>

        <h4>Recomendación de lenguajes</h4>
        <div class="langs-list">${route.languages.map(l => {
          const videoUrl = getVideoUrlByLanguage(l);
          return videoUrl ? `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="lang-chip" title="Ver video de ${l}">${l}</a>` : `<span class="lang-chip">${l}</span>`;
        }).join(' ')}</div>

        <h4>Proyecto final</h4>
        <div class="project-card">${route.finalProject}</div>

        <h4>Métodos de evaluación</h4>
        <ul class="eval-list">${route.evaluation.map(e => {
          const toolUrl = getLearningToolUrl(e);
          return `<li><a href="${toolUrl}" target="_blank" rel="noopener noreferrer" class="eval-link" title="Acceder a ${e}">${e}</a></li>`;
        }).join('')}</ul>
      </div>
    `;
    // bind step checkboxes
    const state = loadState();
    document.querySelectorAll('.step-check').forEach(ch=>{
      const id = ch.dataset.stepId;
      const completed = state.routes && state.routes[route.objective] && state.routes[route.objective][id];
      ch.checked = !!completed;
      ch.addEventListener('change', e=>{
        const done = e.target.checked;
        state.routes = state.routes || {};
        state.routes[route.objective] = state.routes[route.objective] || {};
        state.routes[route.objective][id] = !!done;
        saveState(state);
        if(done) awardPoints(state, POINT_VALUES.routeStep, `Completaste: ${id}`);
      });
    });
  }

  function bindRouteUI(){
    const gen = document.getElementById('generate-route');
    const saveBtn = document.getElementById('save-route');
    const profileSel = document.getElementById('profile-select');
    const objSel = document.getElementById('objective-select');
    if(gen) gen.addEventListener('click', ()=>{
      const profile = profileSel.value; const objective = objSel.value;
      const route = generateRoute(profile, objective);
      renderRouteToDOM(route);
      // store temp
      localStorage.setItem('vibe_route_last', JSON.stringify(route));
    });
    if(saveBtn) saveBtn.addEventListener('click', ()=>{
      const raw = localStorage.getItem('vibe_route_last'); if(!raw) return alert('Genera una ruta primero.');
      const route = JSON.parse(raw); const st = loadState(); st.savedRoute = route; saveState(st); alert('Ruta guardada en tu perfil (simulado).');
    });
  }


  // Aula virtual app builder (language-specific paths + quiz evaluation)
  const LEVEL_LABELS = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  const CLASSROOM_LANG_LABELS = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    sql: 'SQL',
    bash: 'Bash',
    html5: 'HTML5',
    css3: 'CSS3',
    git: 'Git / GitHub'
  };

  function buildBaseTemplate(label){
    return {
      label,
      beginner: {
        modules:[
          {title:`Fundamentos de ${label}`, type:'Fundamentos'},
          {title:`Tutoría guiada: primeros retos en ${label}`, type:'Práctica guiada'},
          {title:`Mini proyecto de iniciación con ${label}`, type:'Proyecto'}
        ],
        quiz:[
          {q:`¿Qué debes reforzar primero en una ruta de ${label}?`, options:['Fundamentos y práctica guiada','Solo memorizar teoría','Saltar al nivel avanzado'], answer:0},
          {q:`¿Qué evidencia progreso real en ${label}?`, options:['Resolver retos y explicar soluciones','Ver videos sin practicar','No recibir feedback'], answer:0}
        ]
      },
      intermediate: {
        modules:[
          {title:`Buenas prácticas y patrones en ${label}`, type:'Fundamentos'},
          {title:'Resolución de casos reales con tutoría', type:'Práctica guiada'},
          {title:`Proyecto intermedio aplicado en ${label}`, type:'Proyecto'}
        ],
        quiz:[
          {q:'¿Qué actividad mejora más tu nivel intermedio?', options:['Code review y refactorización','Evitar correcciones','Solo copiar soluciones'], answer:0},
          {q:'¿Qué combina mejor aprendizaje y evaluación?', options:['Retos + feedback + iteración','Examen único sin práctica','Estudio sin proyecto'], answer:0}
        ]
      },
      advanced: {
        modules:[
          {title:`Arquitectura y decisiones técnicas con ${label}`, type:'Fundamentos'},
          {title:'Rendimiento, seguridad y escalabilidad', type:'Práctica guiada'},
          {title:`Proyecto experto y defensa técnica en ${label}`, type:'Proyecto'}
        ],
        quiz:[
          {q:'En nivel avanzado, ¿qué se evalúa?', options:['Calidad técnica integral','Cantidad de líneas de código','Memorización aislada'], answer:0},
          {q:'¿Qué demuestra madurez profesional?', options:['Automatizar pruebas y documentar','Evitar testing','Ignorar métricas'], answer:0}
        ]
      }
    };
  }

  const CLASSROOM_TEMPLATES = {
    javascript: {
      ...buildBaseTemplate('JavaScript'),
      intermediate: {
        modules:[
          {title:'ES6+, módulos y asincronía avanzada', type:'Fundamentos'},
          {title:'Consumo de APIs y manejo de errores', type:'Práctica guiada'},
          {title:'Proyecto SPA con rutas y estado', type:'Proyecto'}
        ],
        quiz:[
          {q:'¿Qué keyword define una constante?', options:['var','const','let'], answer:1},
          {q:'¿Qué método transforma un array devolviendo uno nuevo?', options:['forEach','map','push'], answer:1}
        ]
      }
    },
    python: {
      ...buildBaseTemplate('Python'),
      beginner: {
        modules:[
          {title:'Tipos de datos y control de flujo', type:'Fundamentos'},
          {title:'Funciones y estructuras de datos', type:'Práctica guiada'},
          {title:'Proyecto: script automatizado', type:'Proyecto'}
        ],
        quiz:[
          {q:'¿Qué símbolo inicia un comentario en Python?', options:['//','#','--'], answer:1},
          {q:'¿Qué estructura almacena pares clave-valor?', options:['list','tuple','dict'], answer:2}
        ]
      }
    }
  };

  function getGenericClassroomTemplate(langId){
    return buildBaseTemplate(CLASSROOM_LANG_LABELS[langId] || (langId || '').toUpperCase());
  }

  function getClassroomKey(langId, level){
    return `${langId}_${level}`;
  }

  function buildClassroomRoute(state){
    const langSel = document.getElementById('classroom-language');
    const levelSel = document.getElementById('classroom-level');
    const result = document.getElementById('classroom-result');
    const status = document.getElementById('classroom-status');
    const quiz = document.getElementById('classroom-quiz');
    if(!langSel || !levelSel || !result || !quiz) return;

    const langId = langSel.value;
    const level = levelSel.value;
    const template = CLASSROOM_TEMPLATES[langId] || getGenericClassroomTemplate(langId);
    const route = template[level];
    const routeKey = getClassroomKey(langId, level);

    state.classroomProgress = state.classroomProgress || {};
    const completedByRoute = state.classroomProgress[routeKey] || {};
    const completedCount = route.modules.filter((_, idx) => completedByRoute[`m_${idx}`]).length;

    result.innerHTML = `
      <div class="app-route-meta">
        <span class="app-badge">Lenguaje: ${template.label}</span>
        <span class="app-badge">Nivel: ${LEVEL_LABELS[level] || level}</span>
        <span class="app-badge">Gamificación activa</span>
      </div>
      <div class="app-progress">Progreso de la ruta: <strong>${completedCount}/${route.modules.length}</strong></div>
      <ol class="app-steps">
        ${route.modules.map((m, idx) => `
          <li class="app-step">
            <label class="app-step-check">
              <input type="checkbox" class="route-module-check" data-route-key="${routeKey}" data-module-index="${idx}" ${completedByRoute[`m_${idx}`] ? 'checked' : ''}>
              <span><strong>${m.title}</strong><small>${m.type}</small></span>
            </label>
          </li>
        `).join('')}
      </ol>
    `;

    quiz.innerHTML = route.quiz.map((item, idx) => `
      <fieldset class="quiz-item">
        <legend><strong>Pregunta ${idx+1}</strong></legend>
        <p>${item.q}</p>
        ${item.options.map((opt, oIdx) => `
          <label><input type="radio" name="quiz_${idx}" value="${oIdx}"> ${opt}</label>
        `).join('')}
      </fieldset>
    `).join('') + `
      <div class="quiz-submit-row">
        <button type="submit" class="btn primary">Evaluar ruta</button>
        <span class="quiz-score" id="quiz-score"></span>
      </div>
    `;

    state.classroom = {langId, level, routeKey, route};
    saveState(state);
    if(status) status.textContent = `Ruta de ${template.label} (${LEVEL_LABELS[level] || level}) generada correctamente.`;
  }

  function bindClassroomModuleTracking(state){
    const result = document.getElementById('classroom-result');
    if(!result) return;

    result.addEventListener('change', e => {
      const check = e.target.closest('.route-module-check');
      if(!check) return;

      const routeKey = check.dataset.routeKey;
      const idx = check.dataset.moduleIndex;
      const key = `m_${idx}`;
      state.classroomProgress = state.classroomProgress || {};
      state.classroomProgress[routeKey] = state.classroomProgress[routeKey] || {};

      const wasDone = !!state.classroomProgress[routeKey][key];
      const isNowDone = !!check.checked;
      state.classroomProgress[routeKey][key] = isNowDone;
      saveState(state);

      if(!wasDone && isNowDone){
        awardPoints(state, 5, `completaste un módulo de ${routeKey}`);
      }

      if(state.classroom && state.classroom.langId && state.classroom.level){
        buildClassroomRoute(state);
      }
    });
  }

  function initClassroomApp(state){
    const buildBtn = document.getElementById('build-classroom');
    const quizForm = document.getElementById('classroom-quiz');
    const status = document.getElementById('classroom-status');

    bindClassroomModuleTracking(state);

    if(buildBtn){
      buildBtn.addEventListener('click', ()=>{
        const langSel = document.getElementById('classroom-language');
        const levelSel = document.getElementById('classroom-level');
        const routeKey = getClassroomKey(langSel?.value || '', levelSel?.value || '');

        buildClassroomRoute(state);

        state.classroomGenerated = state.classroomGenerated || {};
        if(!state.classroomGenerated[routeKey]){
          state.classroomGenerated[routeKey] = true;
          saveState(state);
          awardPoints(state, 8, 'creaste una nueva ruta de aula virtual');
        }
      });
    }

    if(quizForm){
      quizForm.addEventListener('submit', e=>{
        e.preventDefault();
        const active = state.classroom;
        if(!active || !active.route) return;

        const unanswered = active.route.quiz.some((_, idx) => !quizForm.querySelector(`input[name="quiz_${idx}"]:checked`));
        if(unanswered){
          if(status) status.textContent = 'Responde todas las preguntas antes de evaluar tu ruta.';
          return;
        }

        let score = 0;
        active.route.quiz.forEach((q, idx)=>{
          const checked = quizForm.querySelector(`input[name="quiz_${idx}"]:checked`);
          if(checked && Number(checked.value) === q.answer) score += 1;
        });

        const total = active.route.quiz.length;
        const pct = Math.round((score / total) * 100);
        const scoreEl = document.getElementById('quiz-score');
        if(scoreEl) scoreEl.textContent = `Resultado: ${score}/${total} (${pct}%)`;

        state.classroomQuiz = state.classroomQuiz || {};
        const quizStats = state.classroomQuiz[active.routeKey] || {attempts: 0, best: 0, passed: false};
        quizStats.attempts += 1;
        quizStats.best = Math.max(quizStats.best, pct);
        const firstPass = pct >= 70 && !quizStats.passed;
        if(pct >= 70) quizStats.passed = true;
        state.classroomQuiz[active.routeKey] = quizStats;
        saveState(state);

        if(firstPass) awardPoints(state, 25, `aprobaste evaluación de ${active.langId}`);
        else if(quizStats.attempts === 1) awardPoints(state, 10, `completaste evaluación de ${active.langId}`);
        else awardPoints(state, 3, `nuevo intento de evaluación de ${active.langId}`);
      });
    }

    if(state.classroom && state.classroom.langId){
      const langSel = document.getElementById('classroom-language');
      const levelSel = document.getElementById('classroom-level');
      if(langSel) langSel.value = state.classroom.langId;
      if(levelSel) levelSel.value = state.classroom.level;
      buildClassroomRoute(state);
    }
  }

  // Theme
  function applyTheme(theme){
    if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('vibe_theme','' + theme);
    updateThemeToggleUI(theme);
  }
  function initTheme(){
    const stored = localStorage.getItem('vibe_theme');
    if(stored) applyTheme(stored === 'dark' ? 'dark' : 'light');
    else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
    else applyTheme('light');
  }

  // Render languages dynamically
  function renderLanguages(langs){
    const grid = document.querySelector('.languages-grid');
    if(!grid) return;
    grid.innerHTML = '';

    langs.forEach(lang => {
      const article = document.createElement('article');
      article.className = 'lang-card';
      article.setAttribute('role','listitem');
      article.dataset.lang = lang.id;

      article.innerHTML = `
        <div class="card-media">
          <img class="lang-icon" src="${lang.icon}" alt="Icono ${lang.name}" aria-hidden="true">
          <a class="thumb-link" href="${lang.video}" target="_blank" rel="noopener noreferrer" aria-label="Ver video introductorio de ${lang.name}">
            <img class="thumb" src="${lang.thumb}" alt="Miniatura ${lang.name}">
          </a>
          <img class="lang-anim" src="IMAGENES/${lang.id}-anim.svg" alt="Animación ${lang.name}" aria-hidden="true">
        </div>
        <div class="card-body">
          <h3 class="lang-title">${lang.name}</h3>
          <p class="lang-desc">${lang.desc || ''}</p>
          <div class="progress-wrap" aria-hidden="false">
            <div class="progress-bar" data-lang-id="${lang.id}" aria-label="Progreso de ${lang.name}"><div class="progress-fill" style="width:0%"></div></div>
          </div>
          <ul class="lang-categories" aria-label="Categorías de contenido de ${lang.name}">
            ${lang.categories.map((c, i) => `<li tabindex="0" data-cat-index="${i}" data-lang-id="${lang.id}" class="cat-item">${c}</li>`).join('')}
          </ul>
          <div class="card-actions">
            <button class="mockup-btn" data-lang-id="${lang.id}">Mockup</button>
            <label class="compare-label"><input type="checkbox" class="compare-checkbox" data-lang-id="${lang.id}" aria-label="Seleccionar ${lang.name} para comparar"> Comparar</label>
          </div>
          <a class="video-link" href="${lang.video}" target="_blank" rel="noopener noreferrer">Ver video</a>
          <pre class="code-mockup" hidden aria-hidden="true"></pre>
        </div>
      `;

      grid.appendChild(article);
      // add animation class to the inserted animated image based on language
      const animEl = article.querySelector('.lang-anim');
      if(animEl){
        const spinList = ['javascript','python','java','git'];
        if(spinList.includes(lang.id)) animEl.classList.add('spin');
        else animEl.classList.add('pulse');
      }
    });
  }

  /* Animated canvas diagrams (simple, performant) */
  function animateCanvases(){
    const canvases = $$('.lang-canvas');
    canvases.forEach((cnv, idx) => {
      const ctx = cnv.getContext('2d');
      let t = 0;
      const w = cnv.width, h = cnv.height;
      // Language colors
      const langColors = [
        '#f59e0b', // Java - amber
        '#3b82f6', // Python - blue
        '#f7df1e', // JavaScript - yellow
        '#336791', // SQL - dark blue
        '#4eaa25', // Bash - green
        '#e34c26', // HTML5 - red
        '#563d7c', // CSS3 - purple
        '#f05032'  // Git - red
      ];
      
      function draw(){
        ctx.clearRect(0,0,w,h);
        
        // background subtle gradient
        const gradient = ctx.createLinearGradient(0,0,w,h);
        gradient.addColorStop(0, 'rgba(255,255,255,0.01)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,w,h);
        
        // Draw rotating icon
        const centerX = w - 40;
        const centerY = h/2;
        const radius = 20;
        
        // Save context for rotation
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((t * 0.05) * Math.PI / 180);
        
        // Draw circle background
        ctx.fillStyle = langColors[idx % langColors.length];
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw circle border
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = langColors[idx % langColors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw rotating elements inside
        ctx.globalAlpha = 1;
        ctx.fillStyle = langColors[idx % langColors.length];
        for(let i = 0; i < 3; i++){
          const angle = (i * Math.PI * 2 / 3);
          const x = Math.cos(angle) * (radius - 6);
          const y = Math.sin(angle) * (radius - 6);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw animated wave on left
        ctx.globalAlpha = 0.4;
        const wavePoints = 5;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        for(let i = 0; i <= wavePoints; i++){
          const x = (w - 80) * (i / wavePoints);
          const y = h/2 + Math.sin((t*0.04) + (i*0.8)) * 6;
          if(i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = langColors[idx % langColors.length];
        ctx.lineWidth = 2;
        ctx.stroke();
        
        t++;
        if(window.requestAnimationFrame) requestAnimationFrame(draw);
      }
      draw();
    });
  }

  /* Progress bar utilities */
  function computeProgress(state, langId, totalCats){
    const p = state.progress && state.progress[langId] ? state.progress[langId] : {};
    const video = p.videoWatched ? 1 : 0;
    const catsDone = Object.keys(p).filter(k=>k.startsWith('cat_') && p[k]).length;
    const denom = 1 + totalCats; // video + categories
    const pct = Math.round(((video + catsDone) / denom) * 100);
    return pct;
  }

  function updateAllProgress(state, langs){
    langs.forEach(l => {
      const pct = computeProgress(state, l.id, l.categories.length);
      const bar = document.querySelector(`.progress-bar[data-lang-id="${l.id}"] .progress-fill`);
      if(bar){
        bar.style.width = pct + '%';
        bar.setAttribute('aria-valuenow', pct);
      }
    });
  }

  /* Mockup generator (very light): returns small code sample per language */
  const MOCKS = {
    java: `// Java - Main\npublic class Main {\n  public static void main(String[] args){\n    System.out.println("Hola from Java");\n  }\n}`,
    python: `# Python - script\nprint("Hola from Python")`,
    javascript: `// JavaScript - node/browser\nconsole.log('Hola from JavaScript');`,
    sql: `-- SQL sample\nSELECT name, COUNT(*) FROM users GROUP BY name;`,
    bash: `# Bash sample\necho "Hola from Bash"`,
    html5: `<!-- HTML5 -->\n<!doctype html><html><head><meta charset=\"utf-8\"></head><body><h1>Hola</h1></body></html>`,
    css3: `/* CSS3 */\nbody{display:grid;place-items:center;height:100vh;background:linear-gradient(90deg,#4a90e2,#7ed321);}`,
    git: `# Git commands\ngit init\ngit add .\ngit commit -m "initial"`
  };

  function bindMockups(){
    document.addEventListener('click', e => {
      const btn = e.target.closest('.mockup-btn');
      if(!btn) return;
      const id = btn.dataset.langId;
      const card = btn.closest('.lang-card');
      const pre = card.querySelector('.code-mockup');
      if(pre.hidden){
        pre.textContent = MOCKS[id] || '// ejemplo no disponible';
        pre.hidden = false; pre.setAttribute('aria-hidden','false');
        // simple fade-in
        pre.style.opacity = 0; pre.style.transition = 'opacity 260ms ease';
        requestAnimationFrame(()=> pre.style.opacity = 1);
      } else {
        pre.style.opacity = 0; setTimeout(()=>{ pre.hidden = true; pre.setAttribute('aria-hidden','true'); pre.style.opacity=''; pre.style.transition=''; }, 260);
      }
    });
  }

  /* Compare system: select up to 2 and show modal */
  let compareList = [];
  function createCompareModal(){
    let modal = document.getElementById('compare-modal');
    if(modal) return modal;
    modal = document.createElement('div'); modal.id='compare-modal'; modal.className='compare-modal'; modal.innerHTML = `\n      <div class="compare-panel" role="dialog" aria-modal="true">\n        <button class="close-compare" aria-label="Cerrar">✕</button>\n        <h3>Comparativa</h3>\n        <div class="compare-content"></div>\n      </div>\n    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-compare').addEventListener('click', ()=> modal.remove());
    modal.addEventListener('click', e=>{ if(e.target === modal) modal.remove(); });
    return modal;
  }

  function openCompareModal(a,b){
    const modal = createCompareModal();
    const panel = modal.querySelector('.compare-content');
    // simple visual: compare number of categories & sample progress
    const html = `
      <div class="compare-row"><strong>${a.name}</strong><div class="bar small" style="--pct:${a.pct}"></div><span>${a.pct}%</span></div>
      <div class="compare-row"><strong>${b.name}</strong><div class="bar small" style="--pct:${b.pct}"></div><span>${b.pct}%</span></div>
      <hr>
      <div class="compare-stat-grid">
        <div><strong>Categorías</strong><div>${a.categories.length}</div></div>
        <div><strong>Categorías</strong><div>${b.categories.length}</div></div>
        <div><strong>Video visto</strong><div>${a.video ? 'Sí':'No'}</div></div>
        <div><strong>Video visto</strong><div>${b.video ? 'Sí':'No'}</div></div>
      </div>
    `;
    panel.innerHTML = html;
    requestAnimationFrame(()=> modal.classList.add('open'));
  }

  function bindCompare(state, langs){
    document.addEventListener('change', e => {
      const cb = e.target.closest('.compare-checkbox');
      if(!cb) return;
      const id = cb.dataset.langId;
      if(cb.checked) compareList.push(id); else compareList = compareList.filter(x=>x!==id);
      if(compareList.length > 2){
        // keep only last two
        const removed = compareList.shift();
        const other = document.querySelector(`.compare-checkbox[data-lang-id="${removed}"]`);
        if(other) other.checked = false;
      }
      if(compareList.length === 2){
        const aId = compareList[0], bId = compareList[1];
        const a = langs.find(l=>l.id===aId); const b = langs.find(l=>l.id===bId);
        const aPct = computeProgress(state, aId, a.categories.length);
        const bPct = computeProgress(state, bId, b.categories.length);
        openCompareModal({...a, pct:aPct, video: !!(state.progress[aId] && state.progress[aId].videoWatched)}, {...b, pct:bPct, video: !!(state.progress[bId] && state.progress[bId].videoWatched)});
      }
    });
  }


  // Search
  function createSearchInput(){
    const header = document.querySelector('#lenguajes .section-header');
    if(!header) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';
    wrapper.innerHTML = `
      <input id="lang-search" aria-label="Buscar lenguajes y contenidos" placeholder="Buscar lenguaje, categoría o palabra clave..." />
    `;
    header.appendChild(wrapper);

    const input = document.getElementById('lang-search');
    input.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      filterLanguages(q);
    });
  }

  function filterLanguages(query){
    const cards = $$('.languages-grid .lang-card');
    if(!query){ cards.forEach(c => c.style.display=''); return; }
    cards.forEach(card => {
      const name = (card.querySelector('.lang-title')?.textContent||'').toLowerCase();
      const desc = (card.querySelector('.lang-desc')?.textContent||'').toLowerCase();
      const cats = Array.from(card.querySelectorAll('.lang-categories li')).map(n=>n.textContent.toLowerCase()).join(' ');
      const hay = name + ' ' + desc + ' ' + cats;
      card.style.display = hay.includes(query) ? '' : 'none';
    });
  }

  // Navigation smooth + active link
  function bindNavLinks(){
    const links = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
    links.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
    }));

    // active state via intersection observer
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const navA = document.querySelector(`header nav a[href="#${id}"]`);
        if(navA) navA.classList.toggle('active', entry.isIntersecting);
      });
    },{threshold:0.45});
    sections.forEach(s=>observer.observe(s));
  }

  // Theme toggle UI
  function createThemeToggle(){
    const nav = $('header nav');
    if(!nav) return;
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label','Alternar tema oscuro/claro');
    btn.textContent = '🌓';
    btn.addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    nav.appendChild(btn);
  }
  function updateThemeToggleUI(theme){
    const btn = document.querySelector('.theme-toggle');
    if(!btn) return;
    btn.setAttribute('aria-pressed', theme==='dark');
  }

  // Points UI
  function createPointsUI(state){
    const nav = $('header nav');
    if(!nav) return;
    const pts = document.createElement('button');
    pts.className = 'points-badge';
    pts.type = 'button';
    pts.setAttribute('aria-live','polite');
    pts.style.marginLeft = '12px';
    pts.textContent = `⭐ ${state.points || 0} pts`;
    pts.addEventListener('click', ()=>{
      showGamificationModal(state);
    });
    nav.appendChild(pts);
  }

  function showGamificationModal(state){
    const daily = getDailyRanking();
    const weekly = getWeeklyRanking();
    const myDailyRank = daily.findIndex(u => u.userId === state.userId) + 1 || '-';
    const myWeeklyRank = weekly.findIndex(u => u.userId === state.userId) + 1 || '-';

    let html = `
      <div style="padding:1.5rem;max-height:600px;overflow-y:auto">
        <h3>🎮 Estadísticas de Gamificación</h3>
        <div style="background:rgba(58,130,246,0.1);padding:1rem;border-radius:8px;margin:1rem 0">
          <p style="margin:0.5rem 0"><strong>Puntos totales:</strong> ${state.points}</p>
          <p style="margin:0.5rem 0"><strong>Racha de días:</strong> ${state.streakDays || 0} días 🔥</p>
          <p style="margin:0.5rem 0"><strong>Tu ID:</strong> ${state.userId}</p>
        </div>

        <h4>📊 Ranking Hoy</h4>
        <p style="color:var(--muted);font-size:0.9rem">Tu posición: #${myDailyRank}</p>
        <ol style="margin:0.5rem 0;padding-left:1.5rem">
          ${daily.map((u, i) => `
            <li style="padding:0.3rem 0;${u.userId === state.userId ? 'background:rgba(58,130,246,0.2);padding:0.3rem 0.5rem;border-radius:4px;' : ''}">
              #${i+1} <strong>${u.points} pts</strong> ${u.userId === state.userId ? '👈 Eres tú' : ''}
            </li>
          `).join('')}
        </ol>

        <h4>🏆 Ranking Esta Semana</h4>
        <p style="color:var(--muted);font-size:0.9rem">Tu posición: #${myWeeklyRank}</p>
        <ol style="margin:0.5rem 0;padding-left:1.5rem">
          ${weekly.map((u, i) => `
            <li style="padding:0.3rem 0;${u.userId === state.userId ? 'background:rgba(58,130,246,0.2);padding:0.3rem 0.5rem;border-radius:4px;' : ''}">
              #${i+1} <strong>${u.points} pts</strong> ${u.userId === state.userId ? '👈 Eres tú' : ''}
            </li>
          `).join('')}
        </ol>

        <h4>💡 Cómo ganar puntos:</h4>
        <ul style="font-size:0.9rem;margin:0.5rem 0;padding-left:1.5rem">
          <li>Ver video de lenguaje: ${POINT_VALUES.videoWatch} pts</li>
          <li>Explorar categoría: ${POINT_VALUES.categoryExplore} pts</li>
          <li>Completar step de ruta: ${POINT_VALUES.routeStep} pts</li>
          <li>Publicar en foro: ${POINT_VALUES.forumPost} pts</li>
          <li>Votar en foro: ${POINT_VALUES.forumVote} pts</li>
          <li>Bono de 3 días seguidos: ${POINT_VALUES.dailyStreak} pts</li>
          <li>Bono de 7 días seguidos: ${POINT_VALUES.weeklyStreak} pts</li>
        </ul>
      </div>
    `;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;';
    modal.innerHTML = `
      <div style="background:var(--surface);border-radius:12px;border:1px solid var(--glass-border);max-width:500px;width:90%;box-shadow:var(--shadow-md)">
        ${html}
        <div style="padding:1rem;border-top:1px solid var(--glass-border);text-align:right">
          <button class="btn primary" onclick="this.closest('[style*=fixed]').remove()" style="padding:0.5rem 1rem">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function updatePointsUI(state){
    const el = document.querySelector('.points-badge');
    if(el) el.textContent = `⭐ ${state.points || 0} pts`;
  }

  // Gamification: award points
  function awardPoints(state, amount, reason){
    state.points = (state.points || 0) + amount;
    saveState(state);
    updatePointsUI(state);
    // announce
    const live = document.getElementById('vibe-live');
    if(live) live.textContent = `Has obtenido ${amount} puntos — ${reason}`;
  }

  function bindCardInteractions(state){
    // video clicks
    document.addEventListener('click', e => {
      const a = e.target.closest('.video-link, .thumb-link');
      if(!a) return;
      const card = a.closest('.lang-card');
      if(!card) return;
      const id = card.dataset.lang;
      // award once per video click
      state.progress = state.progress || {};
      state.progress[id] = state.progress[id] || {};
      if(!state.progress[id].videoWatched){
        awardPoints(state, POINT_VALUES.videoWatch, `visto video de ${id}`);
        state.progress[id].videoWatched = true;
        saveState(state);
      }
    });

    // category toggles
    document.addEventListener('click', e => {
      const li = e.target.closest('.cat-item');
      if(!li) return;
      const langId = li.dataset.langId;
      const idx = li.dataset.catIndex;
      state.progress = state.progress || {};
      state.progress[langId] = state.progress[langId] || {};
      const key = `cat_${idx}`;
      const done = !!state.progress[langId][key];
      if(!done){
        state.progress[langId][key] = true;
        li.style.opacity = '0.7';
        awardPoints(state, POINT_VALUES.categoryExplore, `completado: ${li.textContent} (${langId})`);
      } else {
        // toggle off
        state.progress[langId][key] = false;
        li.style.opacity = '';
        saveState(state);
      }
    });
  }

  /* --- Suggestion box: persistence, voice, voting, history, gamification --- */
  const SUGG_KEY = 'vibe_suggestions_v1';

  function loadSuggestions(){
    try{ return JSON.parse(localStorage.getItem(SUGG_KEY)) || []; }catch(e){ return []; }
  }
  function saveSuggestions(list){ localStorage.setItem(SUGG_KEY, JSON.stringify(list)); }

  function makeUserId(){
    let id = localStorage.getItem('vibe_user_id');
    if(!id){ id = 'u_' + Math.random().toString(36).slice(2,9); localStorage.setItem('vibe_user_id', id); }
    return id;
  }

  function renderSuggestions(){
    const list = loadSuggestions();
    const container = document.getElementById('sugg-list');
    if(!container) return;
    const sort = document.getElementById('sugg-sort')?.value || 'new';
    const filter = document.getElementById('sugg-filter')?.value || 'all';
    const uid = makeUserId();
    let items = list.slice();
    if(filter === 'mine') items = items.filter(s => s.authorId === uid);
    if(sort === 'top') items.sort((a,b)=> (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down));
    else items.sort((a,b)=> b.ts - a.ts);

    container.innerHTML = items.map(s => {
      const score = (s.votes.up - s.votes.down) || 0;
      const time = new Date(s.ts).toLocaleString();
      const transcript = s.transcript ? `<div class="sugg-transcript"><strong>Transcripción:</strong> ${escapeHtml(s.transcript)}</div>` : '';
      return `
        <article class="sugg-item" data-id="${s.id}">
          <div class="sugg-meta">
            <div class="sugg-author">${escapeHtml(s.author||'Anónimo')}</div>
            <div class="sugg-time muted">${time}</div>
          </div>
          <p class="sugg-text">${escapeHtml(s.text)}</p>
          ${transcript}
          <div class="sugg-actions">
            <button class="vote up" data-id="${s.id}" aria-label="Votar a favor">▲ <span class="count">${s.votes.up}</span></button>
            <button class="vote down" data-id="${s.id}" aria-label="Votar en contra">▼ <span class="count">${s.votes.down}</span></button>
            <button class="btn small" data-action="comment" data-id="${s.id}">Comentar</button>
          </div>
        </article>
      `;
    }).join('') || '<p class="muted">No hay sugerencias todavía — sé el primero.</p>';

    const stats = document.getElementById('sugg-stats');
    if(stats) stats.textContent = `Sugerencias: ${list.length} — Tu ID: ${uid}`;
  }

  function escapeHtml(str){
    return (str+'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  function initSuggestions(state){
    const form = document.getElementById('suggestion-form');
    const text = document.getElementById('suggestion-text');
    const recordBtn = document.getElementById('start-record');
    const status = document.getElementById('record-status');
    const clearBtn = document.getElementById('clear-sugg');
    const sort = document.getElementById('sugg-sort');
    const filter = document.getElementById('sugg-filter');

    if(sort) sort.addEventListener('change', ()=> renderSuggestions());
    if(filter) filter.addEventListener('change', ()=> renderSuggestions());

    form.addEventListener('submit', e=>{
      e.preventDefault();
      const v = text.value.trim();
      if(!v) return;
      const userId = makeUserId();
      const sugg = { id: 's_' + Date.now(), text: v, ts: Date.now(), authorId: userId, author: null, transcript: null, votes:{up:0,down:0,by:{}} };
      const arr = loadSuggestions(); arr.push(sugg); saveSuggestions(arr);
      // gamification: award points
      const pts = loadState(); pts.points = (pts.points||0) + 20; saveState(pts); updatePointsUI(pts);
      renderSuggestions(); text.value = '';
    });

    clearBtn?.addEventListener('click', ()=>{ text.value=''; status.textContent=''; });

    // Voting and actions
    document.addEventListener('click', e=>{
      const up = e.target.closest('.vote.up');
      const down = e.target.closest('.vote.down');
      if(up || down){
        const id = (up||down).dataset.id;
        const uid = makeUserId();
        const arr = loadSuggestions();
        const item = arr.find(s=>s.id===id); if(!item) return;
        const dir = up? 'up':'down';
        const prev = item.votes.by[uid];
        if(prev === dir){
          // undo
          item.votes[dir] = Math.max(0, item.votes[dir]-1); delete item.votes.by[uid];
        } else {
          if(prev) item.votes[prev] = Math.max(0, item.votes[prev]-1);
          item.votes[dir] = (item.votes[dir]||0) + 1; item.votes.by[uid] = dir;
          // award voter points (limit small)
          const st = loadState(); st.points = (st.points||0) + 1; saveState(st); updatePointsUI(st);
        }
        saveSuggestions(arr); renderSuggestions();
      }
      const com = e.target.closest('button[data-action="comment"]');
      if(com){ alert('Función de comentarios no implementada en esta demo.'); }
    });

    // Voice recording / speech recognition (transcription)
    let recognition = null; let recording = false;
    if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new R();
      recognition.lang = 'es-ES'; recognition.interimResults = false; recognition.maxAlternatives = 1;
      recognition.onstart = ()=>{ recording = true; status.textContent = 'Grabando... habla ahora.'; };
      recognition.onresult = e=>{
        const transcript = e.results[0][0].transcript;
        text.value = text.value ? (text.value + '\n' + transcript) : transcript;
        status.textContent = 'Transcripción añadida.';
      };
      recognition.onerror = ev=>{ status.textContent = 'Error en reconocimiento: '+(ev.error||''); };
      recognition.onend = ()=>{ recording=false; if(recording) recognition.stop(); };
    }

    recordBtn?.addEventListener('click', ()=>{
      if(!recognition){ status.textContent = 'Reconocimiento de voz no soportado en este navegador.'; return; }
      if(!recording) recognition.start(); else recognition.stop();
    });

    // initial render
    renderSuggestions();
  }

  // Initialize everything
  function init(){
    const raw = parseJsonFromScript(LANG_DATA_ID);
    const langs = raw?.languages || [];

    // enrich with desc defaults
    langs.forEach(l => { if(!l.desc) l.desc = ''; });

    renderLanguages(langs.map(l => ({...l, desc: l.desc || ''})));
    // new interactive initializations
    animateCanvases();
    bindMockups();

    createSearchInput();
    bindNavLinks();
    createThemeToggle();

    const state = loadState();
    createPointsUI(state);
    // aria live region
    let live = document.getElementById('vibe-live');
    if(!live){ live = document.createElement('div'); live.id='vibe-live'; live.setAttribute('aria-live','polite'); live.style.position='absolute'; live.style.left='-9999px'; document.body.appendChild(live); }

    bindCardInteractions(state);
    updatePointsUI(state);
    // update progress visuals
    updateAllProgress(state, langs);
    bindCompare(state, langs);
    // initialize suggestion box
    initSuggestions(state);
    // bind route UI
    bindRouteUI();
    initClassroomApp(state);

    // Apply stored theme
    initTheme();

    // Keyboard accessibility: allow Enter on category items to toggle
    document.addEventListener('keydown', e => {
      if(e.key === 'Enter' && document.activeElement.classList.contains('cat-item')){
        document.activeElement.click();
      }
    });

    // ====== FIREBASE INIT & FORUM BINDINGS ======
    initializeFirebase();

    // Forum post button
    const forumPostBtn = document.getElementById('forum-post-btn');
    if(forumPostBtn){
      forumPostBtn.addEventListener('click', submitForumPost);
      // Allow Ctrl+Enter to submit
      document.getElementById('forum-body').addEventListener('keydown', e => {
        if(e.ctrlKey && e.key === 'Enter') submitForumPost();
      });
    }

    // Render leaderboards
    renderLeaderboards();
    // Update leaderboards every 5 seconds
    setInterval(() => {
      renderLeaderboards();
    }, 5000);
  }

  // Run on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
