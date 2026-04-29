import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Hexagon,
  LogOut,
  Plus,
  Trash2,
  FileDown,
  X,
  ShieldCheck,
  MapPin,
  Database,
  Activity,
  Lock,
  UserPlus,
  CheckCircle,
  ArrowLeft,
  Table2
} from 'lucide-react';
import { api, setSession, clearSession, getToken, getUser } from './services/api';
import './styles/app.css';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function Login({ onLogin, goRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');

    try {
      const data = await api.login(form);
      setSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Usuario no existe')) {
        setTimeout(goRegister, 800);
      }
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="brand-pill">
          <Hexagon size={18} /> b33 HiveTrack
        </div>
        <h1>Gestión apícola profesional para empresas de polinización.</h1>
        <p>
          Login, registro, apiarios, colmenas, agricultores, contratos,
          movimientos e IPE conectado a MySQL.
        </p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon">
          <Lock />
        </div>

        <h2>Iniciar sesión</h2>

        {error && <div className="alert">{error}</div>}

        <label>Correo</label>
        <input
          value={form.email}
          placeholder="correo@ejemplo.com"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={form.password}
          placeholder="Tu contraseña"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="primary">Entrar al sistema</button>

        <button type="button" className="ghost" onClick={goRegister}>
          Crear cuenta
        </button>
      </form>
    </div>
  );
}

