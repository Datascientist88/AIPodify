class Player {
    constructor(songs) {
        // --- DOM Element Selection ---
        this.player = document.querySelector(".c-player");
        this.cd = document.querySelector(".c-player__cd");
        this.cdThumb = document.querySelector(".c-player__cd-thumb");
        this.playingNowH2 = document.querySelector("#js-playing-now h2");
        this.songDuration = document.querySelector('#js-duration-song');
        this.audio = document.querySelector("#js-player-audio");
        this.playList = document.querySelector(".c-player__playlist");

        // Controls
        this.playBtn = document.querySelector(".btn-toggle-play");
        this.nextBtn = document.querySelector(".btn-next");
        this.prevBtn = document.querySelector(".btn-prev");
        this.randomBtn = document.querySelector(".btn-random");
        this.repeatBtn = document.querySelector(".btn-repeat");
        this.progress = document.querySelector(".c-player__progress-bar");
        this.themeToggle = document.querySelector('#theme-toggle');

        // --- Player State ---
        this.songs = songs;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isRandom = false;
        this.isRepeat = false;
        this.playedIndexes = new Set(); // Used for smarter random logic

        // Initialize CD rotation animation
        this.cdThumbAnimate = this.cdThumb.animate(
            [{ transform: "rotate(360deg)" }], 
            { duration: 10000, iterations: Infinity }
        );
        this.cdThumbAnimate.pause();
    }

    // --- Core Methods ---
    
    // Getter for the current song object
    get currentSong() {
        return this.songs[this.currentIndex];
    }

    start() {
        this._renderSongs();
        this._bindEvents();
        this.loadCurrentSong();
    }

    loadCurrentSong() {
        const { name, image, path, duration, index } = this.currentSong;

        this.playingNowH2.textContent = `${index}. ${name}`;
        this.songDuration.textContent = duration;
        this.cdThumb.style.backgroundImage = `url('${image}')`;
        this.audio.src = path;
        
        this._updateActiveSongInPlaylist();
        this._scrollToActiveSong();
    }

    nextSong() {
        if (this.isRandom) {
            this._playRandomSong();
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.songs.length;
        }
        this.loadCurrentSong();
    }
    
    prevSong() {
        if (this.isRandom) {
            this._playRandomSong();
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        }
        this.loadCurrentSong();
    }

    // --- Private Helper Methods ---

    _renderSongs() {
        const htmls = this.songs.map((song, index) => `
            <div class="c-player__song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                <div class="c-player__song-number">${song.index}</div>
                <div class="c-player__song-infos">
                    <h3 class="c-player__song-title">${song.name}</h3>
                    <p class="c-player__song-author">${song.singer}</p>
                </div>
                <div class="c-player__song-duration">${song.duration}</div>
            </div>
        `).join("");
        this.playList.innerHTML = htmls;
    }

    _bindEvents() {
        const cdWidth = this.cd.offsetWidth;

        // Animate CD shrinking on scroll
        document.onscroll = () => {
            const scrollHeight = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = Math.max(0, cdWidth - scrollHeight);
            this.cd.style.width = `${newCdWidth}px`;
            this.cd.style.opacity = newCdWidth / cdWidth;
        };

        // Play/Pause button
        this.playBtn.onclick = () => {
            this.isPlaying ? this.audio.pause() : this.audio.play();
        };
        
        // Audio element events
        this.audio.onplay = () => {
            this.isPlaying = true;
            this.player.classList.add("playing");
            this.cdThumbAnimate.play();
        };
        this.audio.onpause = () => {
            this.isPlaying = false;
            this.player.classList.remove("playing");
            this.cdThumbAnimate.pause();
        };
        this.audio.ontimeupdate = () => {
            if (this.audio.duration) {
                this.progress.value = (this.audio.currentTime / this.audio.duration) * 100;
            }
        };
        this.audio.onended = () => {
            this.isRepeat ? this.audio.play() : this.nextBtn.click();
        };

        // Seek progress bar
        this.progress.oninput = (e) => {
            const seekTime = (e.target.value * this.audio.duration) / 100;
            this.audio.currentTime = seekTime;
        };

        // Next/Prev buttons
        this.nextBtn.onclick = () => {
            this.nextSong();
            this.audio.play();
        };
        this.prevBtn.onclick = () => {
            this.prevSong();
            this.audio.play();
        };
        
        // Random/Repeat buttons
        this.randomBtn.onclick = () => {
            this.isRandom = !this.isRandom;
            this.randomBtn.classList.toggle("active", this.isRandom);
            if(this.isRandom) this.playedIndexes.add(this.currentIndex); // Start with current song
        };
        this.repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat;
            this.repeatBtn.classList.toggle("active", this.isRepeat);
        };
        
        // Playlist click
        this.playList.onclick = (e) => {
            const songNode = e.target.closest(".c-player__song:not(.active)");
            if (songNode && !e.target.closest(".c-player__song-duration")) {
                this.currentIndex = Number(songNode.dataset.index);
                this.loadCurrentSong();
                this.audio.play();
            }
        };

        // Theme Toggle
        this.themeToggle.onclick = () => {
            document.body.classList.toggle('dark-theme');
        };
    }

    _playRandomSong() {
        if (this.playedIndexes.size === this.songs.length) {
            this.playedIndexes.clear(); // Reset if all songs have been played
        }
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedIndexes.has(newIndex));
        
        this.currentIndex = newIndex;
        this.playedIndexes.add(newIndex);
    }
    
    _updateActiveSongInPlaylist() {
        const oldActiveSong = this.playList.querySelector(".c-player__song.active");
        if (oldActiveSong) oldActiveSong.classList.remove("active");

        const newActiveSong = this.playList.querySelector(`.c-player__song[data-index="${this.currentIndex}"]`);
        if (newActiveSong) newActiveSong.classList.add("active");
    }

    _scrollToActiveSong() {
        setTimeout(() => {
            const activeSong = this.playList.querySelector(".c-player__song.active");
            if (activeSong) {
                activeSong.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        }, 300);
    }
}

