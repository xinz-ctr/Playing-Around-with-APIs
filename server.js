const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/jobs", async (req, res) => {

    const q = req.query.q;
    const location = req.query.location || "";

    if (!q) {
        return res.status(400).json({
            error: "Job title is required."
        });
    }

    const url =
        `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}&api_key=${process.env.SERPAPI_KEY}`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        res.json(data);

    } catch (error) {

        res.status(500).json({
            error: "Unable to fetch jobs."
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});