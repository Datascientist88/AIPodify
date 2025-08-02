class Player {
  constructor(songs) {
    this.player = document.querySelector(".c-player");
    this.canvas = document.querySelector("#waveCanvas");
    this.playingNowH2 = document.querySelector("#js-playing-now h2");
    this.songDuration = document.querySelector("#js-duration-song");
    this.audio = document.querySelector("#js-player-audio");
    this.playList = document.querySelector(".c-player__playlist");

    this.playBtn = document.querySelector(".btn-toggle-play");
    this.nextBtn = document.querySelector(".btn-next");
    this.prevBtn = document.querySelector(".btn-prev");
    this.randomBtn = document.querySelector(".btn-random");
    this.repeatBtn = document.querySelector(".btn-repeat");
    this.progress = document.querySelector(".c-player__progress-bar");
    this.themeToggle = document.querySelector("#theme-toggle");

    this.songs = songs;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isRandom = false;
    this.isRepeat = false;
    this.playedIndexes = new Set();

    this.audioContext = null;
    this.analyser = null;
    this.animationId = null;
    this.visualizerInitialized = false;
  }

  get currentSong() {
    return this.songs[this.currentIndex];
  }

  start() {
    this._renderSongs();
    this._bindEvents();
    this.loadCurrentSong();
  }

  loadCurrentSong() {
    const { name, path, duration, index } = this.currentSong;
    this.playingNowH2.textContent = `${index}. ${name}`;
    this.songDuration.textContent = duration;
    this.audio.src = path;

    this._updateActiveSongInPlaylist();
    this._scrollToActiveSong();
  }

  nextSong() {
    this.currentIndex = this.isRandom
      ? this._getRandomIndex()
      : (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
  }

  prevSong() {
    this.currentIndex = this.isRandom
      ? this._getRandomIndex()
      : (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
  }

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

    this.playList.style.maxHeight = "300px";
    this.playList.style.overflowY = "auto";
  }

  _bindEvents() {
    this.playBtn.onclick = () => {
      this.isPlaying ? this.audio.pause() : this.audio.play();
    };

    this.audio.onplay = () => {
      this.isPlaying = true;
      this.player.classList.add("playing");
      this._initWaveVisualizer(); // re-init visualizer on resume
    };

    this.audio.onpause = () => {
      this.isPlaying = false;
      this.player.classList.remove("playing");
      cancelAnimationFrame(this.animationId);
    };

    this.audio.ontimeupdate = () => {
      if (this.audio.duration) {
        this.progress.value = (this.audio.currentTime / this.audio.duration) * 100;
      }
    };

    this.audio.onended = () => {
      this.isRepeat ? this.audio.play() : this.nextBtn.click();
    };

    this.progress.oninput = (e) => {
      const seekTime = (e.target.value * this.audio.duration) / 100;
      this.audio.currentTime = seekTime;
    };

    this.nextBtn.onclick = () => {
      this.nextSong();
      this.audio.play();
    };

    this.prevBtn.onclick = () => {
      this.prevSong();
      this.audio.play();
    };

    this.randomBtn.onclick = () => {
      this.isRandom = !this.isRandom;
      this.randomBtn.classList.toggle("active", this.isRandom);
      if (this.isRandom) this.playedIndexes.add(this.currentIndex);
    };

    this.repeatBtn.onclick = () => {
      this.isRepeat = !this.isRepeat;
      this.repeatBtn.classList.toggle("active", this.isRepeat);
    };

    this.playList.onclick = (e) => {
      const songNode = e.target.closest(".c-player__song:not(.active)");
      if (songNode && !e.target.closest(".c-player__song-duration")) {
        this.currentIndex = Number(songNode.dataset.index);
        this.loadCurrentSong();
        this.audio.play();
      }
    };

    this.themeToggle.onclick = () => {
      document.body.classList.toggle("dark-theme");
    };
  }

  _getRandomIndex() {
    if (this.playedIndexes.size === this.songs.length) this.playedIndexes.clear();
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.playedIndexes.has(newIndex));
    this.playedIndexes.add(newIndex);
    return newIndex;
  }

  _updateActiveSongInPlaylist() {
    const oldActive = this.playList.querySelector(".c-player__song.active");
    if (oldActive) oldActive.classList.remove("active");
    const newActive = this.playList.querySelector(`.c-player__song[data-index="${this.currentIndex}"]`);
    if (newActive) newActive.classList.add("active");
  }

  _scrollToActiveSong() {
    setTimeout(() => {
      const active = this.playList.querySelector(".c-player__song.active");
      if (active) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 300);
  }

  _initWaveVisualizer() {
    if (!this.canvas || !this.audio) return;

    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      this.analyser = analyser;

      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(analyser);
      analyser.connect(this.audioContext.destination);
    }

    const ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = 280;

    const analyser = this.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (this.canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${50 + barHeight},${250 - barHeight},150)`;
        ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }
}

const songsData = [
  { index: 1, name: "Emulating Genius for Superintelligence", singer: "Mohammed Bahageel", duration: "10:55", path: "Audio/asi.wav" },
  { index: 2, name: "Detecting AI Agent Misbehavior", singer: "Mohammed Bahageel", duration: "19:37", path: "Audio/deviant.wav" },
  { index: 3, name: "Cracking Medical Mysteries", singer: "Mohammed Bahageel", duration: "13:33", path: "Audio/bacteria.wav" },
  { index: 4, name: "Understanding the Controversy", singer: "Mohammed Bahageel", duration: "10:49", path: "Audio/Noble prize 1.wav" },
  { index: 5, name: "Emotional Intelligence & AI", singer: "Mohammed Bahageel", duration: "10:48", path: "Audio/Incorporating emotional intelligence in AI Models.wav" },
  { index: 6, name: "Unveiling the Human Among AI Models", singer: "Mohammed Bahageel", duration: "5:55", path: "Audio/Unveiling the Human Among AI Models.wav" },
  { index: 7, name: "The Gradual Path to AGI", singer: "Mohammed Bahageel", duration: "8:17", path: "Audio/The Gradual Path to AGI Step-by-Step Improvements in AI Intelligence.wav" },
  { index: 8, name: "AI Training Conundrum", singer: "Mohammed Bahageel", duration: "15:28", path: "Audio/AI Training Conundrum.wav" },
  { index: 9, name: "Demystifying Devin AI Augmentation", singer: "Mohammed Bahageel", duration: "8:37", path: "Audio/Demystifying Devin How AI Augments, Not Replaces, Software Engineers.wav" },
  { index: 10, name: "Q Star AI Reasoning Capabilities", singer: "Mohammed Bahageel", duration: "5:36", path: "Audio/Q-star Reasoning Capabilities.wav" },
  { index: 11, name: "Vector Embedding Databases", singer: "Mohammed Bahageel", duration: "8:27", path: "Audio/Unlocking the Power of Vector Embedding Databases.wav" },
  { index: 12, name: "The Epitome of Multimodality", singer: "Mohammed Bahageel", duration: "7:12", path: "Audio/THE EPITOME OF MULTIMODALITY.wav" },
  { index: 13, name: "Revolutionizing Healthcare AI Medical Imaging", singer: "Mohammed Bahageel", duration: "8:18", path: "Audio/Revolutionizing Healthcare AI, Deep Learning, and MONAI in Medical Imaging.wav" },
  { index: 14, name: "Advancing Machine Learning", singer: "Mohammed Bahageel", duration: "9:37", path: "Audio/Advancing Machine Learning.wav" },
  { index: 15, name: "Frontend Development for Data Visualization", singer: "Mohammed Bahageel", duration: "7:50", path: "Audio/Front-End Development in Data Visualization.wav" },
  { index: 16, name: "The Era of Continuously Learning Analytic Assets", singer: "Mohammed Bahageel", duration: "5:32", path: "Audio/The Era of Continuously Learning Analytic Assets.wav" }
];

new Player(songsData).start();