// --- Data & Initialization ---
const songsData = [
    { index: 1, name: "Emulating Genius for Superintelligence", singer: "Mohammed Bahageel", duration: "10:55", image: "images/asi.gif", path: "Audio/asi.wav" },
    { index: 2, name: "Detecting AI Agent Misbehavior", singer: "Mohammed Bahageel", duration: "19:37", image: "images/origin.gif", path: "Audio/deviant.wav" },
    { index: 3, name: "Craking Medical Mysteries", singer: "Mohammed Bahageel", duration: "13:33", image: "images/giphy.gif", path: "Audio/bacteria.wav" },
    { index: 4, name: "Understanding the Controversy", singer: "Mohammed Bahageel", duration: "10:49", image: "images/Nobel_Prize.png", path: "Audio/Noble prize 1.wav" },
    { index: 5, name: "Emotional Intelligence & AI", singer: "Mohammed Bahageel", duration: "10:48", image: "images/AIEQ.jpg", path: "Audio/Incorporating emotional intelligence in AI Models.wav" },
    { index: 6, name: "Unveiling the Human Among AI Models", singer: "Mohammed Bahageel", duration: "5:55", image: "images/reverse-turing-test.jpg", path: "Audio/Unveiling the Human Among AI Models.wav" },
    { index: 7, name: "The Gradual Path to AGI", singer: "Mohammed Bahageel", duration: "8:17", image: "images/AGI.jpg", path: "Audio/The Gradual Path to AGI Step-by-Step Improvements in AI Intelligence.wav" },
    { index: 8, name: "AI Training Conundrum", singer: "Mohammed Bahageel", duration: "15:28", image: "images/AI Training Conundrum.gif", path: "Audio/AI Training Conundrum.wav" },
    { index: 9, name: "Demystifying Devin AI Augmentation", singer: "Mohammed Bahageel", duration: "8:37", image: "images/devin.gif", path: "Audio/Demystifying Devin How AI Augments, Not Replaces, Software Engineers.wav" },
    { index: 10, name: "Q Star AI Reasoning Capabilities", singer: "Mohammed Bahageel", duration: "5:36", image: "images/AIq.jpeg", path: "Audio/Q-star Reasoning Capabilities.wav" },
    { index: 11, name: "Vector Embedding Databases", singer: "Mohammed Bahageel", duration: "8:27", image: "images/egai.png", path: "Audio/Unlocking the Power of Vector Embedding Databases.wav" },
    { index: 12, name: "The Epitome of Multimodality", singer: "Mohammed Bahageel", duration: "7:12", image: "images/gemini.jpg", path: "Audio/THE EPITOME OF MULTIMODALITY.wav" },
    { index: 13, name: "Revolutionizing Healthcare AI Medical Imaging", singer: "Mohammed Bahageel", duration: "8:18", image: "images/monai.gif", path: "Audio/Revolutionizing Healthcare AI, Deep Learning, and MONAI in Medical Imaging.wav" },
    { index: 14, name: "Advancing Machine Learning", singer: "Mohammed Bahageel", duration: "9:37", image: "images/ML.jpg", path: "Audio/Advancing Machine Learning.wav" },
    { index: 15, name: "Frontend Development for Data Visualization", singer: "Mohammed Bahageel", duration: "7:50", image: "images/dataviz.gif", path: "Audio/Front-End Development in Data Visualization.wav" },
    { index: 16, name: "The Era of Continuously Learning Analytic Assets", singer: "Mohammed Bahageel", duration: "5:32", image: "images/EQ.gif", path: "Audio/The Era of Continuously Learning Analytic Assets.wav" },
];

// Create a new instance of the Player and start it
new Player(songsData).start();