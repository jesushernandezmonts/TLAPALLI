/**
 * Servicio Helper para almacenamiento local offline del pase de lista
 * Utiliza localStorage para persistencia básica y resiliencia sin conexión.
 */

const STORAGE_KEYS = {
  GRUPOS_CACHE: 'tlapalli_cache_grupos',
  ALUMNOS_CACHE_PREFIX: 'tlapalli_cache_alumnos_grupo_',
  ASISTENCIAS_PENDIENTES: 'tlapalli_pending_asistencias',
};

export const offlineStorage = {
  // --- CACHÉ DE GRUPOS ---
  saveCachedGrupos: (grupos) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GRUPOS_CACHE, JSON.stringify(grupos));
    } catch (e) {
      console.error('Error guardando caché de grupos:', e);
    }
  },

  getCachedGrupos: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRUPOS_CACHE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error leyendo caché de grupos:', e);
      return [];
    }
  },

  // --- CACHÉ DE ALUMNOS DE UN GRUPO ---
  saveCachedAlumnos: (grupoId, alumnos) => {
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.ALUMNOS_CACHE_PREFIX}${grupoId}`,
        JSON.stringify(alumnos)
      );
    } catch (e) {
      console.error(`Error guardando caché de alumnos para grupo ${grupoId}:`, e);
    }
  },

  getCachedAlumnos: (grupoId) => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.ALUMNOS_CACHE_PREFIX}${grupoId}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error leyendo caché de alumnos para grupo ${grupoId}:`, e);
      return [];
    }
  },

  // --- ASISTENCIAS PENDIENTES DE SINCRONIZACIÓN ---
  savePendingAsistencia: (registroAsistencia) => {
    try {
      const pendientes = offlineStorage.getPendingAsistencias();
      
      // Si ya existe un registro pendiente para el mismo grupo y fecha, actualizarlo
      const index = pendientes.findIndex(
        (p) => p.grupoId === registroAsistencia.grupoId && p.fecha === registroAsistencia.fecha
      );

      if (index >= 0) {
        pendientes[index] = { ...registroAsistencia, timestamp: Date.now() };
      } else {
        pendientes.push({ ...registroAsistencia, timestamp: Date.now() });
      }

      localStorage.setItem(STORAGE_KEYS.ASISTENCIAS_PENDIENTES, JSON.stringify(pendientes));
    } catch (e) {
      console.error('Error guardando asistencia en cola offline:', e);
    }
  },

  getPendingAsistencias: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASISTENCIAS_PENDIENTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error leyendo cola de asistencias offline:', e);
      return [];
    }
  },

  clearPendingAsistencias: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ASISTENCIAS_PENDIENTES);
    } catch (e) {
      console.error('Error limpiando cola de asistencias offline:', e);
    }
  },
};
