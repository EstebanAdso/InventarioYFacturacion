const apiCategoriaGet = 'http://localhost:8082/categoria'
const apiCategoriaUpdate = 'http://localhost:8082/categoria/update/'
const apiCategoriaDelete = 'http://localhost:8082/categoria/delete/'
const tablaCategoria = document.getElementById('categoriaTableBody')
const modalCategoria = document.getElementById('categoriaModal')
const nombreCategoria = document.getElementById('nombreCategoria')
const descripcionCategoria = document.getElementById('descripcionCategoria')
const descripcionGarantia = document.getElementById('descripcionGarantia')
const categoriaIdInput = document.getElementById('categoriaId')
const categoriaForm = document.getElementById('categoriaForm')
const categoriaModalLabel = document.getElementById('categoriaModalLabel')

// Función para cargar las categorías
const cargarCategorias = async () => {
    try {
        tablaCategoria.innerHTML = '';
        const response = await fetch(apiCategoriaGet);
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



// Función para eliminar una categoría
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

// Función para editar una categoría
const editarCategoria = async (id) => {
    try {
        // Obtener los datos de la categoría
        const response = await fetch(`${apiCategoriaGet}/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener la categoría');
        }
        const categoria = await response.json();
        
        // Llenar el modal con los datos
        categoriaModalLabel.textContent = 'Editar Categoría';
        categoriaIdInput.value = id;
        nombreCategoria.value = categoria.nombre;
        descripcionCategoria.value = categoria.descripcion || '';
        descripcionGarantia.value = categoria.descripcionGarantia || '';
        
        // Mostrar el modal
        $('#categoriaModal').modal('show');
        
    } catch (error) {
        console.error('Error al editar la categoría:', error);
        alert('Error al cargar los datos de la categoría');
    }
}

// Función para guardar los cambios (crear o actualizar)
const guardarCategoria = async (e) => {
    e.preventDefault();
    
    const categoriaData = {
        nombre: nombreCategoria.value.toUpperCase().trim(),
        descripcion: descripcionCategoria.value.trim(),
        descripcionGarantia: descripcionGarantia.value.trim()
    };
    
    const id = categoriaIdInput.value;
    const url = id ? `${apiCategoriaUpdate}${id}` : apiCategoriaGet;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoriaData)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar la categoría');
        }
        
        // Cerrar el modal y recargar la tabla
        $('#categoriaModal').modal('hide');
        cargarCategorias();
        
        // Limpiar el formulario
        categoriaForm.reset();
        categoriaIdInput.value = '';
        
    } catch (error) {
        console.error('Error al guardar la categoría:', error);
        alert('Error al guardar la categoría');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    categoriaForm.addEventListener('submit', guardarCategoria);
});