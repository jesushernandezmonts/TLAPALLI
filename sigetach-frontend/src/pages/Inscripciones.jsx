import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ alumnoId: '', tallerId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscripciones();
    fetchAlumnos();
    fetchTalleres();
  }, []);

  const fetchInscripciones = async () => {
    const { data } = await api.get('/inscripciones');
    setInscripciones(data);
    setLoading(false);
  };

  const fetchAlumnos = async () => {
    const { data } = await api.get('/alumnos');
    setAlumnos(data);
  };

  const fetchTalleres = async () => {
    const { data } = await api.get('/talleres');
    setTalleres(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inscripciones', {
        alumnoId: parseInt(form.alumnoId),
        tallerId: parseInt(form.tallerId),
      });
      setModalOpen(false);
      fetchInscripciones();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al inscribir');
    }
  };

  const handleBaja = async (id) => {
    if (window.confirm('¿Dar de baja esta inscripción?')) {
      await api.delete(`/inscripciones/${id}`);
      fetchInscripciones();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inscripciones</h1>
          <button onClick={() => setModalOpen(true)} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl font-bold">
            + Nueva Inscripción
          </button>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/70 text-sm">
                <th className="p-3">Alumno</th>
                <th className="p-3">Taller</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado Pago</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
              ) : (
                inscripciones.map(i => (
                  <tr key={i.id} className="border-b border-white/5 hover:bg-white/10">
                    <td className="p-3">{i.alumno?.nombre} {i.alumno?.apellidoPaterno}</td>
                    <td className="p-3">{i.taller?.nombreTaller}</td>
                    <td className="p-3">{new Date(i.fechaInscripcion).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        i.estatusPago === 'al_corriente' ? 'bg-green-500/20 text-green-400' :
                        i.estatusPago === 'baja' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {i.estatusPago}
                      </span>
                    </td>
                    <td className="p-3">
                      {i.estatusPago !== 'baja' && (
                        <button onClick={() => handleBaja(i.id)} className="text-red-400 hover:underline text-sm">Dar baja</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Inscripción">
        <form onSubmit={handleCreate} className="space-y-4">
          <select value={form.alumnoId} onChange={(e) => setForm({...form, alumnoId: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white" required>
            <option value="">Seleccionar alumno</option>
            {alumnos.map(a => (
              <option key={a.id} value={a.id} className="text-black">{a.nombre} {a.apellidoPaterno}</option>
            ))}
          </select>
          <select value={form.tallerId} onChange={(e) => setForm({...form, tallerId: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white" required>
            <option value="">Seleccionar taller</option>
            {talleres.map(t => (
              <option key={t.id} value={t.id} className="text-black">{t.nombreTaller}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold">Inscribir</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Inscripciones;
