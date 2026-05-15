import { useState, useEffect } from 'react';
import api from '../services/api';

function AlumnoForm({ alumno, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    fechaNacimiento: '',
    telefono: '',
    padecimientos: '',
    estatusActivo: true,
  });
  
  // Estados para archivos (solo creación)
  const [archivos, setArchivos] = useState({
    acta_nacimiento: null,
    curp: null,
    comprobante_domicilio: null,
    foto: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (alumno) {
      setForm({
        nombre: alumno.nombre || '',
        apellidoPaterno: alumno.apellidoPaterno || '',
        apellidoMaterno: alumno.apellidoMaterno || '',
        curp: alumno.curp || '',
        fechaNacimiento: alumno.fechaNacimiento ? alumno.fechaNacimiento.slice(0, 10) : '',
        telefono: alumno.telefono || '',
        padecimientos: alumno.padecimientos || '',
        estatusActivo: alumno.estatusActivo ?? true,
      });
    }
  }, [alumno]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, tipo) => {
    setArchivos({ ...archivos, [tipo]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Limpiar campos vacíos para que @IsOptional en el backend funcione correctamente
      const cleanedForm = { ...form };
      if (!cleanedForm.curp) delete cleanedForm.curp;
      if (!cleanedForm.fechaNacimiento) delete cleanedForm.fechaNacimiento;
      if (!cleanedForm.padecimientos) delete cleanedForm.padecimientos;
      if (!cleanedForm.telefono) delete cleanedForm.telefono;
      if (!cleanedForm.apellidoMaterno) delete cleanedForm.apellidoMaterno;

      let savedAlumno;
      if (alumno) {
        const { data } = await api.patch(`/alumnos/${alumno.id}`, cleanedForm);
        savedAlumno = data;
      } else {
        const { data } = await api.post('/alumnos', cleanedForm);
        savedAlumno = data;

        // Subir documentos si es nuevo
        for (const [tipo, archivo] of Object.entries(archivos)) {
          if (archivo) {
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('tipo', tipo);
            await api.post(`/documentos/upload/${savedAlumno.id}`, formData);
          }
        }
      }
      onSave(savedAlumno);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar alumno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">Nombre(s)</label>
          <input
            name="nombre"
            placeholder="Ej. Juan Carlos"
            value={form.nombre}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">Apellido Paterno</label>
          <input
            name="apellidoPaterno"
            placeholder="Ej. Pérez"
            value={form.apellidoPaterno}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">Apellido Materno</label>
          <input
            name="apellidoMaterno"
            placeholder="Ej. García"
            value={form.apellidoMaterno}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">Teléfono</label>
          <input
            name="telefono"
            placeholder="10 dígitos"
            value={form.telefono}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-white/40 uppercase font-black px-1">Padecimientos o Notas Médicas (Opcional)</label>
        <textarea
          name="padecimientos"
          placeholder="Ej. Alergias, asma, diabetes, etc."
          value={form.padecimientos}
          onChange={handleChange}
          rows="2"
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition resize-none"
        />
      </div>

      {!alumno && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 mb-2">Expediente Digital Inicial</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileInput label="Acta de Nacimiento" onChange={(e) => handleFileChange(e, 'acta_nacimiento')} />
            <FileInput label="CURP (Documento)" onChange={(e) => handleFileChange(e, 'curp')} />
            <FileInput label="Comprobante Domicilio" onChange={(e) => handleFileChange(e, 'comprobante_domicilio')} />
            <FileInput label="Foto Infantil" onChange={(e) => handleFileChange(e, 'foto')} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-1">
        <input
          type="checkbox"
          id="activo"
          checked={form.estatusActivo}
          onChange={(e) => setForm({...form, estatusActivo: e.target.checked})}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-600 focus:ring-pink-500/50"
        />
        <label htmlFor="activo" className="text-white/60 text-xs font-bold uppercase tracking-wider cursor-pointer">Alumno activo</label>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl font-bold transition text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-pink-600/20 text-sm"
        >
          {loading ? 'Guardando...' : 'Registrar Alumno'}
        </button>
      </div>
    </form>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] text-white/30 uppercase font-bold px-1">{label}</label>
      <input 
        type="file" 
        onChange={onChange}
        className="block w-full text-[10px] text-white/50
          file:mr-4 file:py-1.5 file:px-3
          file:rounded-lg file:border-0
          file:text-[10px] file:font-black file:uppercase
          file:bg-pink-600/10 file:text-pink-400
          hover:file:bg-pink-600/20 transition cursor-pointer"
        accept=".pdf,.jpg,.png"
      />
    </div>
  );
}

export default AlumnoForm;
