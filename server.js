require("dotenv").config();

const app = require("./src/app");
const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
