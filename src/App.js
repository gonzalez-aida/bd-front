import React, { useEffect, useState } from 'react';
import './App.css';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiPhone } from 'react-icons/fi';

function App() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    correo: '', 
    telefono: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://bd-back.onrender.com';

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/clientes`);
        if (!response.ok) throw new Error('Error al cargar clientes');
        const data = await response.json();
        setClientes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `${API_URL}/clientes/${currentId}`
        : `${API_URL}/clientes`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      const result = await response.json();
      
      if (isEditing) {
        setClientes(clientes.map(c => c._id === currentId ? result : c));
      } else {
        setClientes([...clientes, result]);
      }
      
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      correo: cliente.correo,
      telefono: cliente.telefono || ''
    });
    setIsEditing(true);
    setCurrentId(cliente._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirmas que deseas eliminar este cliente?')) return;
    
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');
      
      setClientes(clientes.filter(c => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ nombre: '', correo: '', telefono: '' });
  };

  if (loading) return <div className="loading-screen">Cargando clientes...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Clientes</h1>
      </header>

      <main className="main-content">
        <div className="card clientes-table-container">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente._id} className="cliente-row">
                  <td>
                    <div className="cliente-info">
                      <div className="avatar">
                        <FiUser />
                      </div>
                      <div>
                        <div className="cliente-nombre">{cliente.nombre}</div>
                        <div className="cliente-id">ID: {cliente._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contacto-info">
                      <div className="contacto-item">
                        <FiMail className="icon" /> {cliente.correo}
                      </div>
                      {cliente.telefono && (
                        <div className="contacto-item">
                          <FiPhone className="icon" /> {cliente.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="acciones">
                      <button 
                        onClick={() => handleEdit(cliente)}
                        className="btn btn-edit"
                      >
                        <FiEdit2 /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(cliente._id)}
                        className="btn btn-delete"
                      >
                        <FiTrash2 /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <button 
        onClick={() => setModalOpen(true)}
        className="floating-btn"
      >
        <FiPlus />
      </button>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button onClick={closeModal} className="modal-close">
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre completo*</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Correo electrónico*</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Ej: juan@empresa.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: +52 55 1234 5678"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  {isEditing ? 'Guardar cambios' : 'Agregar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;