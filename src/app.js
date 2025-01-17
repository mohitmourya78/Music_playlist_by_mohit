require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Song = require("./models/songs");  // Make sure you have this model defined

const port = 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
  });

// Middleware to serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "../public")));

// Serve song files
app.use("/songs", express.static(path.join(__dirname, "../songs")));

app.use("/img", express.static(path.join(__dirname, "img")));

// Body parser middleware
app.use(express.json());

// Route to fetch song data from the database
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).send("Error fetching songs: " + err);
  }
});

// Route to fetch songs from a specific folder (for the frontend)
app.get("/songs/:folder", (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, "../songs", folder);

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading the folder");
    }

    const mp3Files = files.filter((file) => file.endsWith(".mp3"));
    const albumCover = files.find((file) =>
      file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png")
  );

  res.json({ songs: mp3Files, albumCover: albumCover ? `/songs/${folder}/${albumCover}` : null });
  });
});

// Serve the homepage (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



/*public
......>css
......>js
.........>script.js
......>index.html

songs
......>all(folder)
.........>song1.mp3
......>hindi(folder)
........>song1.mp3
......>karan_aujla(folder)
........>song1.mp3
......>raju_punjabi(folder)
........>song1.mp3
......>shubh(folder)
........>song1.mp3

src

.......>db(folder)
..........>connect.js
.......>models(folder)
...........>songs.js(schema)
.......>app.js


addsongs.js
.env
package.json*/

