const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
 
  let token = req.header('Authorization') || req.cookies.habitToken;
  
  if (!token) {
      return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
      
      const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;
      const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
      req.user = verified; 
      next(); 
  } catch (error) {
      console.error("Error de JWT:", error.message);
      res.status(403).json({ error: "Token inválido o expirado" });
  }
};
router.get('/', function(req, res, next) { 
  res.render('index', { title: 'Express' });
});

/* GET habits */
router.get('/habits', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuario no identificado' });
    }
    const habits = await Habit.find({'userId': new mongoose.Types.ObjectId(req.user.userId)});
    res.json(habits);
  } catch(err) {
    console.error(err);
    res.status(500).json({message: 'Error retrieving habits' });
  }
});

/* POST habits */
router.post('/habits', authenticateToken, async (req, res) => {
  try { 
    let { title, description } = req.body;
    
    
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Token no contiene userId' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const habit = new Habit({ title, description, userId });
    
    await habit.save();
    res.json(habit);
  } catch(err) {
    console.error("Error al guardar hábito:", err);
    res.status(400).json({message: 'Error creating habit', detail: err.message });
  }
});

/* DELETE habits */
router.delete('/habits/:id', async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({massge: 'Habit deleted' });
  } catch(err) {
    res.status(500).json({message: 'Habit not found' });
  }
});

router.patch('/habits/markasdone/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Hábito no encontrado' });

    const ahora = new Date();
    
    if (habit.lastUpdate && new Date(habit.lastUpdate).toDateString() === ahora.toDateString()) {
      return res.status(400).json({ message: 'Ya completaste este hábito por hoy' });
    }
    const ultimaVez = habit.lastUpdate || habit.startedAt;
    const horasDiferencia = timeDifferenceInHours(ahora, ultimaVez);

    if (horasDiferencia < 48) {
      habit.days = (habit.days || 0) + 1;
    } else {
      habit.days = 1;
      habit.startedAt = ahora;
    }

    habit.lastDone = ahora;
    habit.lastUpdate = ahora;
    await habit.save();
    
    res.status(200).json({ 'message': 'Habit marked as done', days: habit.days });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

const timeDifferenceInHours = (date1, date2) => {
  const differenceMs = Math.abs(date1 - date2);
  return differenceMs / (1000 * 60 * 60);
}
const timeDifferenceInDays = (date1, date2) => {
  const differenceMs = Math.abs(date1 - date2);
  return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
}

module.exports = router;