import { useEffect, useRef } from 'react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socketInstance = null;
let socketInitPromise = null;

async function getSocket() {
  if (socketInstance) return socketInstance;
  if (socketInitPromise) return socketInitPromise;

  socketInitPromise = (async () => {
    // Esperar a que el CDN cargue socket.io
    while (typeof window.io === 'undefined') {
      await new Promise(r => setTimeout(r, 50));
    }
    socketInstance = window.io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    return socketInstance;
  })();

  return socketInitPromise;
}

export default function useSocket(event, callback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let mounted = true;

    getSocket().then((socket) => {
      if (!mounted) return;

      const handler = (...args) => {
        if (callbackRef.current) {
          callbackRef.current(...args);
        }
      };

      socket.on(event, handler);

      return () => {
        socket.off(event, handler);
      };
    });

    return () => {
      mounted = false;
    };
  }, [event]);
}
