// PATCH: Add these functions after line 4 (after const LANG_DATA_ID = 'languages-data';)

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
