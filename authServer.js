import express from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
app.use(express.json());
const prisma = new PrismaClient();

const refreshTokens = [];

app.get("/", (req, res) => {
    res.send("Welcome to the DWAM NexWave 2.0 AuthServer Backend!");
});

const genrateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role
    }, process.env.ACCESS_SECERT_KEY, { expiresIn: '30s' });
}

app.post("/login", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userId: req.body.userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = genrateAccessToken(user);
        const refreshToken = jwt.sign({
            id: user.id,
            userId: user.userId,
            name: user.name,
            role: user.role
        }, process.env.REFRESH_SECERT_KEY);

        refreshTokens.push(refreshToken);
        res.json({ accessToken, refreshToken });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.status(401);
    if (!refreshTokens.includes(refreshToken)) return res.status(403);

    jwt.verify(refreshToken, process.env.REFRESH_SECERT_KEY, (err, user) => {
        if (err) return res.status(403);
        const newAccessToken = genrateAccessToken({
            id: user.id,
            userId: user.userId,
            name: user.name,
            role: user.role
        });
        res.json({ accessToken: newAccessToken });
    });
});

app.delete("/logout", (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
});

const PORT = process.env.PORT2;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
