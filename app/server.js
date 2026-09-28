const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;

const dbConfig = {
    host: process.env.DB_HOST || "mysql",
    user: process.env.DB_USER || "cruduser",
    password: process.env.DB_PASSWORD || "crudpassword",
    database: process.env.DB_NAME || "cruddb",
    port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(dbConfig);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve UI
app.use(express.static(path.join(__dirname, "public")));


// =========================
// GET - Get all users
// =========================
app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM users ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});


// =========================
// POST - Create user
// =========================
app.post("/api/users", async (req, res) => {
    try {
        const { name, address, pin, fathername } = req.body;

        if (!name || !address || !pin || !fathername) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO users
            (name, address, pin, fathername)
            VALUES (?, ?, ?, ?)`,
            [name, address, pin, fathername]
        );

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
});


// =========================
// PUT - Update user
// =========================
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, pin, fathername } = req.body;

        const [result] = await pool.query(
            `UPDATE users
             SET name = ?,
                 address = ?,
                 pin = ?,
                 fathername = ?
             WHERE id = ?`,
            [name, address, pin, fathername, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
});


// =========================
// DELETE - Delete user
// =========================
app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
});


// =========================
// Start server
// =========================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});