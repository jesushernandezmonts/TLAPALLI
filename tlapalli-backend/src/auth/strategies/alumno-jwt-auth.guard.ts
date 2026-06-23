import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AlumnoJwtAuthGuard extends AuthGuard('alumno-jwt') {}
