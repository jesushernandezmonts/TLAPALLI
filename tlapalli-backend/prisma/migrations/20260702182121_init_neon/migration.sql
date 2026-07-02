-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "foto_url" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'profesor',
    "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_hasta" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_exp" TIMESTAMP(3),
    "instructor_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "curp" TEXT,
    "fecha_nacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "padecimientos" TEXT,
    "estatus_activo" BOOLEAN NOT NULL DEFAULT true,
    "foto_url" TEXT,
    "email" TEXT,
    "password_hash" TEXT,
    "auth_activo" BOOLEAN NOT NULL DEFAULT false,
    "reset_token" TEXT,
    "reset_token_exp" TIMESTAMP(3),

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "subido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taller" (
    "id" SERIAL NOT NULL,
    "nombre_taller" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo_mensual" DECIMAL(10,2) NOT NULL,
    "cupo_maximo" INTEGER NOT NULL,
    "horario_descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Taller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "taller_id" INTEGER,
    "temario_url" TEXT,
    "curriculum_url" TEXT,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "taller_id" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus_pago" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "grupo_alumno_id" INTEGER,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mes_correspondiente" TEXT NOT NULL,
    "metodo_pago" TEXT,
    "registrado_por" INTEGER,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "instructor_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoAlumno" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrupoAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioSocial" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "horas_requeridas" INTEGER NOT NULL DEFAULT 480,
    "horas_completadas" INTEGER NOT NULL DEFAULT 0,
    "estatus" TEXT NOT NULL DEFAULT 'en_curso',
    "institucion" TEXT,
    "programa" TEXT,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "supervisor" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadServicioSocial" (
    "id" SERIAL NOT NULL,
    "servicio_social_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horas" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "comentarios" TEXT,
    "estatus" TEXT NOT NULL DEFAULT 'aprobada',
    "evidencia_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActividadServicioSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumnoRefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumnoRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_google_id_key" ON "Usuario"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_reset_token_key" ON "Usuario"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_instructor_id_key" ON "Usuario"("instructor_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_curp_key" ON "Alumno"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_email_key" ON "Alumno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_reset_token_key" ON "Alumno"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "Taller_nombre_taller_key" ON "Taller"("nombre_taller");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- CreateIndex
CREATE INDEX "Grupo_instructor_id_idx" ON "Grupo"("instructor_id");

-- CreateIndex
CREATE INDEX "GrupoAlumno_grupo_id_idx" ON "GrupoAlumno"("grupo_id");

-- CreateIndex
CREATE INDEX "GrupoAlumno_alumno_id_idx" ON "GrupoAlumno"("alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoAlumno_grupo_id_alumno_id_key" ON "GrupoAlumno"("grupo_id", "alumno_id");

-- CreateIndex
CREATE INDEX "ServicioSocial_alumno_id_idx" ON "ServicioSocial"("alumno_id");

-- CreateIndex
CREATE INDEX "ActividadServicioSocial_servicio_social_id_idx" ON "ActividadServicioSocial"("servicio_social_id");

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoRefreshToken_token_key" ON "AlumnoRefreshToken"("token");

-- CreateIndex
CREATE INDEX "AlumnoRefreshToken_alumno_id_idx" ON "AlumnoRefreshToken"("alumno_id");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "Taller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "Taller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_grupo_alumno_id_fkey" FOREIGN KEY ("grupo_alumno_id") REFERENCES "GrupoAlumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoAlumno" ADD CONSTRAINT "GrupoAlumno_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoAlumno" ADD CONSTRAINT "GrupoAlumno_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioSocial" ADD CONSTRAINT "ServicioSocial_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadServicioSocial" ADD CONSTRAINT "ActividadServicioSocial_servicio_social_id_fkey" FOREIGN KEY ("servicio_social_id") REFERENCES "ServicioSocial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoRefreshToken" ADD CONSTRAINT "AlumnoRefreshToken_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
