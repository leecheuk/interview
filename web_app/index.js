const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3002;

// serve html in public
app.use(express.static(path.join(__dirname, 'public')));
// for parsing body 
app.use(bodyParser.json());

app.get("/api", (req, res) => {
    res.set('Api-Version', '1.0.0');
    res.status(200).json({ data: "data" });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(PORT, () => {
    console.log(`App started: http://localhost:${PORT}`);
});
