import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware (optional)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      console.log(
        `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`
      );
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err, _, res, __) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({ message: err.message || "Server Error" });
  });

  const port = 5000;
  server.listen(port, "localhost", () =>
    console.log(`Node API running on http://localhost:${port}`)
  );
})();