function Register({ goLogin }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rut: '',
    telefono: '',
    rol: 'admin_b33'
  });

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const data = await api.register(form);
      setMsg(data.message);
      setTimeout(goLogin, 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="brand-pill">
          <UserPlus size={18} /> Registro HiveTrack
        </div>
        <h1>Crea tu usuario y guárdalo en MySQL.</h1>
        <p>Luego vuelve al login para entrar al dashboard principal.</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <h2>Crear cuenta</h2>

        {msg && <div className="success">{msg}</div>}
        {error && <div className="alert">{error}</div>}

        <label>Nombre</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <label>Apellido</label>
        <input
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        />

        <label>Correo</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label>RUT</label>
        <input
          value={form.rut}
          onChange={(e) => setForm({ ...form, rut: e.target.value })}
        />

        <label>Teléfono</label>
        <input
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <button className="primary">Registrar usuario</button>

        <button type="button" className="ghost" onClick={goLogin}>
          Volver al login
        </button>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('main');
  const [openForm, setOpenForm] = useState('');

  const [summary, setSummary] = useState({});
  const [apiarios, setApiarios] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [colmenas, setColmenas] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [apiario, setApiario] = useState({
    rua_code: '',
    nombre: '',
    propietario_rut: '',
    lat: '',
    lng: '',
    region: '',
    comuna: '',
    n_colmenas_max: ''
  });

  const [agricultor, setAgricultor] = useState({
    nombre: '',
    razon_social: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const [colmena, setColmena] = useState({
    apiario_id: '',
    codigo_lote: '',
    estado_salud: 'verde',
    reina_id: '',
    nro_marcos: '',
    nro_alzas: '',
    peso_kg: '',
    observaciones: ''
  });

  const [contrato, setContrato] = useState({
    apiario_id: '',
    agricultor_id: '',
    cultivo: '',
    variedad: '',
    superficie_ha: '',
    densidad_acordada: '',
    fecha_inicio: '',
    fecha_fin: '',
    precio_colmena_dia: ''
  });

  const [movimiento, setMovimiento] = useState({
    origen_id: '',
    destino_id: '',
    fecha_movimiento: '',
    n_colmenas: '',
    motivo: '',
    vehiculo_patente: '',
    conductor_rut: ''
  });

  async function load() {
    try {
      const [s, ap, ag, co, ct, mo] = await Promise.all([
        api.summary(),
        api.listApiarios(),
        api.listAgricultores(),
        api.listColmenas(),
        api.listContratos(),
        api.listMovimientos()
      ]);

      setSummary(s);
      setApiarios(ap);
      setAgricultores(ag);
      setColmenas(co);
      setContratos(ct);
      setMovimientos(mo);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  function ok(text) {
    setMensaje(text);
    setError('');
    setTimeout(() => setMensaje(''), 3000);
  }

  async function save(type, e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      if (type === 'apiario') {
        if (!apiario.rua_code || !apiario.nombre) {
          setError('Debes ingresar código RUA y nombre del apiario.');
          return;
        }

        const lat = apiario.lat ? toNumber(apiario.lat) : null;
        const lng = apiario.lng ? toNumber(apiario.lng) : null;
        const maxColmenas = apiario.n_colmenas_max ? toNumber(apiario.n_colmenas_max) : 0;

        if (apiario.lat && lat === null) {
          setError('La latitud debe ser un número.');
          return;
        }

        if (apiario.lng && lng === null) {
          setError('La longitud debe ser un número.');
          return;
        }

        if (apiario.n_colmenas_max && maxColmenas === null) {
          setError('Máx. colmenas debe ser un número.');
          return;
        }

        await api.createApiario({
          ...apiario,
          lat,
          lng,
          n_colmenas_max: maxColmenas
        });

        setApiario({
          rua_code: '',
          nombre: '',
          propietario_rut: '',
          lat: '',
          lng: '',
          region: '',
          comuna: '',
          n_colmenas_max: ''
        });
      }

      if (type === 'agricultor') {
        if (!agricultor.nombre) {
          setError('Debes ingresar el nombre del agricultor.');
          return;
        }

        await api.createAgricultor(agricultor);

        setAgricultor({
          nombre: '',
          razon_social: '',
          rut: '',
          email: '',
          telefono: '',
          direccion: ''
        });
      }

      if (type === 'colmena') {
        if (!colmena.apiario_id) {
          setError('Debes seleccionar un apiario.');
          return;
        }

        if (!colmena.codigo_lote) {
          setError('Debes ingresar el código de lote.');
          return;
        }

        const nroMarcos = colmena.nro_marcos ? toNumber(colmena.nro_marcos) : 0;
        const nroAlzas = colmena.nro_alzas ? toNumber(colmena.nro_alzas) : 0;
        const pesoKg = colmena.peso_kg ? toNumber(colmena.peso_kg) : 0;

        if (colmena.nro_marcos && nroMarcos === null) {
          setError('Nº marcos debe ser un número.');
          return;
        }

        if (colmena.nro_alzas && nroAlzas === null) {
          setError('Nº alzas debe ser un número.');
          return;
        }

        if (colmena.peso_kg && pesoKg === null) {
          setError('Peso kg debe ser un número.');
          return;
        }

        await api.createColmena({
          ...colmena,
          nro_marcos: nroMarcos,
          nro_alzas: nroAlzas,
          peso_kg: pesoKg
        });

        setColmena({
          apiario_id: '',
          codigo_lote: '',
          estado_salud: 'verde',
          reina_id: '',
          nro_marcos: '',
          nro_alzas: '',
          peso_kg: '',
          observaciones: ''
        });
      }

      if (type === 'contrato') {
        if (!contrato.apiario_id) {
          setError('Debes seleccionar un apiario.');
          return;
        }

        if (!contrato.agricultor_id) {
          setError('Debes seleccionar un agricultor.');
          return;
        }

        if (!contrato.cultivo) {
          setError('Debes ingresar el cultivo.');
          return;
        }

        if (!contrato.fecha_inicio || !contrato.fecha_fin) {
          setError('Debes ingresar fecha de inicio y fecha de fin.');
          return;
        }

        const superficie = toNumber(contrato.superficie_ha);
        const densidad = toNumber(contrato.densidad_acordada);
        const precio = contrato.precio_colmena_dia ? toNumber(contrato.precio_colmena_dia) : 0;

        if (superficie === null || superficie <= 0) {
          setError('Superficie ha debe ser un número mayor a 0. Ejemplo: 4');
          return;
        }

        if (densidad === null || densidad <= 0) {
          setError('Densidad col/ha debe ser un número mayor a 0. Ejemplo: 6');
          return;
        }

        if (contrato.precio_colmena_dia && precio === null) {
          setError('Precio colmena/día debe ser un número.');
          return;
        }

        await api.createContrato({
          ...contrato,
          superficie_ha: superficie,
          densidad_acordada: densidad,
          precio_colmena_dia: precio
        });

        setContrato({
          apiario_id: '',
          agricultor_id: '',
          cultivo: '',
          variedad: '',
          superficie_ha: '',
          densidad_acordada: '',
          fecha_inicio: '',
          fecha_fin: '',
          precio_colmena_dia: ''
        });
      }

      if (type === 'movimiento') {
        if (!movimiento.origen_id || !movimiento.destino_id) {
          setError('Debes seleccionar apiario origen y destino.');
          return;
        }

        if (!movimiento.fecha_movimiento) {
          setError('Debes ingresar la fecha del movimiento.');
          return;
        }

        const nColmenas = toNumber(movimiento.n_colmenas);

        if (nColmenas === null || nColmenas <= 0) {
          setError('Nº colmenas debe ser un número mayor a 0.');
          return;
        }

        if (!movimiento.motivo) {
          setError('Debes ingresar el motivo.');
          return;
        }

        await api.createMovimiento({
          ...movimiento,
          n_colmenas: nColmenas
        });

        setMovimiento({
          origen_id: '',
          destino_id: '',
          fecha_movimiento: '',
          n_colmenas: '',
          motivo: '',
          vehiculo_patente: '',
          conductor_rut: ''
        });
      }

      await load();
      setOpenForm('');
      ok('Dato guardado correctamente. El resumen se actualizó en tiempo real.');
    } catch (err) {
      setError(err.message || 'Error al guardar.');
    }
  }

  async function remove(type, id) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este registro?');
    if (!confirmar) return;

    try {
      setError('');

      if (type === 'apiario') await api.deleteApiario(id);
      if (type === 'agricultor') await api.deleteAgricultor(id);
      if (type === 'colmena') await api.deleteColmena(id);
      if (type === 'contrato') await api.deleteContrato(id);
      if (type === 'movimiento') await api.deleteMovimiento(id);

      await load();
      ok('Dato eliminado correctamente. El resumen se actualizó automáticamente.');
    } catch (err) {
      setError(err.message);
    }
  }

  function salir() {
    clearSession();
    onLogout();
  }

  function descargarPDF() {
    const maxPdf = Math.max(
      summary.apiarios || 0,
      summary.colmenas || 0,
      summary.agricultores || 0,
      summary.contratos || 0,
      summary.movimientos || 0,
      1
    );

    const barras = [
      ['Apiarios', summary.apiarios || 0],
      ['Colmenas', summary.colmenas || 0],
      ['Agricultores', summary.agricultores || 0],
      ['Contratos', summary.contratos || 0],
      ['Movimientos', summary.movimientos || 0]
    ].map(([label, value]) => {
      const width = Math.max(5, (value / maxPdf) * 100);

      return `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar">
            <div style="width:${width}%"></div>
          </div>
          <b>${value}</b>
        </div>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Reporte HiveTrack</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111827;
              background: #ffffff;
            }

            h1 {
              color: #0f3a4a;
              font-size: 34px;
              margin-bottom: 6px;
            }

            h2 {
              color: #14365d;
              margin-top: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
            }

            .resumen {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 12px;
              margin: 20px 0;
            }

            .stat {
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 16px;
              background: #f8fafc;
            }

            .stat strong {
              display: block;
              font-size: 28px;
              color: #0f3a4a;
            }

            .chart {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 20px;
              margin: 20px 0;
              background: #ffffff;
            }

            .bar-row {
              display: grid;
              grid-template-columns: 130px 1fr 40px;
              gap: 12px;
              align-items: center;
              margin-bottom: 14px;
              font-weight: 700;
            }

            .bar {
              height: 18px;
              background: #e5e7eb;
              border-radius: 999px;
              overflow: hidden;
            }

            .bar div {
              height: 100%;
              background: linear-gradient(135deg, #d97706, #f59e0b);
              border-radius: 999px;
            }

            .box {
              border: 1px solid #e5e7eb;
              padding: 13px 15px;
              margin: 8px 0;
              border-radius: 12px;
              background: #f8fafc;
            }

            .footer {
              margin-top: 35px;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <h1>Reporte b33 HiveTrack</h1>
          <p><b>Usuario:</b> ${user?.nombre || 'Usuario'} — ${user?.rol || ''}</p>
          <p><b>Fecha:</b> ${new Date().toLocaleString()}</p>

          <h2>Resumen general</h2>

          <div class="resumen">
            <div class="stat"><strong>${summary.apiarios || 0}</strong>Apiarios</div>
            <div class="stat"><strong>${summary.colmenas || 0}</strong>Colmenas</div>
            <div class="stat"><strong>${summary.agricultores || 0}</strong>Agricultores</div>
            <div class="stat"><strong>${summary.contratos || 0}</strong>Contratos</div>
            <div class="stat"><strong>${summary.movimientos || 0}</strong>Movimientos</div>
          </div>

          <h2>Gráfico general</h2>
          <div class="chart">
            ${barras}
          </div>

          <h2>Apiarios</h2>
          ${
            apiarios.length
              ? apiarios.map(a => `<div class="box">${a.nombre} — ${a.rua_code} — ${a.region || ''}</div>`).join('')
              : '<div class="box">Sin apiarios registrados.</div>'
          }

          <h2>Agricultores</h2>
          ${
            agricultores.length
              ? agricultores.map(a => `<div class="box">${a.nombre} — ${a.email || ''}</div>`).join('')
              : '<div class="box">Sin agricultores registrados.</div>'
          }

          <h2>Colmenas</h2>
          ${
            colmenas.length
              ? colmenas.map(c => `<div class="box">${c.codigo_lote} — ${c.estado_salud}</div>`).join('')
              : '<div class="box">Sin colmenas registradas.</div>'
          }

          <h2>Contratos</h2>
          ${
            contratos.length
              ? contratos.map(c => `<div class="box">${c.cultivo} — IPE ${c.ipe_final || 0}</div>`).join('')
              : '<div class="box">Sin contratos registrados.</div>'
          }

          <h2>Movimientos</h2>
          ${
            movimientos.length
              ? movimientos.map(m => `<div class="box">${m.n_colmenas} colmenas — ${m.motivo}</div>`).join('')
              : '<div class="box">Sin movimientos registrados.</div>'
          }

          <div class="footer">
            Reporte generado automáticamente por b33 HiveTrack.
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.print();
    }, 500);
  }

  const max = Math.max(
    summary.apiarios || 0,
    summary.colmenas || 0,
    summary.agricultores || 0,
    summary.contratos || 0,
    summary.movimientos || 0,
    1
  );

  return (
    <div className="app">
      <aside>
        <div className="logo">
          <Hexagon /> <strong>b33 HiveTrack</strong>
        </div>

        <nav>
          <button onClick={() => setView('main')}>Página principal</button>
          <button onClick={() => setView('create')}>Crear datos</button>
          <button onClick={() => setView('results')}>Ver resultados</button>
        </nav>

        <button className="logout" onClick={salir}>
          <LogOut size={16} /> Salir
        </button>
      </aside>

      <main>
        <header className="hero">
          <div>
            <span className="eyebrow">Panel operativo apícola</span>
            <h1>Dashboard HiveTrack</h1>
            <p>Resumen en tiempo real, formularios desplegables, eliminación y reporte PDF.</p>
          </div>

          <div className="userbox">
            <b>{user?.nombre || 'Usuario'}</b>
            <span>{user?.rol || 'Admin'}</span>
          </div>
        </header>

        {mensaje && <div className="success"><CheckCircle size={18} /> {mensaje}</div>}
        {error && <div className="alert">{error}</div>}

        {view === 'main' && (
          <>
            <Stats summary={summary} />
            <Modules />
            <Chart summary={summary} max={max} />

            <section className="panel">
              <div className="section-title">
                <div>
                  <h2>Página principal</h2>
                  <p>Desde aquí puedes crear información, ver resultados y descargar el reporte.</p>
                </div>

                <div className="button-row">
                  <button className="pdf-btn" onClick={() => setView('create')}>
                    <Plus size={17} /> Crear datos
                  </button>

                  <button className="pdf-btn secondary" onClick={() => setView('results')}>
                    <Table2 size={17} /> Ver resultados
                  </button>

                  <button className="pdf-btn" onClick={descargarPDF}>
                    <FileDown size={17} /> Descargar PDF
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'create' && (
          <section className="panel">
            <button className="back-btn" onClick={() => setView('main')}>
              <ArrowLeft size={16} /> Volver a página principal
            </button>

            <div className="section-title">
              <div>
                <h2>Crear datos</h2>
                <p>Presiona un botón para desplegar su formulario. Al guardar, se suma automáticamente al resumen.</p>
              </div>
            </div>

            <div className="action-grid">
              {[
                ['agricultor', 'Agricultor'],
                ['apiario', 'Apiario'],
                ['colmena', 'Colmena'],
                ['contrato', 'Contrato'],
                ['movimiento', 'Movimiento']
              ].map(([key, label]) => (
                <button
                  key={key}
                  className="action-card"
                  onClick={() => setOpenForm(openForm === key ? '' : key)}
                >
                  <Plus /> {label}
                </button>
              ))}
            </div>

            {openForm && (
              <div className="modal-card">
                <button className="close-btn" onClick={() => setOpenForm('')}>
                  <X />
                </button>

                {openForm === 'agricultor' && (
                  <form onSubmit={(e) => save('agricultor', e)}>
                    <h3>Formulario Agricultor</h3>

                    <div className="form-grid">
                      <input placeholder="Nombre" value={agricultor.nombre} onChange={e => setAgricultor({ ...agricultor, nombre: e.target.value })} />
                      <input placeholder="Razón social" value={agricultor.razon_social} onChange={e => setAgricultor({ ...agricultor, razon_social: e.target.value })} />
                      <input placeholder="RUT" value={agricultor.rut} onChange={e => setAgricultor({ ...agricultor, rut: e.target.value })} />
                      <input placeholder="Email" value={agricultor.email} onChange={e => setAgricultor({ ...agricultor, email: e.target.value })} />
                      <input placeholder="Teléfono" value={agricultor.telefono} onChange={e => setAgricultor({ ...agricultor, telefono: e.target.value })} />
                      <input placeholder="Dirección" value={agricultor.direccion} onChange={e => setAgricultor({ ...agricultor, direccion: e.target.value })} />
                    </div>

                    <button className="primary small">Guardar agricultor</button>
                  </form>
                )}

                {openForm === 'apiario' && (
                  <form onSubmit={(e) => save('apiario', e)}>
                    <h3>Formulario Apiario</h3>

                    <div className="form-grid">
                      <input placeholder="Código RUA" value={apiario.rua_code} onChange={e => setApiario({ ...apiario, rua_code: e.target.value })} />
                      <input placeholder="Nombre" value={apiario.nombre} onChange={e => setApiario({ ...apiario, nombre: e.target.value })} />
                      <input placeholder="RUT propietario" value={apiario.propietario_rut} onChange={e => setApiario({ ...apiario, propietario_rut: e.target.value })} />
                      <input type="number" step="0.00000001" placeholder="Latitud" value={apiario.lat} onChange={e => setApiario({ ...apiario, lat: e.target.value })} />
                      <input type="number" step="0.00000001" placeholder="Longitud" value={apiario.lng} onChange={e => setApiario({ ...apiario, lng: e.target.value })} />
                      <input placeholder="Región" value={apiario.region} onChange={e => setApiario({ ...apiario, region: e.target.value })} />
                      <input placeholder="Comuna" value={apiario.comuna} onChange={e => setApiario({ ...apiario, comuna: e.target.value })} />
                      <input type="number" min="0" placeholder="Máx. colmenas" value={apiario.n_colmenas_max} onChange={e => setApiario({ ...apiario, n_colmenas_max: e.target.value })} />
                    </div>

                    <button className="primary small">Guardar apiario</button>
                  </form>
                )}

                {openForm === 'colmena' && (
                  <form onSubmit={(e) => save('colmena', e)}>
                    <h3>Formulario Colmena</h3>

                    <div className="form-grid">
                      <select value={colmena.apiario_id} onChange={e => setColmena({ ...colmena, apiario_id: e.target.value })}>
                        <option value="">Seleccionar apiario</option>
                        {apiarios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>

                      <input placeholder="Código lote" value={colmena.codigo_lote} onChange={e => setColmena({ ...colmena, codigo_lote: e.target.value })} />

                      <select value={colmena.estado_salud} onChange={e => setColmena({ ...colmena, estado_salud: e.target.value })}>
                        <option value="verde">Verde</option>
                        <option value="amarillo">Amarillo</option>
                        <option value="naranjo">Naranjo</option>
                        <option value="rojo">Rojo</option>
                      </select>

                      <input placeholder="ID reina" value={colmena.reina_id} onChange={e => setColmena({ ...colmena, reina_id: e.target.value })} />
                      <input type="number" min="0" placeholder="Nº marcos" value={colmena.nro_marcos} onChange={e => setColmena({ ...colmena, nro_marcos: e.target.value })} />
                      <input type="number" min="0" placeholder="Nº alzas" value={colmena.nro_alzas} onChange={e => setColmena({ ...colmena, nro_alzas: e.target.value })} />
                      <input type="number" min="0" step="0.01" placeholder="Peso kg" value={colmena.peso_kg} onChange={e => setColmena({ ...colmena, peso_kg: e.target.value })} />
                      <input placeholder="Observaciones" value={colmena.observaciones} onChange={e => setColmena({ ...colmena, observaciones: e.target.value })} />
                    </div>

                    <button className="primary small">Guardar colmena</button>
                  </form>
                )}

                {openForm === 'contrato' && (
                  <form onSubmit={(e) => save('contrato', e)}>
                    <h3>Formulario Contrato</h3>

                    <div className="form-grid">
                      <select value={contrato.apiario_id} onChange={e => setContrato({ ...contrato, apiario_id: e.target.value })}>
                        <option value="">Seleccionar apiario</option>
                        {apiarios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>

                      <select value={contrato.agricultor_id} onChange={e => setContrato({ ...contrato, agricultor_id: e.target.value })}>
                        <option value="">Seleccionar agricultor</option>
                        {agricultores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>

                      <input placeholder="Cultivo" value={contrato.cultivo} onChange={e => setContrato({ ...contrato, cultivo: e.target.value })} />
                      <input placeholder="Variedad" value={contrato.variedad} onChange={e => setContrato({ ...contrato, variedad: e.target.value })} />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Superficie ha"
                        value={contrato.superficie_ha}
                        onChange={e => setContrato({ ...contrato, superficie_ha: e.target.value })}
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Densidad col/ha"
                        value={contrato.densidad_acordada}
                        onChange={e => setContrato({ ...contrato, densidad_acordada: e.target.value })}
                      />

                      <input type="date" value={contrato.fecha_inicio} onChange={e => setContrato({ ...contrato, fecha_inicio: e.target.value })} />
                      <input type="date" value={contrato.fecha_fin} onChange={e => setContrato({ ...contrato, fecha_fin: e.target.value })} />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Precio colmena/día"
                        value={contrato.precio_colmena_dia}
                        onChange={e => setContrato({ ...contrato, precio_colmena_dia: e.target.value })}
                      />
                    </div>

                    <button
                      className="primary small"
                      disabled={!contrato.apiario_id || !contrato.agricultor_id}
                    >
                      Guardar contrato
                    </button>
                  </form>
                )}

                {openForm === 'movimiento' && (
                  <form onSubmit={(e) => save('movimiento', e)}>
                    <h3>Formulario Movimiento</h3>

                    <div className="form-grid">
                      <select value={movimiento.origen_id} onChange={e => setMovimiento({ ...movimiento, origen_id: e.target.value })}>
                        <option value="">Apiario origen</option>
                        {apiarios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>

                      <select value={movimiento.destino_id} onChange={e => setMovimiento({ ...movimiento, destino_id: e.target.value })}>
                        <option value="">Apiario destino</option>
                        {apiarios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>

                      <input type="datetime-local" value={movimiento.fecha_movimiento} onChange={e => setMovimiento({ ...movimiento, fecha_movimiento: e.target.value })} />
                      <input type="number" min="1" placeholder="Nº colmenas" value={movimiento.n_colmenas} onChange={e => setMovimiento({ ...movimiento, n_colmenas: e.target.value })} />
                      <input placeholder="Motivo" value={movimiento.motivo} onChange={e => setMovimiento({ ...movimiento, motivo: e.target.value })} />
                      <input placeholder="Patente vehículo" value={movimiento.vehiculo_patente} onChange={e => setMovimiento({ ...movimiento, vehiculo_patente: e.target.value })} />
                      <input placeholder="RUT conductor" value={movimiento.conductor_rut} onChange={e => setMovimiento({ ...movimiento, conductor_rut: e.target.value })} />
                    </div>

                    <button className="primary small">Guardar movimiento</button>
                  </form>
                )}
              </div>
            )}
          </section>
        )}

        {view === 'results' && (
          <section className="panel">
            <button className="back-btn" onClick={() => setView('main')}>
              <ArrowLeft size={16} /> Volver a página principal
            </button>

            <div className="section-title">
              <div>
                <h2>Resultados creados</h2>
                <p>Estos datos vienen desde MySQL y se actualizan en tiempo real.</p>
              </div>

              <button className="pdf-btn" onClick={descargarPDF}>
                <FileDown size={17} /> Descargar PDF
              </button>
            </div>

            <Stats summary={summary} />
            <Chart summary={summary} max={max} />

            <DataList title="Apiarios" rows={apiarios} type="apiario" remove={remove} render={a => `${a.nombre} — ${a.rua_code} — ${a.region || ''}`} />
            <DataList title="Agricultores" rows={agricultores} type="agricultor" remove={remove} render={a => `${a.nombre} — ${a.email || ''}`} />
            <DataList title="Colmenas" rows={colmenas} type="colmena" remove={remove} render={c => `${c.codigo_lote} — ${c.estado_salud}`} />
            <DataList title="Contratos" rows={contratos} type="contrato" remove={remove} render={c => `${c.cultivo} — IPE ${c.ipe_final || 0}`} />
            <DataList title="Movimientos" rows={movimientos} type="movimiento" remove={remove} render={m => `${m.n_colmenas} colmenas — ${m.motivo}`} />
          </section>
        )}
      </main>
    </div>
  );
}

function Stats({ summary }) {
  return (
    <section className="stats">
      <div><strong>{summary.apiarios || 0}</strong><span>Apiarios</span></div>
      <div><strong>{summary.colmenas || 0}</strong><span>Colmenas</span></div>
      <div><strong>{summary.agricultores || 0}</strong><span>Agricultores</span></div>
      <div><strong>{summary.contratos || 0}</strong><span>Contratos</span></div>
      <div><strong>{summary.movimientos || 0}</strong><span>Movimientos</span></div>
    </section>
  );
}

function Modules() {
  return (
    <section className="modules">
      <div className="module-card"><ShieldCheck /><h3>Cumplimiento legal</h3><p>RUA, movimientos, tratamientos y alertas.</p></div>
      <div className="module-card"><MapPin /><h3>Trazabilidad</h3><p>Apiarios, coordenadas y predios.</p></div>
      <div className="module-card"><Database /><h3>MySQL</h3><p>Datos persistentes en hivetrack.</p></div>
      <div className="module-card"><Activity /><h3>IPE</h3><p>Contratos e índice de polinización.</p></div>
    </section>
  );
}

function Chart({ summary, max }) {
  return (
    <section className="panel">
      <h2>Gráfico y resumen</h2>

      <div className="chart-card">
        {[
          ['Apiarios', summary.apiarios || 0],
          ['Colmenas', summary.colmenas || 0],
          ['Agricultores', summary.agricultores || 0],
          ['Contratos', summary.contratos || 0],
          ['Movimientos', summary.movimientos || 0]
        ].map(([label, value]) => (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <div className="bar">
              <div style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataList({ title, rows, type, remove, render }) {
  return (
    <div className="table-card">
      <h3>{title}</h3>

      {!rows.length && <p className="empty">Sin datos todavía.</p>}

      {rows.map(row => (
        <div className="data-row" key={row.id}>
          <span>{render(row)}</span>

          <button onClick={() => remove(type, row.id)}>
            <Trash2 size={15} /> Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState(getToken() ? 'dashboard' : 'login');
  const [user, setUser] = useState(getUser());

  if (screen === 'register') {
    return <Register goLogin={() => setScreen('login')} />;
  }

  if (screen === 'dashboard') {
    return <Dashboard user={user} onLogout={() => setScreen('login')} />;
  }

  return (
    <Login
      onLogin={(u) => {
        setUser(u);
        setScreen('dashboard');
      }}
      goRegister={() => setScreen('register')}
    />
  );
}

createRoot(document.getElementById('root')).render(<App />);