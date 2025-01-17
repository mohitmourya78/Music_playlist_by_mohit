console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder;
let currentIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    try {
        const response = await fetch(`/api/songs?folder=${folder}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const songsData = await response.json();
        songs = songsData.map(song => song.filePath.split(`/songs/`)[1]);
        // ...
    } catch (error) {
        console.error('Failed to fetch songs:', error);
        alert('Failed to fetch songs. Please check the server connection.');
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Artist Name</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

const togglePlayPause = () => {
    if (currentSong.paused) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    } else {
        currentSong.pause();
        document.querySelector("#play").src = "img/play.svg";
    }
};

// Listen for the Spacebar key press to toggle play/pause
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        togglePlayPause();
    }
});




async function displayAlbums() {
    const response = await fetch(`/songs/`);
    const folderList = await response.text();
    const div = document.createElement("div");
    div.innerHTML = folderList;
    const anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".cardContainer");
    const array = Array.from(anchors);

    for (const e of array) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];

            const albumInfo = await fetch(`/songs/${folder}/info.json`);
            const albumData = await albumInfo.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${albumData.title}</h2>
                    <p>${albumData.description}</p>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        /*addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });*/
    });
}

let track;

console.log(`currFolder: ${currFolder}, track: ${track}`);
console.log(`Full URL: /${currFolder}/${track}`);

async function main() {
    await getSongs("songs/all");
    playMusic(songs[0], true);

    await displayAlbums();

    const playButton = document.getElementById("play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        const volumeIcon = document.querySelector(".volume img");
        if (currentSong.volume === 0) {
            volumeIcon.src = "img/mute.svg";
        } else {
            volumeIcon.src = "img/volume.svg";
        }
    });

    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
            e.target.src = "img/volume.svg";
        }
    });



 currentSong.addEventListener("ended", () => {
    playNextSong();
});

document.getElementById("previous").addEventListener("click", playPreviousSong);
document.getElementById("next").addEventListener("click", playNextSong);

}

const playPreviousSong = () => {
if (currentIndex > 0) {
    currentIndex--;
} else {
    currentIndex = songs.length - 1;  
}
playMusic(songs[currentIndex]);
};

const playNextSong = () => {
if (currentIndex < songs.length - 1) {
    currentIndex++;
} else {
    currentIndex = 0;  
}
playMusic(songs[currentIndex]);
};


main();


// Get the elements
const hamburger = document.querySelector('.hamburger');
const leftSidebar = document.querySelector('.left');
const closeButton = document.querySelector('.close');

// Toggle the left sidebar when the hamburger icon is clicked
hamburger.addEventListener('click', () => {
    leftSidebar.style.left = '0';  // Show the left sidebar by setting it to visible
});

// Close the left sidebar when the close button is clicked
closeButton.addEventListener('click', () => {
    leftSidebar.style.left = '-130%';  // Hide the left sidebar by moving it off-screen
});
