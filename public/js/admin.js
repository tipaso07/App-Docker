// ---- Sidebar ----
document.querySelectorAll('.sidebar a[data-section]').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelectorAll('.sidebar a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-' + a.dataset.section).classList.add('active');
  });
});

// ---- Toast ----
function mostrarToast(mensaje, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Modal util ----
function abrirModal(id) { document.getElementById(id).classList.remove('hidden'); }
function cerrarModal(id) { document.getElementById(id).classList.add('hidden'); }

// ---- PEDIDOS ----
async function cargarPedidos() {
  const pedidos = await apiFetch('/pedidos');
  const tbody = document.getElementById('pedidos-tbody');
  tbody.innerHTML = pedidos.map(p => {
    let btnHtml = '';
    if (p.estado === 'Pendiente') {
      btnHtml = `<button class="btn-estado pendiente" onclick="cambiarEstado('${p._id}','En Camino')">→ En Camino</button>`;
    } else if (p.estado === 'En Camino') {
      btnHtml = `<button class="btn-estado en-camino" onclick="cambiarEstado('${p._id}','Entregado')">→ Entregado</button>`;
    } else if (p.estado === 'Entregado') {
      btnHtml = `<button class="btn-estado entregado" disabled>✓ Entregado</button>`;
    } else {
      btnHtml = `<span style="color:#a0aec0;font-size:13px;">${p.estado}</span>`;
    }
    return `
      <tr>
        <td>${p.boleta.numeroBoleta}</td>
        <td>${p.clienteId?.nombre || 'N/A'}</td>
        <td>${p.repartidorId?.nombre || 'Sin asignar'}</td>
        <td>S/. ${p.boleta.montoTotal.toFixed(2)}</td>
        <td>${p.metodoPago}</td>
        <td>${new Date(p.fecha).toLocaleDateString()}</td>
        <td class="estado-${p.estado.replace(/\s/g, '\\ ')}">${p.estado}</td>
        <td>${btnHtml}</td>
      </tr>
    `;
  }).join('');
}

async function cambiarEstado(id, nuevoEstado) {
  await apiFetch(`/pedidos/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado: nuevoEstado })
  });
  cargarPedidos();
}

// ---- INVENTARIO ----
async function cargarProductos() {
  const productos = await apiFetch('/productos');
  const tbody = document.getElementById('productos-tbody');
  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>S/. ${p.precio.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.valoracion}</td>
      <td>
        <button class="btn-editar-prod" data-id="${p._id}" data-nombre="${p.nombre}" data-precio="${p.precio}" data-stock="${p.stock}" data-categoria="${p.categoria}" data-valoracion="${p.valoracion}" data-descripcion="${p.descripcion}">Editar</button>
        <button class="btn-eliminar-prod danger" data-id="${p._id}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-editar-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('prod-nombre').value = btn.dataset.nombre;
      document.getElementById('prod-precio').value = btn.dataset.precio;
      document.getElementById('prod-stock').value = btn.dataset.stock;
      document.getElementById('prod-categoria').value = btn.dataset.categoria;
      document.getElementById('prod-valoracion').value = btn.dataset.valoracion;
      document.getElementById('prod-descripcion').value = btn.dataset.descripcion;
      document.getElementById('btn-guardar-producto').textContent = 'Actualizar';
      document.getElementById('btn-guardar-producto').dataset.editId = btn.dataset.id;
    });
  });

  document.querySelectorAll('.btn-eliminar-prod').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este producto?')) {
        await apiFetch(`/productos/${btn.dataset.id}`, { method: 'DELETE' });
        cargarProductos();
      }
    });
  });
}

document.getElementById('btn-guardar-producto').addEventListener('click', async () => {
  const data = {
    nombre: document.getElementById('prod-nombre').value,
    precio: parseFloat(document.getElementById('prod-precio').value),
    stock: parseInt(document.getElementById('prod-stock').value),
    categoria: document.getElementById('prod-categoria').value,
    valoracion: parseFloat(document.getElementById('prod-valoracion').value) || 0,
    descripcion: document.getElementById('prod-descripcion').value
  };
  const editId = document.getElementById('btn-guardar-producto').dataset.editId;
  if (editId) {
    await apiFetch(`/productos/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
    document.getElementById('btn-guardar-producto').textContent = 'Agregar';
    delete document.getElementById('btn-guardar-producto').dataset.editId;
  } else {
    await apiFetch('/productos', { method: 'POST', body: JSON.stringify(data) });
  }
  document.querySelectorAll('#producto-form input').forEach(i => i.value = '');
  cargarProductos();
});

// ---- USUARIOS ----
async function cargarUsuarios() {
  const usuarios = await apiFetch('/usuarios');
  const tbody = document.getElementById('usuarios-tbody');
  tbody.innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.rol}</td>
      <td>${new Date(u.fechaRegistro).toLocaleDateString()}</td>
      <td>
        <button class="btn-editar-user" data-id="${u._id}" data-nombre="${u.nombre}" data-email="${u.email}" data-rol="${u.rol}">Editar</button>
        <button class="btn-eliminar-user danger" data-id="${u._id}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-editar-user').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('edit-user-id').value = btn.dataset.id;
      document.getElementById('edit-user-nombre').value = btn.dataset.nombre;
      document.getElementById('edit-user-email').value = btn.dataset.email;
      document.getElementById('edit-user-rol').value = btn.dataset.rol;
      document.getElementById('edit-user-password').value = '';
      abrirModal('modal-editar-usuario');
    });
  });

  document.querySelectorAll('.btn-eliminar-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm(`¿Eliminar a ${btn.dataset.nombre}?`)) {
        await apiFetch(`/usuarios/${btn.dataset.id}`, { method: 'DELETE' });
        cargarUsuarios();
      }
    });
  });
}

document.getElementById('btn-guardar-usuario').addEventListener('click', async () => {
  const id = document.getElementById('edit-user-id').value;
  const data = {
    nombre: document.getElementById('edit-user-nombre').value,
    email: document.getElementById('edit-user-email').value,
    rol: document.getElementById('edit-user-rol').value,
  };
  const password = document.getElementById('edit-user-password').value;
  if (password) data.password = password;

  await apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  cerrarModal('modal-editar-usuario');
  cargarUsuarios();
});

cargarPedidos();
cargarProductos();
cargarUsuarios();
