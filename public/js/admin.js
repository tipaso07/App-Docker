// ---- Sidebar navigation ----
document.querySelectorAll('.sidebar a[data-section]').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelectorAll('.sidebar a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-' + a.dataset.section).classList.add('active');
  });
});

// ---- PEDIDOS ----
async function cargarPedidos() {
  const pedidos = await apiFetch('/pedidos');
  const tbody = document.getElementById('pedidos-tbody');
  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td>${p.boleta.numeroBoleta}</td>
      <td>${p.clienteId?.nombre || 'N/A'}</td>
      <td>S/. ${p.boleta.montoTotal.toFixed(2)}</td>
      <td>${p.metodoPago}</td>
      <td>${new Date(p.fecha).toLocaleDateString()}</td>
      <td class="estado-${p.estado.replace(/\s/g, '\\ ')}">${p.estado}</td>
      <td>
        <select class="cambio-estado" data-id="${p._id}">
          <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Camino" ${p.estado === 'En Camino' ? 'selected' : ''}>En Camino</option>
          <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
          <option value="Cancelado" ${p.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.cambio-estado').forEach(sel => {
    sel.addEventListener('change', async () => {
      await apiFetch(`/pedidos/${sel.dataset.id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: sel.value })
      });
      cargarPedidos();
    });
  });
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
      const nuevoRol = prompt(`Nuevo rol para ${btn.dataset.nombre} (Admin/Cliente/Repartidor):`, btn.dataset.rol);
      if (nuevoRol && ['Admin', 'Cliente', 'Repartidor'].includes(nuevoRol)) {
        apiFetch(`/usuarios/${btn.dataset.id}`, {
          method: 'PUT',
          body: JSON.stringify({ rol: nuevoRol })
        }).then(cargarUsuarios);
      }
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

cargarPedidos();
cargarProductos();
cargarUsuarios();
