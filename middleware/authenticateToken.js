import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.ACCESS_SECERT_KEY, (err, user) => {        
        if (err) return res.status(403).json({ error: "Invalid access token" });
        req.user = user;
        next();
    });
};

const authorizeRole = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
}


export  { authorizeRole, authenticateToken};
