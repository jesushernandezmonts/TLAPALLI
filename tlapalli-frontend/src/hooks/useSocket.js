import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useSocket(event, callback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
    });

    socket.on(event, (...args) => {
      if (callbackRef.current) {
        callbackRef.current(...args);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
    });

    return () => {
      socket.disconnect();
    };
  }, [event]);
}
