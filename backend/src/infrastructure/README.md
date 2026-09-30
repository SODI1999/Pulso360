# P10 · Infrastructure — Acceso a Datos y Servicios de Apoyo

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P10 · infrastructure`
* **Componente C4**: `C07 · Acceso a datos y auditoría`
* **Driver de Base de Datos**: `pg` (node-postgres con Pool de conexiones)

---

## 2. Responsabilidad de la Capa
Esta capa es la **única** responsable de:
1. Administrar el ciclo de vida del Pool de conexiones hacia PostgreSQL (`pulso360_db`).
2. Exponer métodos seguros de ejecución SQL parametrizada (`query(text, params)`).
3. Alojar los repositorios de datos (`infrastructure/repositories/`).

---

## 3. Reglas Inviolables
1. **Cero SQL fuera de Infrastructure**: Los controladores y servicios de la capa de aplicación jamás deben contener sentencias SQL.
2. **Prohibición de Concatenación de Cadenas**: Toda consulta debe usar parámetros posicionales (`$1, $2, ...`) para prevenir inyecciones SQL de forma absoluta.
3. **Manejo de Errores**: Todo error de base de datos capturado debe registrarse en el log del servidor y propagarse a la capa superior con mensajes limpios, sin filtrar credenciales ni detalles de infraestructura al cliente.
