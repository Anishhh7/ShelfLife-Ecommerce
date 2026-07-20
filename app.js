import expres from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config({ path: "./Config/config.env" });

const app = expres();
app.set("query parser", "extended");

app.use(expres.json());

if (process.env.NODE_ENV === "development") {
 app.use(morgan("dev"));
}

app.use((req, res, next) => {
 next();
});

app.all("/{*path}", (req, res, next) => {
 next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

export default app;
