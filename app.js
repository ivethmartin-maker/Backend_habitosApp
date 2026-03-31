require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
const connectDB = require('./config/database'); 
connectDB(); 

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

// --- CORRECCIÓN DE CORS ---
app.use(cors({
  // Agregamos tu URL de Render para que el Backend le dé permiso
  origin: ['http://localhost:3000', 'https://frontend-habitosapp-fin.onrender.com'], 
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTA DE PRUEBA (Movida arriba del error 404) ---
app.get('/', (req, res) => {
  res.send('¡Servidor de Iveth funcionando correctamente en Render!');
});

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);

// Manejador de 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 4000; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;