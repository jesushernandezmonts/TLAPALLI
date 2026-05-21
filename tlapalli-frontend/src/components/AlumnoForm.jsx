import { useState, useEffect } from 'react';
import api from '../services/api';
import { Scan } from 'lucide-react';

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [scanning, setScanning] = useState(null); // 'acta_nacimiento', 'curp', etc.

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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
    if (!form.apellidoPaterno.trim()) errors.apellidoPaterno = 'El apellido paterno es obligatorio.';
    if (!form.apellidoMaterno.trim()) errors.apellidoMaterno = 'El apellido materno es obligatorio.';
    if (!form.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d{10}$/.test(form.telefono.trim())) {
      errors.telefono = 'El teléfono debe tener exactamente 10 dígitos.';
    }
    if (form.curp && form.curp.trim().length !== 18) {
      errors.curp = 'La CURP debe tener exactamente 18 caracteres.';
    }
    return errors;
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files ? e.target.files[0] : null;
    setArchivos(prev => ({ ...prev, [tipo]: file }));
  };

  const handleScan = async (tipo) => {
    setScanning(tipo);
    setError('');
    try {
      const response = await api.post('/documentos/scan', { dialog: true }, { responseType: 'blob' });
      const file = new File([response.data], `${tipo}_escaneado.pdf`, { type: 'application/pdf' });
      setArchivos(prev => ({ ...prev, [tipo]: file }));
    } catch (err) {
      console.error('Error de escaneo:', err);
      let errorMsg = 'Error al escanear el documento';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || errorMsg;
        } catch {
          errorMsg = 'Error en el escáner: no se detectó dispositivo o se canceló el escaneo.';
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setScanning(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const cleanedForm = { ...form };
      if (!cleanedForm.curp) delete cleanedForm.curp;
      if (!cleanedForm.fechaNacimiento) delete cleanedForm.fechaNacimiento;
      if (!cleanedForm.padecimientos) delete cleanedForm.padecimientos;

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
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Información Personal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">
            Nombre(s) <span className="text-pink-500">*</span>
          </label>
          <input
            name="nombre"
            placeholder="Ej. Juan Carlos"
            value={form.nombre}
            onChange={handleChange}
            className={`bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 w-full outline-none transition ${
              fieldErrors.nombre ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-pink-500/50'
            }`}
          />
          {fieldErrors.nombre && (
            <p className="text-[10px] text-rose-400 font-semibold px-1 flex items-center gap-1">
              <span>⚠</span> {fieldErrors.nombre}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">
            Apellido Paterno <span className="text-pink-500">*</span>
          </label>
          <input
            name="apellidoPaterno"
            placeholder="Ej. Pérez"
            value={form.apellidoPaterno}
            onChange={handleChange}
            className={`bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 w-full outline-none transition ${
              fieldErrors.apellidoPaterno ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-pink-500/50'
            }`}
          />
          {fieldErrors.apellidoPaterno && (
            <p className="text-[10px] text-rose-400 font-semibold px-1 flex items-center gap-1">
              <span>⚠</span> {fieldErrors.apellidoPaterno}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">
            Apellido Materno <span className="text-pink-500">*</span>
          </label>
          <input
            name="apellidoMaterno"
            placeholder="Ej. García"
            value={form.apellidoMaterno}
            onChange={handleChange}
            className={`bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 w-full outline-none transition ${
              fieldErrors.apellidoMaterno ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-pink-500/50'
            }`}
          />
          {fieldErrors.apellidoMaterno && (
            <p className="text-[10px] text-rose-400 font-semibold px-1 flex items-center gap-1">
              <span>⚠</span> {fieldErrors.apellidoMaterno}
            </p>
          )}
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">
            Teléfono <span className="text-pink-500">*</span>
          </label>
          <input
            name="telefono"
            placeholder="10 dígitos"
            value={form.telefono}
            onChange={handleChange}
            maxLength={10}
            className={`bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 w-full outline-none transition ${
              fieldErrors.telefono ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-pink-500/50'
            }`}
          />
          {fieldErrors.telefono && (
            <p className="text-[10px] text-rose-400 font-semibold px-1 flex items-center gap-1">
              <span>⚠</span> {fieldErrors.telefono}
            </p>
          )}
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] text-white/40 uppercase font-black px-1">Padecimientos o Notas Médicas (Opcional)</label>
          <input
            name="padecimientos"
            placeholder="Ej. Alergias, asma, diabetes, etc."
            value={form.padecimientos}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 w-full focus:border-pink-500/50 outline-none transition"
          />
        </div>
      </div>

      {/* Expediente Digital Inicial */}
      {!alumno && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Expediente Digital Inicial</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FileInput 
              label="Acta de Nacimiento" 
              onChange={(e) => handleFileChange(e, 'acta_nacimiento')}
              onScan={() => handleScan('acta_nacimiento')}
              fileName={archivos.acta_nacimiento?.name}
              isScanning={scanning === 'acta_nacimiento'}
            />
            <FileInput 
              label="CURP (Documento)" 
              onChange={(e) => handleFileChange(e, 'curp')}
              onScan={() => handleScan('curp')}
              fileName={archivos.curp?.name}
              isScanning={scanning === 'curp'}
            />
            <FileInput 
              label="Comprobante Domicilio" 
              onChange={(e) => handleFileChange(e, 'comprobante_domicilio')}
              onScan={() => handleScan('comprobante_domicilio')}
              fileName={archivos.comprobante_domicilio?.name}
              isScanning={scanning === 'comprobante_domicilio'}
            />
            <FileInput 
              label="Foto Infantil" 
              onChange={(e) => handleFileChange(e, 'foto')}
              onScan={() => handleScan('foto')}
              fileName={archivos.foto?.name}
              isScanning={scanning === 'foto'}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Resumen de errores si los hay */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 flex items-start gap-2">
          <span className="text-rose-400 text-base leading-none mt-0.5">⚠</span>
          <div>
            <p className="text-rose-400 text-xs font-black uppercase tracking-wide">Campos incompletos o incorrectos</p>
            <p className="text-rose-300/70 text-[11px] mt-0.5">Revisa los campos marcados en rojo antes de continuar.</p>
          </div>
        </div>
      )}

      {/* Footer unificado */}
      <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-bold transition text-xs cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || scanning !== null}
          className="px-7 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider transition shadow-lg shadow-pink-600/20 text-xs cursor-pointer"
        >
          {loading ? 'Guardando...' : alumno ? 'Guardar Cambios' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}

function FileInput({ label, onChange, onScan, fileName, isScanning }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 hover:border-white/20 transition-all">
      <div className="min-w-0 flex-1">
        <label className="text-[10px] text-white/50 uppercase font-black tracking-wider px-0.5 block truncate">{label}</label>
        {fileName && (
          <span className="text-[9px] text-pink-400 font-semibold truncate block mt-0.5" title={fileName}>
            ✓ {fileName}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        {fileName ? (
          <button
            type="button"
            onClick={() => onChange({ target: { files: [] } })}
            className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 hover:bg-rose-500/35 transition cursor-pointer select-none"
          >
            Quitar
          </button>
        ) : (
          <>
            <input 
              type="file" 
              onChange={onChange}
              className="hidden"
              id={`file-input-${label.replace(/\s+/g, '-')}`}
              accept=".pdf,.jpg,.png"
            />
            <label
              htmlFor={`file-input-${label.replace(/\s+/g, '-')}`}
              className="flex items-center justify-center py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 transition cursor-pointer border border-white/5 select-none"
            >
              Buscar
            </label>
            <button
              type="button"
              disabled={isScanning}
              onClick={onScan}
              className="flex items-center justify-center py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase bg-gradient-to-r from-pink-600/15 to-purple-600/15 text-pink-400 hover:from-pink-600/25 hover:to-purple-600/25 border border-pink-500/15 hover:border-pink-500/30 transition disabled:opacity-50 cursor-pointer select-none"
            >
              {isScanning ? '...' : 'Scanner'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AlumnoForm;

