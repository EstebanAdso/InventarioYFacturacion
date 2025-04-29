const apiCategoria = 'http://localhost:8082/categoria'
const apiCategoriaUpdate = 'http://localhost:8082/categoria/update/'
const apiCategoriaDelete = 'http://localhost:8082/categoria/delete/'
const tablaCategoria = document.getElementById('categoriaTableBody')
const modalEditarCategoria = document.getElementById('editarCategoria')

const cargarCategorias = async () => {
    try {
        tablaCategoria.innerHTML = '';
        const response = await fetch(apiCategoria);
        const categorias = await response.json();
        
        categorias.forEach(categoria => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || 'No tiene'}</td>
                <td>
                    <button class="btn btn-success" onclick="editarCategoria(${categoria.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarCategoria(${categoria.id})">Eliminar</button>
                </td>
            `;
            tablaCategoria.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
    }
}

const eliminarCategoria = async (id) => {
    try {
        const response = await fetch(`${apiCategoriaDelete}${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar la categoría');
        }
        mostrarConfirmacionDinamica({
            mensaje: 'Si eliminas una categoria, perderas todos los productos que pertenecen a ella. ¿Deseas continuar?',
            onAceptar: () => {cargarCategorias()},
            onCancelar: () => {},
            textoAceptar: 'Aceptar',
            textoCancelar: 'Volver'
        });
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});
