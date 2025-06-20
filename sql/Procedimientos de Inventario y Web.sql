
--  procedimiento de Inventario_dinamico
CREATE DEFINER=`root`@`localhost` PROCEDURE `SincronizarProductoDescripcion`()
 BEGIN
     -- Permitir actualizaciones seguras
     SET SQL_SAFE_UPDATES = 0;
 
     -- Paso 1: Insertar nuevos nombres en productoDescripcion
     -- Solo nombres distintos que no existan en productoDescripcion
     INSERT INTO productoDescripcion (nombre, descripcion)
     SELECT DISTINCT p.nombre, p.descripcion
     FROM producto p
     LEFT JOIN productoDescripcion pd ON p.nombre = pd.nombre
     WHERE pd.nombre IS NULL;
 
     -- Paso 2: Actualizar descripciones en productoDescripcion desde producto
     -- Solo si la descripción de producto no es nula o vacía
     UPDATE productoDescripcion pd
     INNER JOIN producto p ON pd.nombre = p.nombre
     SET pd.descripcion = p.descripcion
     WHERE p.descripcion IS NOT NULL AND p.descripcion != ''
           AND pd.descripcion != p.descripcion;
 
     -- Paso 3: Actualizar todas las filas en producto con descripción válida de productoDescripcion
     -- Si producto tiene una descripción nula o vacía, y productoDescripcion tiene una válida
     UPDATE producto p
     INNER JOIN productoDescripcion pd ON p.nombre = pd.nombre
     SET p.descripcion = pd.descripcion
     WHERE (p.descripcion IS NULL OR p.descripcion = '')
           AND pd.descripcion IS NOT NULL AND pd.descripcion != '';
 
     -- Restaurar actualizaciones seguras
     SET SQL_SAFE_UPDATES = 1;
 END
 
 
 
 -- Procedimiento de CompuServicesSoft
 CREATE DEFINER=`root`@`localhost` PROCEDURE `SincronizarInventario`()
 BEGIN
     SET SQL_SAFE_UPDATES = 0;
 
     -- Insertar nuevas categorías que no existen en CompuServicesSoft.categoria
     INSERT INTO CompuServicesSoft.categoria (id, nombre)
     SELECT c.id, c.nombre
     FROM inventario_dinamico.categoria c
     WHERE NOT EXISTS (
         SELECT 1 
         FROM CompuServicesSoft.categoria cs 
         WHERE cs.id = c.id
     );
     
       -- Paso 2: Actualizar descripciones en CompuServicesSoft.producto desde inventario_dinamico.producto
     -- Siempre actualizar la descripción con la de inventario_dinamico
     UPDATE CompuServicesSoft.producto p
     JOIN inventario_dinamico.producto i ON p.nombre = i.nombre
     SET 
         p.descripcion = i.descripcion;
 
     -- Eliminar productos duplicados en CompuServicesSoft.producto 
     -- manteniendo solo un producto activo con el mismo nombre
     DELETE p FROM CompuServicesSoft.producto p
     JOIN (
         SELECT 
             nombre,
             MIN(id) AS id_mantener
         FROM CompuServicesSoft.producto
         WHERE estado = 'activo'
         GROUP BY nombre
         HAVING COUNT(*) > 1
     ) sub ON p.nombre = sub.nombre 
         AND p.id != sub.id_mantener 
         AND p.estado = 'activo';
 
     -- Actualizar todos los datos de productos existentes
     UPDATE CompuServicesSoft.producto p
     JOIN inventario_dinamico.producto i ON p.id = i.id
     SET 
         p.nombre = i.nombre,
         p.precio_vendido = i.precio_vendido,
         p.cantidad = i.cantidad,
         p.total = i.total,
         p.descripcion = i.descripcion,
         p.categoria_id = i.categoria_id,
         p.estado = i.estado
     WHERE 
         p.nombre != i.nombre
         OR p.precio_vendido != i.precio_vendido
         OR p.cantidad != i.cantidad
         OR p.total != i.total
         OR p.descripcion != i.descripcion
         OR p.categoria_id != i.categoria_id
         OR p.estado != i.estado;
 
     -- Insertar nuevos productos que no existen en CompuServicesSoft.producto
     INSERT INTO CompuServicesSoft.producto (
         id, nombre, precio_vendido, cantidad, 
         total, descripcion, categoria_id, estado
     )
     SELECT 
         i.id, i.nombre, i.precio_vendido, i.cantidad, 
         i.total, i.descripcion, i.categoria_id, i.estado
     FROM inventario_dinamico.producto i
     WHERE NOT EXISTS (
         SELECT 1 
         FROM CompuServicesSoft.producto p 
         WHERE p.id = i.id
            OR (p.nombre = i.nombre AND p.estado = 'activo')
     );
 
     -- Actualizar o insertar en productoImagen
     INSERT INTO CompuServicesSoft.productoImagen (nombre_producto, ruta_imagen)
     SELECT DISTINCT p.nombre, p.imagen
     FROM CompuServicesSoft.producto p
     WHERE p.imagen IS NOT NULL AND p.imagen != ''
     ON DUPLICATE KEY UPDATE ruta_imagen = IFNULL(ruta_imagen, VALUES(ruta_imagen));
 
     -- Asignar imagen a productos desde productoImagen si no tienen una imagen
     UPDATE CompuServicesSoft.producto p
     JOIN CompuServicesSoft.productoImagen pi ON p.nombre = pi.nombre_producto
     SET p.imagen = pi.ruta_imagen
     WHERE p.imagen IS NULL OR p.imagen = '';
 
     -- Actualizar imagen en producto si es diferente a productoImagen.ruta_imagen
     UPDATE CompuServicesSoft.producto p
     JOIN CompuServicesSoft.productoImagen pi ON p.nombre = pi.nombre_producto
     SET p.imagen = pi.ruta_imagen
     WHERE p.imagen != pi.ruta_imagen AND p.imagen IS NOT NULL AND pi.ruta_imagen IS NOT NULL;
 
     -- Eliminar productos inactivos, sin existencia o no presentes en inventario principal
     DELETE FROM CompuServicesSoft.producto
     WHERE estado = 'inactivo' 
        OR cantidad <= 0;
 
     -- Asignar una imagen por defecto a los productos que no tienen una imagen
     UPDATE CompuServicesSoft.producto 
     SET imagen = '../imagenes/products/NE/NE.png'
     WHERE imagen IS NULL OR imagen = '';
 
     SET SQL_SAFE_UPDATES = 1;
 END