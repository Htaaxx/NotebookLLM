import express from 'express';

let router = express.Router();  

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.send("Hello World");
    });

    router.get("/about", (req, res) => {
        return res.send("About Page");
    });

    router.get("/crud", (req, res) => {
        return res.send("CRUD Page");
    });

    return app.use("/", router);
}

module.exports = initWebRoutes;