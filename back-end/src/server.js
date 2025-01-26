import { preconnect } from "react-dom";
import viewEngin from "./config/viewEngine.js";
import initWebRoutes from "./routes/web.js";
require("dotenv").config();

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


viewEngine(app);
initWebRoutes(app);

let port = process.env.PORT || 6969;


app.listen(port, () => {
    console.log(`Backend is running on the port ${port}`);
});