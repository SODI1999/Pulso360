/**
 * Middleware para rutas no encontradas (404).
 * Devuelve un sobre de error con formato canónico SDD.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `La ruta '${req.method} ${req.originalUrl}' no existe en esta versión de la API.`,
      code: 'RESOURCE_NOT_FOUND'
    }
  });
};

/**
 * Middleware centralizado de captura y formateo de excepciones no controladas.
 * Garantiza respuestas semánticas y oculta detalles internos en errores de servidor (5xx).
 *
 * @param {Error & { statusCode?: number, code?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('[ServerError]', { code: err.code || 'INTERNAL_SERVER_ERROR', method: req.method, path: req.path });
  }
  res.status(status).json({
    success: false,
    error: {
      message: err.code === 'PASSWORD_RESET_UNAVAILABLE'
        ? 'La recuperación por correo no está disponible.'
        : status >= 500
          ? 'No se pudo completar la operación del servidor.'
          : err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  });
};

export default {
  notFoundHandler,
  errorHandler
};
