const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT h.*, c.name as city FROM hospitals h LEFT JOIN cities c ON h.city_id = c.id ORDER BY h.name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all villages
router.get('/villages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT v.*, c.name as city FROM villages v LEFT JOIN cities c ON v.city_id = c.id ORDER BY v.name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all medicine types
router.get('/medicine-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medicine_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medicine types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all drones
router.get('/drones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drones ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching drones:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;