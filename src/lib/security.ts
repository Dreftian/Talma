/**
 * Talma Client Security Shield
 * Protege contra inspección de código fuente, DevTools y extracción de información privilegiada.
 */

export function initClientSecurity() {
  if (typeof window === 'undefined') return;

  // 1. Deshabilitar menú contextual (clic derecho) para impedir "Inspeccionar elemento"
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Bloquear atajos de teclado de inspección y herramientas de desarrollo
  window.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (DevTools)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect element)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U (Ver código fuente)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Guardar página completa)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Limpiar consola y ocultar mensajes de depuración
  try {
    console.clear();
    const noop = () => {};
    if (import.meta.env.PROD) {
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      console.warn = noop;
    }
  } catch {}

  // 4. Detección pasiva de apertura de DevTools (trampa de tiempo / dimensión)
  let devtoolsOpen = false;
  const threshold = 160;
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        try {
          console.clear();
        } catch {}
      }
    } else {
      devtoolsOpen = false;
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 2000);
}
