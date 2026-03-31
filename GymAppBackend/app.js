const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gym_pro'
});

db.connect(err => {
    if (err) {
        console.error('Blad polaczenia z bazą:', err);
        return;
    }
    console.log('Połaczono z baza MySQL!');
});

// POBIERANIE AKTUALNYCH ĆWICZEŃ
app.get('/exercises', (req, res) => {
    const sql = `
        SELECT e.id, e.name, e.sets, e.reps, e.category, l.weight, l.reps as actual_reps
        FROM exercises e
        LEFT JOIN logs l ON e.id = l.exercise_id
        WHERE e.is_archived = 0
        ORDER BY e.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/exercises/history', (req, res) => {
    const sql = "SELECT * FROM exercises WHERE is_archived = 1 ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// DODAWANIE ĆWICZENIA (POPRAWIONE - DODANO CATEGORY)
app.post('/exercises', (req, res) => {
    const { name, sets, reps, weight, category } = req.body;
    const sql1 = "INSERT INTO exercises (name, sets, reps, category, is_archived) VALUES (?, ?, ?, ?, 0)";

    // Ważne: musisz przekazać tyle samo parametrów co znaków zapytania (name, sets, reps, category)
    db.query(sql1, [name, sets, reps, category || 'Klatka'], (err, result) => {
        if (err) {
            console.error("Błąd INSERT exercises:", err);
            return res.status(500).json(err);
        }
        const newId = result.insertId;
        const sql2 = "INSERT INTO logs (exercise_id, weight, reps) VALUES (?, ?, ?)";
        db.query(sql2, [newId, weight, reps], (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ id: newId, name, sets, reps, weight, category });
        });
    });
});

// ZAKOŃCZENIE TRENINGU (ZOSTAWIONA JEDNA WERSJA)
app.post('/exercises/finish', (req, res) => {
    const sql = "UPDATE exercises SET is_archived = 1 WHERE is_archived = 0";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Trening przeniesiony do historii" });
    });
});

// AKTUALIZACJA
app.put('/exercises/:id', (req, res) => {
    const { id } = req.params;
    const { name, weight, sets, reps } = req.body;
    const sql1 = "UPDATE exercises SET name = ?, sets = ?, reps = ? WHERE id = ?";
    db.query(sql1, [name, sets, reps, id], (err) => {
        if (err) return res.status(500).json(err);
        const sql2 = "UPDATE logs SET weight = ?, reps = ? WHERE exercise_id = ?";
        db.query(sql2, [weight, reps, id], (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Zaktualizowano pomyślnie" });
        });
    });
});

// USUWANIE
app.delete('/exercises/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM exercises WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Usunieto" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});