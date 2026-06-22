import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, BookOpen, Calendar,
  Loader2, AlertCircle, RefreshCw, FileText, Download,
  GraduationCap, BadgeCheck, Building2, School, Shield,
  Camera, Pencil, Check, X, Save
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

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        return prev;
      });
      // Update AuthContext user
      setUser(prev => ({ ...prev, fotoUrl: data.fotoUrl }));
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error al subir la foto');
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
      // Update local state
      setProfile(prev => {
        if (prev?.esAdmin) {
          return { ...prev, usuario: { ...prev.usuario, nombre: data.nombre } };
        }
        return { ...prev, nombre: data.nombre };
      });
      // Update AuthContext user
      setUser(prev => ({ ...prev, nombre: data.nombre }));
      setEditMode(false);
    } catch (err) {
      console.error('Error updating name:', err);
      alert('Error al actualizar el nombre');
    } finally {
      setSavingName(false);
    }
  };

  // Compute foto URL helper
  const getFotoUrl = () => {
    if (profile?.esAdmin) {
      return profile.usuario?.fotoUrl || null;
    }
    return null; // instructors don't have fotoUrl yet
  };

  const fotoUrl = getFotoUrl();
  const baseUrl = api.defaults.baseURL || 'http://localhost:3000';

  // Compute initials
  const getNameForInitials = () => {
    if (profile?.esAdmin) return profile.usuario?.nombre || 'Admin';
    return profile?.nombre || profile?.email || 'Instructor';
  };
  const initials = getNameForInitials().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

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
              {/* Avatar - clickeable */}
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
                          src={`${baseUrl}${fotoUrl}`}
                          alt={u.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl font-black text-white">{initials}</span>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[calc(1rem-3px)]">
                        {uploadingPhoto ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleUploadPhoto}
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
      </div>
    );
  }

  // Instructor / Profesor case
  const instructor = profile;
  const nombreInstructor = instructor.nombre || instructor.email || 'Instructor';
  const initialsProf = nombreInstructor.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const getColor = (color) => {
    const colorMap = {
      emerald: 'from-emerald-600 to-teal-600',
      pink: 'from-pink-600 to-rose-600',
      purple: 'from-purple-600 to-violet-600',
      cyan: 'from-cyan-600 to-sky-600',
      amber: 'from-amber-600 to-orange-600',
    };
    return colorMap[color] || 'from-pink-600 to-rose-600';
  };

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
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-cyan-500 p-[3px] shadow-2xl shadow-pink-500/30">
                <div className="w-full h-full rounded-[calc(1rem-3px)] bg-slate-900 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{initialsProf}</span>
                </div>
              </div>
              {instructor.activo && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <BadgeCheck size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 mt-2">
              <h2 className="text-3xl font-black text-white">{instructor.nombre}</h2>
              <p className="text-pink-400 font-bold text-sm uppercase tracking-widest">
                {instructor.taller?.nombreTaller || 'Instructor'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/50 text-sm mt-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-pink-400/60" />
                  <span>{instructor.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-pink-400/60" />
                  <span>{instructor.telefono || 'Sin teléfono'}</span>
                </div>
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
          const [from, to] = [colorMap[stat.color] || colorMap.pink, ''].map(s => s.split(' ')[0]);

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
                  href={`${api.defaults.baseURL || 'http://localhost:3000'}${instructor.curriculumUrl}`}
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
                  href={`${api.defaults.baseURL || 'http://localhost:3000'}${instructor.temarioUrl}`}
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
    </div>
  );
}

export default MiPerfil;
