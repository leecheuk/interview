const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002;

// serve html in public
app.use(express.static(path.join(__dirname, 'public')));

app.get("/api", (req, res) => {
    res.status(200).json({ data: "data" });
});

app.listen(PORT);
