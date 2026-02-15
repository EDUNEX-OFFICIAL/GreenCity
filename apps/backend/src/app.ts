import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import companyRoutes from "./routes/company.routes";
import onboardingRoutes from "./routes/onboarding.routes";

const app = express();

const allowedOrigins = [
    "localhost",
    "trycloudflare.com",

];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (Postman, curl)
            if (!origin) return callback(null, true);

            const isAllowed = allowedOrigins.some((allowed) =>
                origin.includes(allowed)
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());

// Session Configuration
import session from "express-session";
app.use(
    session({
        secret: process.env.SESSION_SECRET || "super-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // true in production
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    })
);

// Health Check
app.get("/", (req: Request, res: Response) => {
    res.send("Hello Jii from Server!");
});

// API Routes
app.use("/api", companyRoutes);

import adminCompanyRoutes from "./routes/admin.company.routes";

app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin/companies", adminCompanyRoutes);

app.use("/uploads", express.static("uploads"));


export default app;
