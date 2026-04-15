# Inventario y Facturación — Gestión Total

Sistema web de gestión empresarial que integra inventario, facturación, préstamos, pedidos, clientes y activos en una sola aplicación.

## ¿Qué es este proyecto?

**Gestión Total** es una aplicación de escritorio/web diseñada para pequeñas y medianas empresas que necesitan controlar sus operaciones comerciales desde un único lugar. Cuenta con un **backend REST** desarrollado en Spring Boot y un **frontend** en HTML/CSS/JavaScript puro con Bootstrap.

## Funcionalidades principales

| Módulo | Descripción |
|---|---|
| **Inventario** | Gestión de productos con categorías, precios de compra/venta, precio mayoreo, garantía y alertas de stock |
| **Facturación** | Creación y consulta de facturas con detalle de productos vendidos |
| **Ventas** | Historial y seguimiento de ventas realizadas |
| **Préstamos** | Registro de préstamos de productos con control de abonos y devoluciones |
| **Pedidos** | Gestión de pedidos a proveedores |
| **Activos** | Control de activos fijos de la empresa |
| **Clientes** | Administración del directorio de clientes |
| **Códigos de barras** | Escaneo y generación/impresión de códigos de barras por producto |
| **Configuración** | Ajustes generales del sistema y categorías |

## Tecnologías utilizadas

### Backend
- **Java 17**
- **Spring Boot 3.3** (Spring Web, Spring Data JPA, Thymeleaf)
- **MySQL** — base de datos `inventario_dinamico`
- **Lombok**
- **Maven**

### Frontend
- **HTML5 / CSS3 / JavaScript** (vanilla)
- **Bootstrap 4**
- **jQuery**
- **jsPDF** — generación de PDFs para facturas y códigos de barras

## Estructura del proyecto

```
InventarioYFacturacion/
├── BackendInventario/          # API REST en Spring Boot
│   └── src/main/java/
│       ├── controller/         # Endpoints REST (Producto, Factura, Cliente, etc.)
│       ├── entities/           # Modelos JPA y DTOs
│       ├── repositories/       # Repositorios Spring Data
│       └── services/           # Lógica de negocio
└── FrontedInventario/          # Interfaz de usuario
    ├── html/                   # Páginas: index, facturacion, ventas, prestamos…
    ├── css/                    # Estilos y recursos gráficos
    └── js/                     # Scripts por módulo
```

## Requisitos previos

- Java 17+
- Maven 3.8+
- MySQL 8+ con una base de datos llamada `inventario_dinamico`

## Configuración y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/estebanadso/inventarioyfacturacion.git
   cd InventarioYFacturacion
   ```

2. **Configurar la base de datos** en `BackendInventario/src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/inventario_dinamico
   spring.datasource.username=root
   spring.datasource.password=tu_contraseña
   ```

3. **Ejecutar el backend**
   ```bash
   cd BackendInventario
   ./mvnw spring-boot:run
   ```
   El servidor arranca en `http://localhost:8082`

4. **Abrir el frontend**
   Abre `FrontedInventario/html/index.html` directamente en el navegador o sírvelo con cualquier servidor estático.

## API REST — Endpoints principales

| Recurso | Ruta base |
|---|---|
| Productos | `/api/productos` |
| Categorías | `/api/categorias` |
| Facturas | `/api/facturas` |
| Clientes | `/api/clientes` |
| Préstamos | `/api/prestamos` |
| Pedidos | `/api/pedidos` |
| Activos | `/api/activos` |
| Códigos de barras | `/api/codigos` |
