//REGISTRO DE USUARIO LOGIN
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// POST: Registro de usuario
router.post ('/register', async function (req, res, next){
    try {
    const { username, password } = req.body;

    // Generamos un salt y hash con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardamos en la base de datos
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
} catch (error) {
  console.log(error);
    res.status(500).json({ error: "Error en el registro", "description" :error.toString() });
}
});

// POST: Login de usuario
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;

    // Buscamos al usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    // Comparar la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

    // Generar un JWT para la sesión
// 1. Generamos el token (usamos una clave por defecto si no hay variable de entorno)
    const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET || 'clave_secreta_local', 
        { expiresIn: '7d' }
    );

    // 2. Detectamos el entorno automáticamente
    const isProduction = process.env.NODE_ENV === 'production';

    // 3. Configuramos la cookie "inteligente"
    res.cookie("habitToken", token, {
        httpOnly: true, // Más seguro: impide que scripts maliciosos vean el token
        secure: isProduction, // En Render será true (HTTPS), en tu PC será false
        sameSite: isProduction ? 'none' : 'lax', // En Render 'none' permite el cruce de datos
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
  
  res.json({ message: "Inicio de sesión exitoso", token });
} catch (error) {
    res.status(500).json({ error: "Error en el login", "description":error.toString() });
}
});

module.exports = router;