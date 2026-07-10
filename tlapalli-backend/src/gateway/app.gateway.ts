import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('AppGateway');

  afterInit() {
    this.logger.log('🚀 WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir eventos de actualización
  emitAlumnosUpdated() {
    this.server.emit('alumnos:updated');
  }

  emitInstructoresUpdated() {
    this.server.emit('instructores:updated');
  }

  emitTalleresUpdated() {
    this.server.emit('talleres:updated');
  }

  emitInscripcionesUpdated() {
    this.server.emit('inscripciones:updated');
  }

  emitAsistenciasUpdated() {
    this.server.emit('asistencias:updated');
  }

  emitPagosUpdated() {
    this.server.emit('pagos:updated');
  }

  emitDocumentosUpdated() {
    this.server.emit('documentos:updated');
  }

  emitServicioSocialUpdated() {
    this.server.emit('servicio-social:updated');
  }
}
