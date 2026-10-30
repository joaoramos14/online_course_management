import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// =================
// Root
// =================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Online Course Management API",
        version: "1.0.0"
    });
});

// =================
// Users
// =================
// app.use("/users", userRoutes);


// =================
// Courses
// =================
// app.use("/courses", courseRoutes);


// =================
// Modules
// =================
// app.use("/modules", moduleRoutes);


// =================
// Contents
// =================
// app.use("/contents", contentRoutes);


// =================
// Reports
// =================
// app.use("/reports", reportRoutes);

export default app;
