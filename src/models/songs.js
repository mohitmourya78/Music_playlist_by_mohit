const mongoose = require("mongoose");

const songsSchema = new mongoose.Schema({

    title: String,
    artist: String,
    filePath: String,  
    albumCover: String,  
    folder: String,

})



const Songs = mongoose.model('Song', songsSchema);

module.exports = Songs;
