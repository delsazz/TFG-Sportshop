import { getUsuarios } from './script_servicios.js';
import { request } from './script_api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const studentsBody = document.getElementById('studentsBody');
    const filterNombre = document.getElementById('filterNombre');
    const userCount = document.getElementById('userCount');
    const alertContainer = document.getElementById('alertContainer');

    let allUsuarios = [];

    async function loadData() {
        try {
            allUsuarios = await getUsuarios();
            renderStudents();
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderStudents() {
        const search = filterNombre.value.toLowerCase();
        const filtered = allUsuarios.filter(u => 
            `${u.nombre} ${u.apellidos}`.toLowerCase().includes(search) || 
            u.email.toLowerCase().includes(search)
        );

        userCount.textContent = `${filtered.length} alumnos`;

        studentsBody.innerHTML = filtered.map(u => `
            <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${u.nombre} ${u.apellidos}</div>
                    <div class="text-xs text-gray-500">${u.direccion || 'Sin dirección'}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${u.email}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${u.telefono || 'Sin teléfono'}</td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    ${u.roles && u.roles.length > 0 ? u.roles.map(r => r.nombreRol).join(', ') : 'Sin rol'}
                </td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button class="btn-delete rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100" data-id="${u.idUsuario}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
        });
    }

    async function deleteStudent(id) {
        if (!confirm('¿Seguro que quieres eliminar este alumno?')) return;
        try {
            await request(`/admin/usuarios/${id}`, { method: 'DELETE' });
            allUsuarios = allUsuarios.filter(u => u.idUsuario != id);
            renderStudents();
            showAlert('Alumno eliminado', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    filterNombre.addEventListener('input', renderStudents);

    function showAlert(message, color) {
        alertContainer.innerHTML = `
            <div class="rounded-lg border border-${color}-200 bg-${color}-50 px-4 py-3 text-sm text-${color}-700">
                ${message}
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    loadData();
});

