// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // A veces el error viene con un código de estado, si no, es un 500 (Error del Servidor)
  const statusCode = res.statusCode ? res.statusCode : 500;

  // --- ¡ESTE ES EL LOG DEFINITIVO! ---
  // Imprimimos el error completo en la consola del backend de una forma legible
  console.error("\n\n--- ERROR GLOBAL CAPTURADO ---\n");
  console.error("Mensaje:", err.message);
  console.error("Stack:", err.stack);
  console.error("--- FIN DEL ERROR ---\n\n");

  res.status(statusCode);

  // Enviamos una respuesta JSON clara al frontend
  res.json({
    message: err.message,
    // En desarrollo, podemos enviar el stack trace para depurar en el frontend también
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};