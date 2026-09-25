// Capa de datos de DEMOSTRACIÓN para grabar el video.
// Reemplaza window.supabase.createClient por un cliente falso que devuelve
// filas inventadas, para poder fotografiar el producto REAL lleno de datos
// sin tocar la base de producción. Solo vive en el script de captura.

(() => {
  const UID = 'demo-proveedor-0001';

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const d = n => {
    const x = new Date(hoy); x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };
  // Día fijo del mes en curso: así el calendario del video se ve lleno
  // sin depender de qué día se grabó.
  const p2 = n => (n < 10 ? '0' : '') + n;
  const dm = (dia, mesesAtras = 0) => {
    const x = new Date(hoy.getFullYear(), hoy.getMonth() + mesesAtras, dia);
    return x.getFullYear() + '-' + p2(x.getMonth() + 1) + '-' + p2(x.getDate());
  };

  const DATA = {
    profiles: [{
      id: UID,
      role: 'proveedor',
      verification_status: 'aprobado',
      full_name: 'Sonido Marco · DJ & Luces',
      categoria: 'musica',
      location: 'Miraflores, Lima',
      bio: 'DJ para bodas, quinceañeros y corporativos. 8 años animando eventos en Lima. Equipo propio de sonido e iluminación.',
      avatar_url: null, banner_url: null,
      rating: 4.9, reviews_count: 23, is_founder: true
    }],

    agenda: [
      { id: 1, event_date: dm(4, 1),  type: 'Boda',        client_name: 'Valeria Quispe',    start_time: '19:00', end_time: '02:00', district: 'Miraflores', status: 'Confirmado', request_id: 11 },
      { id: 2, event_date: dm(7, 1),  type: 'Quinceañero', client_name: 'Familia Ramos',     start_time: '20:00', end_time: '01:00', district: 'San Isidro', status: 'Confirmado', request_id: 12 },
      { id: 3, event_date: dm(11, 1), type: 'Corporativo', client_name: 'Andina S.A.C.',     start_time: '18:00', end_time: '23:00', district: 'San Borja',  status: 'Confirmado', request_id: 13 },
      { id: 4, event_date: dm(14, 1), type: 'Cumpleaños',  client_name: 'Luis Ferrer',       start_time: '21:00', end_time: '02:00', district: 'Surco',      status: 'Confirmado', request_id: 14 },
      { id: 5, event_date: dm(18, 1), type: 'Promoción',   client_name: 'Colegio San Pablo', start_time: '19:30', end_time: '01:30', district: 'La Molina',  status: 'Confirmado', request_id: 15 },
      { id: 6, event_date: dm(21, 1), type: 'Boda',        client_name: 'Andrea & Diego',    start_time: '18:00', end_time: '03:00', district: 'Barranco',   status: 'Confirmado', request_id: 16 },
      { id: 7, event_date: dm(25, 1), type: 'Quinceañero', client_name: 'Mía Herrera',       start_time: '20:00', end_time: '02:00', district: 'Surco',      status: 'Confirmado', request_id: 17 },
      { id: 8, event_date: dm(28, 1), type: 'Corporativo', client_name: 'Grupo Perú Retail', start_time: '17:00', end_time: '22:00', district: 'San Isidro', status: 'Confirmado', request_id: 18 }
    ],

    // Repartidos en 6 meses: así el gráfico de "Ingresos por mes" de Reportes
    // muestra una serie de verdad y no una sola barra.
    caja_movimientos: [
      { id: 1,  fecha: dm(24, 0),  concepto: 'Adelanto boda Valeria Q.',      tipo: 'Ingreso', monto: 900 },
      { id: 2,  fecha: dm(18, 0),  concepto: 'Quinceañero Familia Ramos',     tipo: 'Ingreso', monto: 1400 },
      { id: 3,  fecha: dm(14, 0),  concepto: 'Alquiler de luces robóticas',   tipo: 'Gasto',   monto: 320 },
      { id: 4,  fecha: dm(9,  0),  concepto: 'Corporativo Andina S.A.C.',     tipo: 'Ingreso', monto: 2100 },
      { id: 5,  fecha: dm(26, -1), concepto: 'Boda Andrea & Diego',           tipo: 'Ingreso', monto: 2400 },
      { id: 6,  fecha: dm(19, -1), concepto: 'Cumpleaños Luis F.',            tipo: 'Ingreso', monto: 1100 },
      { id: 7,  fecha: dm(12, -1), concepto: 'Combustible y movilidad',       tipo: 'Gasto',   monto: 180 },
      { id: 8,  fecha: dm(5,  -1), concepto: 'Promoción Colegio San Pablo',   tipo: 'Ingreso', monto: 1750 },
      { id: 9,  fecha: dm(22, -2), concepto: 'Matrimonio civil Rosa M.',      tipo: 'Ingreso', monto: 1600 },
      { id: 10, fecha: dm(11, -2), concepto: 'Corporativo Perú Retail',       tipo: 'Ingreso', monto: 2300 },
      { id: 11, fecha: dm(6,  -2), concepto: 'Mantenimiento de consola',      tipo: 'Gasto',   monto: 250 },
      { id: 12, fecha: dm(21, -3), concepto: 'Quinceañero Mía H.',            tipo: 'Ingreso', monto: 1850 },
      { id: 13, fecha: dm(8,  -3), concepto: 'Aniversario Club Regatas',      tipo: 'Ingreso', monto: 1400 },
      { id: 14, fecha: dm(16, -4), concepto: 'Boda Sofía & Martín',           tipo: 'Ingreso', monto: 2650 },
      { id: 15, fecha: dm(4,  -4), concepto: 'Compra de parlante JBL',        tipo: 'Gasto',   monto: 1200 },
      { id: 16, fecha: dm(20, -5), concepto: 'Promoción Colegio Los Álamos',  tipo: 'Ingreso', monto: 1500 },
      { id: 17, fecha: dm(9,  -5), concepto: 'Cumpleaños corporativo Delta',  tipo: 'Ingreso', monto: 980 }
    ],

    crm_clientes: [
      { id: 1, nombre: 'Valeria Quispe',      tipo: 'Boda',        eventos: 2, estado: 'Cliente frecuente' },
      { id: 2, nombre: 'Familia Ramos',       tipo: 'Quinceañero', eventos: 1, estado: 'Confirmado' },
      { id: 3, nombre: 'Andina S.A.C.',       tipo: 'Corporativo', eventos: 4, estado: 'Cliente frecuente' },
      { id: 4, nombre: 'Luis Ferrer',         tipo: 'Cumpleaños',  eventos: 1, estado: 'En conversación' },
      { id: 5, nombre: 'Colegio San Pablo',   tipo: 'Promoción',   eventos: 3, estado: 'Cliente frecuente' }
    ],

    inventario_items: [
      { id: 1, nombre: 'Consola Pioneer DDJ-1000', cantidad: 1, estado: 'Operativo' },
      { id: 2, nombre: 'Parlantes JBL SRX 15"',    cantidad: 4, estado: 'Operativo' },
      { id: 3, nombre: 'Luces robóticas Beam',     cantidad: 6, estado: 'Operativo' },
      { id: 4, nombre: 'Máquina de humo',          cantidad: 2, estado: 'En reparación' }
    ],

    services: [
      { id: 101, provider_id: UID, name: 'DJ + Sonido profesional (5 horas)', price: 1200, precio_a_cotizar: false, category: 'musica', description: 'DJ con equipo de sonido profesional para 150 personas, luces incluidas y animación básica.', no_incluye: 'Pantalla LED, horas extra', website_url: null, image_url: null, imagenes: [], video_url: null, active: true, created_at: '2026-01-02', opciones: [{ modo: 'paquete', nombre: 'Pack básico · 4 horas', precio: 1200 }, { modo: 'paquete', nombre: 'Pack full · 6 horas + luces', precio: 1850 }] },
      { id: 102, provider_id: UID, name: 'Cabina DJ + luces robóticas', price: 1850, precio_a_cotizar: false, category: 'musica', description: 'Cabina iluminada, 6 luces robóticas y máquina de humo.', no_incluye: 'Transporte fuera de Lima', website_url: null, image_url: null, imagenes: [], video_url: null, active: true, created_at: '2026-01-03', opciones: [] }
    ],

    // Reservas que entran por el marketplace: es la demanda que el proveedor
    // no tenía que salir a buscar. Mezcla de confirmadas y pendientes.
    requests: [
      { id: 21, provider_id: UID, event_date: dm(4,  1), start_time: '19:00', end_time: '02:00', status: 'confirmada', message: 'Es el matrimonio de mi hermana, 120 invitados. Ya vi tus fotos, nos encantó.', client_name: 'Valeria Quispe',    client_phone: '987 654 321', client_email: 'valeria@correo.com', total_amount: 1200, commission_amount: 120, event_type: 'Boda',        services: { name: 'DJ + Sonido profesional (5 horas)' } },
      { id: 22, provider_id: UID, event_date: dm(7,  1), start_time: '20:00', end_time: '01:00', status: 'confirmada', message: '¿Incluye luces robóticas? Es un quinceañero en San Isidro.',               client_name: 'Familia Ramos',     client_phone: '988 444 555', client_email: 'ramos@correo.com',   total_amount: 1850, commission_amount: 185, event_type: 'Quinceañero', services: { name: 'Cabina DJ + luces robóticas' } },
      { id: 23, provider_id: UID, event_date: dm(11, 1), start_time: '18:00', end_time: '23:00', status: 'pendiente',  message: 'Aniversario de la empresa. Necesitamos sonido para 200 personas.',           client_name: 'Andina S.A.C.',     client_phone: '977 222 333', client_email: 'eventos@andina.pe', total_amount: 2100, commission_amount: 210, event_type: 'Corporativo', services: { name: 'DJ + Sonido profesional (5 horas)' } },
      { id: 24, provider_id: UID, event_date: dm(14, 1), start_time: '21:00', end_time: '02:00', status: 'pendiente',  message: 'Cumpleaños de 40. ¿Puedes llegar a Surco?',                                  client_name: 'Luis Ferrer',       client_phone: '966 777 888', client_email: 'luis@correo.com',   total_amount: 1200, commission_amount: 120, event_type: 'Cumpleaños',  services: { name: 'DJ + Sonido profesional (5 horas)' } }
    ],

    cotizacion_plantillas: [{
      id: 1, provider_id: UID, nombre: 'Plantilla principal', ocasion: 'Bodas y quinceañeros',
      negocio: 'Sonido Marco · DJ & Luces', color: '#7C3AED', validez: '15 días',
      telefono: '999 888 777', correo: 'contacto@sonidomarco.pe', pago: 'Adelanto del 50% al reservar',
      intro: 'Gracias por escribirnos. Esta es la cotización para tu evento:',
      terminos: 'El precio incluye traslado dentro de Lima Metropolitana. Horas extra S/. 150 c/u.'
    }],

    reviews: [
      { id: 1, service_id: 101, provider_id: UID, rating: 5, comment: 'Excelente, la pista no se vació en toda la noche.', created_at: '2026-08-10', client_name: 'Andrea T.' },
      { id: 2, service_id: 101, provider_id: UID, rating: 5, comment: 'Puntual y muy profesional. Lo recomiendo.',        created_at: '2026-07-22', client_name: 'Jorge M.' }
    ],

    comentarios_perfil: [],
    feed_photos: [],
    solicitudes_proveedor: [{ id: 1, user_id: UID, motivo_rechazo: null }]
  };

  // Constructor de consultas falso: cualquier cadena de .select().eq().order()
  // termina resolviendo con las filas de la tabla pedida.
  const NOOP_CHAIN = ['select', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'or', 'not', 'order', 'limit', 'range', 'filter', 'match', 'contains', 'overlaps', 'returns'];

  function query(tabla) {
    let filas = (DATA[tabla] || []).slice();
    let modo = 'lista';
    const api = {};
    NOOP_CHAIN.forEach(m => { api[m] = () => api; });
    api.single = api.maybeSingle = () => { modo = 'uno'; return api; };
    api.insert = api.update = api.upsert = api.delete = () => api;
    api.then = (resolve, reject) => Promise.resolve({
      data: modo === 'uno' ? (filas[0] || null) : filas,
      error: null, count: filas.length, status: 200
    }).then(resolve, reject);
    return api;
  }

  const sesion = {
    access_token: 'demo', token_type: 'bearer', expires_in: 3600,
    user: { id: UID, email: 'marco@sonidomarco.pe', user_metadata: { full_name: 'Sonido Marco · DJ & Luces', role: 'proveedor' } }
  };

  const CLIENTE_FALSO = {
    from: query,
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({ on: function () { return this; }, subscribe: function () { return this; } }),
    removeChannel: () => {},
    auth: {
      getSession: () => Promise.resolve({ data: { session: sesion }, error: null }),
      getUser: () => Promise.resolve({ data: { user: sesion.user }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'demo.jpg' }, error: null }),
        getPublicUrl: p => ({ data: { publicUrl: '' } }),
        remove: () => Promise.resolve({ error: null })
      })
    }
  };

  const falso = { createClient: () => CLIENTE_FALSO };
  // El <script> del CDN de supabase-js intentará escribir window.supabase;
  // el setter se lo traga para que siempre gane el cliente de demostración.
  Object.defineProperty(window, 'supabase', {
    configurable: true, get: () => falso, set: () => {}
  });
})();
