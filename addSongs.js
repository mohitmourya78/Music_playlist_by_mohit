const fs = require("fs");

path = require("path");
const Song = require("./models/songs");

async function addSongs() {
  const songsDir = path.join(__dirname, "../songs");

  const folders = fs.readdirSync(songsDir);
  for (const folder of folders) {
    const folderPath = path.join(songsDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      const mp3Files = files.filter((file) => file.endsWith(".mp3"));
      const albumCover = files.find((file) =>
        file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png")
      );

      for (const mp3File of mp3Files) {
        const filePath = `/songs/${folder}/${mp3File}`;
        const coverPath = albumCover ? `/songs/${folder}/${albumCover}` : "";

        const newSong = new Song({
          title: mp3File.replace(".mp3", ""),
          artist: folder,
          filePath: filePath,
          albumCover: coverPath,
          folder: folder,
        });

        try {
          await newSong.save();
          console.log(`Added ${mp3File} to the database`);
        } catch (err) {
          console.error(`Error saving ${mp3File}:`, err);
        }
      }
    }
  }

  console.log("All songs added to the database.");
}

addSongs().catch((err) => console.error("Error adding songs:", err));


