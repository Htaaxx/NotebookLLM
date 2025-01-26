import express from "express";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.send("Hello World");
    });

    router.get("/about", (req, res) => {
        return res.send("About Page");
    });

    return app.use("/", router);
}

export default initWebRoutes;
