const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gym_pro'
});

db.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z bazą:', err);
    } else {
        console.log('Połączono z bazą danych MySQL!');
    }
});

app.get('/exercises', (req, res) => {
    db.query('SELECT * FROM exercises', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/exercises', (req, res) => {
    console.log("Otrzymano żądanie dodania:", req.body);
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Brak nazwy" });
    }

    const sql = "INSERT INTO exercises (name) VALUES (?)";
    db.query(sql, [name], (err, result) => {
        if (err) {
            console.error("Błąd bazy:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log("Dodano do bazy:", name);
        // ZAWSZE wysyłaj JSON, żeby telefon nie sypał błędem
        res.status(201).json({ success: true, id: result.insertId });
    });
});

app.delete('/exercises/:id', (req, res) => {
    const { id } = req.params;
    console.log(`ZADANIE USUNIECIA ID: ${id}`);
    const sql = "DELETE FROM exercises WHERE id = ?";
    // blond essa hat
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("blad usuwania")
        }
            return res.status(500).json(err);
        res.json({ message: "Usunięto ćwiczenie" });
    });
});

app.listen(3000, () => {
    console.log('Serwer API działa na porcie 3000');
});