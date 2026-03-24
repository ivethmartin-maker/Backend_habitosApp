var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post ('/regsiter', async function (req,res, next){
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
    res.status(500).json({ error: "Error en el registro", "description":error.toString() });
}
});

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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('habitToken', token, {

      httpOnly: false, // Previene acceso desde JavaScript (XSS)
      secure: false, // Solo en HTTPS en producción
      sameSite: "lax", // Evita envío en otros sitios
      //secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      //sameSite: 'Strict', // Evita envío en otros sitios
      maxAge: 7 * (24) * 60 * 60 * 1000 // 7 días de duración
  });
    res.json({ message: "Inicio de sesión exitoso", token });
} catch (error) {
    res.status(500).json({ error: "Error en el login", "description":error.toString() });
}
});

module.exports = router;
