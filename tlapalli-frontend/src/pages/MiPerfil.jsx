import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, BookOpen, Calendar,
  Loader2, AlertCircle, RefreshCw, FileText, Download,
  GraduationCap, BadgeCheck, Building2, School, Shield,
  Camera, Pencil, Check, X, Lock, Eye, EyeOff
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function MiPerfil() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Editing state
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/instructores/me');
      console.log('API response:', data);
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('No se pudo cargar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload immediately
    handleUploadPhoto(file);
  };

  const handleUploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const { data } = await api.post('/instructores/me/upload-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Update local state
      setProfile(prev => {
        if (prev?.esAdmin) {
          return { ...prev, usuario: { ...prev.usuario, fotoUrl: data.fotoUrl } };
        }
        return { ...prev, usuario: { ...prev.usuario, fotoUrl: data.fotoUrl } };
      });
      // Update AuthContext user
      setUser(prev => ({ ...prev, fotoUrl: data.fotoUrl }));
      // Clear preview after success
      setTimeout(() => setPreviewUrl(null), 2000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error al subir la foto');
      setPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startEditName = () => {
    const currentName = profile?.esAdmin
      ? profile.usuario.nombre
      : profile?.nombre || '';
    setEditNombre(currentName);
    setEditMode(true);
  };

  const cancelEditName = () => {
    setEditMode(false);
    setEditNombre('');
  };

  const saveName = async () => {
    if (!editNombre.trim()) return;
    setSavingName(true);
    try {
      const { data } = await api.patch('/instructores/me', { nombre: editNombre.trim() });
      setProfile(prev => {
        if (prev?.esAdmin) {
          return { ...prev, usuario: { ...prev.usuario, nombre: data.nombre } };
        }
        return { ...prev, nombre: data.nombre };
      });
      setUser(prev => ({ ...prev, nombre: data.nombre }));
      setEditMode(false);
    } catch (err) {
      console.error('Error updating name:', err);
      alert('Error al actualizar el nombre');
    } finally {
      setSavingName(false);
    }
  };

  // Password change handlers
  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(data.message || 'Contraseña actualizada');
      setTimeout(() => {
        setPasswordModalOpen(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  // Compute foto URL helper - works for both admin and instructor
  const getFotoUrl = () => {
    if (profile?.esAdmin) {
      return profile.usuario?.fotoUrl || null;
    }
    return profile?.usuario?.fotoUrl || null;
  };

  const fotoUrl = previewUrl || (getFotoUrl() ? `${api.defaults.baseURL || 'http://localhost:3000'}${getFotoUrl()}` : null);
  const baseUrl = api.defaults.baseURL || 'http://localhost:3000';

  // Compute initials
  const getNameForInitials = () => {
    if (profile?.esAdmin) return profile.usuario?.nombre || 'Admin';
    return profile?.nombre || profile?.email || 'Instructor';
  };
  const initials = getNameForInitials().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

  // Get current name
  const getCurrentName = () => {
    if (profile?.esAdmin) return profile.usuario?.nombre || '';
    return profile?.nombre || '';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white/40 text-sm">Cargando tu perfil...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-white/70">{error}</p>
        <button onClick={fetchProfile} className="flex items-center gap-2 mx-auto px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-bold transition">
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    </div>
  );

  if (!profile) {
    console.warn('MiPerfil: profile is null/falsy');
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-pink-400 mx-auto" />
          <p className="text-white/60 text-sm">No se pudo cargar la información del perfil</p>
          <button onClick={fetchProfile} className="flex items-center gap-2 mx-auto px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-bold transition">
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Admin case
  if (profile.esAdmin) {
    const u = profile.usuario;

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Mi Perfil</h1>
          <p className="mt-1 text-base font-semibold text-white/75">Información de administrador</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-2xl shadow-2xl"
        >
          <div className="h-1.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-500" />
          <div className="p-6 md:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar - clickeable with preview */}
              <div className="relative flex-shrink-0 group">
                <button
                  onClick={handleSelectPhoto}
                  disabled={uploadingPhoto}
                  className="block relative"
                  title="Cambiar foto de perfil"
                >
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-cyan-500 p-[3px] shadow-2xl shadow-pink-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-pink-500/50">
                    <div className="w-full h-full rounded-[calc(1rem-3px)] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={u.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl font-black text-white">{initials}</span>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[calc(1rem-3px)]">
                        {uploadingPhoto ? (
                          <Loader2 className="w-7 h-7 animate-spin text-white" />
                        ) : previewUrl ? (
                          <Check className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <Camera className="w-7 h-7 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2 mt-2">
                {/* Name with edit button */}
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 w-full max-w-xs"
                        placeholder="Tu nombre"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveName();
                          if (e.key === 'Escape') cancelEditName();
                        }}
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                        title="Guardar"
                      >
                        {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={cancelEditName}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 transition-all"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-black text-white">{u.nombre}</h2>
                      <button
                        onClick={startEditName}
                        className="p-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-white/40 hover:text-pink-400 border border-white/10 hover:border-pink-500/30 transition-all"
                        title="Editar nombre"
                      >
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-pink-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                  <Shield size={16} /> Administrador
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/50 text-sm mt-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-pink-400/60" />
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-pink-400/60" />
                    <span>Registrado el {new Date(u.creadoEn).toLocaleDateString('es-MX')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón cambiar contraseña */}
            <div className="mt-6 flex justify-center sm:justify-start">
              <button
                onClick={openPasswordModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-pink-500/20 text-white/70 hover:text-pink-400 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all text-sm font-bold"
              >
                <Lock size={16} />
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {[
            { icon: Shield, label: 'Rol', value: 'Administrador', color: 'from-rose-600 to-pink-600' },
            { icon: Building2, label: 'Cuenta', value: u.email, color: 'from-purple-600 to-violet-600' },
            { icon: Calendar, label: 'Registrado', value: new Date(u.creadoEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), color: 'from-cyan-600 to-sky-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                  <p className="text-lg font-black text-white truncate">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal Cambiar Contraseña */}
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !changingPassword && setPasswordModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-500" />
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <Lock size={20} className="text-pink-400" />
                  Cambiar Contraseña
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold">
                      <AlertCircle size={14} className="shrink-0" />
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <Check size={14} className="shrink-0" />
                      {passwordSuccess}
                    </div>
                  )}

                  {/* Current password */}
                  <div>
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Mínimo 8 caracteres, 1 mayúscula y 1 número</p>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasswordModalOpen(false)}
                      disabled={changingPassword}
                      className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition text-sm border border-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-500/50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-xs rounded-xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
                    >
                      {changingPassword ? (
                        <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                      ) : (
                        <><Check size={14} /> Cambiar</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Instructor / Profesor case
  const instructor = profile;
  const nombreInstructor = instructor.nombre || instructor.email || 'Instructor';
  const initialsProf = nombreInstructor.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const statCards = [
    { icon: GraduationCap, label: 'Estado', value: instructor.estado || 'N/A', color: instructor.estado === 'Activo' ? 'emerald' : 'amber' },
    { icon: School, label: 'Taller Asignado', value: instructor.taller?.nombreTaller || 'Sin taller', color: 'pink' },
    { icon: BadgeCheck, label: 'Email', value: instructor.email || user?.email || 'Sin correo', color: 'purple' },
    { icon: Building2, label: 'Rol', value: 'Profesor', color: 'cyan' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Mi Perfil</h1>
        <p className="mt-1 text-base font-semibold text-white/75">Información personal y del taller</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-2xl shadow-2xl"
      >
        <div className="h-1.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-500" />
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar - clickeable con preview (también para profesor) */}
            <div className="relative flex-shrink-0 group">
              <button
                onClick={handleSelectPhoto}
                disabled={uploadingPhoto}
                className="block relative"
                title="Cambiar foto de perfil"
              >
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-cyan-500 p-[3px] shadow-2xl shadow-pink-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-pink-500/50">
                  <div className="w-full h-full rounded-[calc(1rem-3px)] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={instructor.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-4xl font-black text-white">{initialsProf}</span>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[calc(1rem-3px)]">
                      {uploadingPhoto ? (
                        <Loader2 className="w-7 h-7 animate-spin text-white" />
                      ) : previewUrl ? (
                        <Check className="w-7 h-7 text-emerald-400" />
                      ) : (
                        <Camera className="w-7 h-7 text-white" />
                      )}
                    </div>
                  </div>
                </div>
                {instructor.activo && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 mt-2">
              {/* Name with edit button */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 w-full max-w-xs"
                      placeholder="Tu nombre"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveName();
                        if (e.key === 'Escape') cancelEditName();
                      }}
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                      title="Guardar"
                    >
                      {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                    <button
                      onClick={cancelEditName}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 transition-all"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black text-white">{instructor.nombre}</h2>
                    <button
                      onClick={startEditName}
                      className="p-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-white/40 hover:text-pink-400 border border-white/10 hover:border-pink-500/30 transition-all"
                      title="Editar nombre"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        {statCards.map((stat, idx) => {
          const colorMap = {
            emerald: 'from-emerald-600 to-teal-600',
            pink: 'from-pink-600 to-rose-600',
            purple: 'from-purple-600 to-violet-600',
            cyan: 'from-cyan-600 to-sky-600',
          };

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[stat.color]} shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                  <p className="text-lg font-black text-white truncate">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {(instructor.curriculumUrl || instructor.temarioUrl) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <FileText size={22} className="text-cyan-400" />
              Documentos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {instructor.curriculumUrl && (
                <a
                  href={`${baseUrl}${instructor.curriculumUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg">
                    <Download size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-cyan-300 transition">Currículum</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Ver documento</p>
                  </div>
                </a>
              )}
              {instructor.temarioUrl && (
                <a
                  href={`${baseUrl}${instructor.temarioUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg">
                    <Download size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-purple-300 transition">Temario</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Ver documento</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal Cambiar Contraseña para profesor (same modal) */}
      {passwordModalOpen && !profile.esAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !changingPassword && setPasswordModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-500" />
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <Lock size={20} className="text-pink-400" />
                Cambiar Contraseña
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold">
                    <AlertCircle size={14} className="shrink-0" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <Check size={14} className="shrink-0" />
                    {passwordSuccess}
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Contraseña Actual</label>
                  <div className="relative">
                    <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Nueva Contraseña</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">Mínimo 8 caracteres, 1 mayúscula y 1 número</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 block">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPasswordModalOpen(false)} disabled={changingPassword}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition text-sm border border-white/10">
                    Cancelar
                  </button>
                  <button type="submit" disabled={changingPassword}
                    className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-500/50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-xs rounded-xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2">
                    {changingPassword ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Check size={14} /> Cambiar</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default MiPerfil;
