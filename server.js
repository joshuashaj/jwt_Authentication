import express from "express";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, authorizeRole } from "./middleware/authenticateToken.js";

dotenv.config();
const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get("/", (req, res) => {
    res.send("Welcome to the DWAM NexWave 2.0 server Backend!");
});

app.post("/signup", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {
                userId: req.body.userId,
                name: req.body.name,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/stations", async (req, res) => {
    const { stationId, name, location, userId } = req.body;

    if (!stationId || !name || !location) {
        return res.status(400).json({ error: "stationId, name, and location are required" });
    }

    try {
        const station = await prisma.station.create({
            data: {
                stationId,
                name,
                location,
                user: userId ? { connect: { id: userId } } : undefined
            }
        });

        res.status(201).json({ message: "Station created successfully", station });
    } catch (error) {
        console.error("Error creating station:", error);

        if (error.code === "P2002") {
            return res.status(409).json({ error: "Station ID already exists" });
        }

        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/stations", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
    try {
        const stations = await prisma.station.findMany({
            where: { userId: req.user.id },
            include: { user: true }
        });
        res.json(stations);
    } catch (error) {
        console.error("Error fetching stations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


