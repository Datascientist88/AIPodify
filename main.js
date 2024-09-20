const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Music_Player_D2D";

const player = $(".c-player");
const cd = $(".c-player__cd");
const cdThumb = $(".c-player__cd-thumb");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const progress = $(".c-player__progress-bar");
const audio = $("#js-player-audio");
const playList = $(".c-player__playlist");

const app = {
  currentIndex: 0,
  indexArray: [],
  indexSum: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  songs: [
    {
      index: 1,
      name: "Emotional Intelligence & AI",
      singer: "Mohammed Bahageel",
      duration: "10:48",
      image: "images/AIEQ.jpg",
      path: "Audio/Incorporating emotional intelligence in AI Models.wav"
    },
    {
      index: 2,
      name: "Unveiling the Human Among AI Models",
      singer: "Mohammed Bahageel",
      duration: "5:55",
      image: "images/reverse-turing-test.jpg",
      path: "Audio/Unveiling the Human Among AI Models.wav"
    },
    {
      index: 3,
      name: "The Gradual Path to AGI",
      singer: "Mohammed Bahageel",
      duration: "8:17",
      image: "images/AGI.jpg",
      path: "Audio/The Gradual Path to AGI Step-by-Step Improvements in AI Intelligence.wav"
    },
    {
      index: 4,
      name: "AI Training Conundrum",
      singer: "Mohammed Bahageel",
      duration: "15:28",
      image: "images/AI Training Conundrum.gif",
      path: "Audio/AI Training Conundrum.wav"
    },
    {
      index: 5,
      name: "Demystifying Devin AI Augmentation",
      singer: "Mohammed Bahageel",
      duration: "8:37",
      image: "images/devin.gif",
      path: "Audio/Demystifying Devin How AI Augments, Not Replaces, Software Engineers.wav"
    },
    {
      index: 6,
      name: "Q Star AI Reasoning Capabilities",
      singer: "Mohammed Bahageel",
      duration: "5:36",
      image: "images/AIq.jpeg",
      path:
        "Audio/Q-star Reasoning Capabilities.wav"
    },
    {
      index: 7,
      name: "Vector Embedding Databases",
      singer: "Mohammed Bahageel",
      duration: "8:27",
      image: "images/egai.png",
      path: "Audio/Unlocking the Power of Vector Embedding Databases.wav"
    },
    {
      index: 8,
      name: "The Epitome of Multimodality",
      singer: "Mohammed Bahageel",
      duration: "7:12",
      image: "images/gemini.jpg",
      path: "Audio/THE EPITOME OF MULTIMODALITY.wav"
    },
    {
      index: 9,
      name: "Revolutionizing Healthcare AI Medical Imaging",
      singer: "Mohammed Bahageel",
      duration: "8:18",
      image: "images/monai.gif",
      path: "Audio/Revolutionizing Healthcare AI, Deep Learning, and MONAI in Medical Imaging.wav"
    },
    {
      index: 10,
      name: "Advancing Machine Learning",
      singer: "Mohammed Bahageel",
      duration: "9:37",
      image: "images/ML.jpg",
      path: "Audio/Advancing Machine Learning.wav"
    }
  ],

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  renderSongs: function () {
    let htmls = this.songs.map((song, index) => {
      return `
                <div class="c-player__song" data-index=${index}>
                    <div class="c-player__song-number">${song.index}</div>
                    <div class="c-player__song-infos">
                        <h3 class="c-player__song-title">${song.name}</h3>
                        <p class="c-player__song-author">${song.singer}</p>
                    </div>
                    <div class="c-player__song-duration">${song.duration}</div>
                </div>
            `;
    });
    playList.innerHTML = htmls.join("");
  },

  handleEvents: function () {
    const _this = this;

    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      let scrollHeight = window.scrollY || document.documentElement.scrollTop;
      let cdNewWidth = cdWidth - scrollHeight;
      cd.style.width = cdNewWidth > 0 ? `${cdNewWidth}px` : 0;
      cd.style.opacity = cdNewWidth / cdWidth;
    };

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        _this.loadCurrentSong();
        audio.play();
      }
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdRotate.play();
    };
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdRotate.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.currentTime) {
        progress.value = (audio.currentTime / audio.duration) * 100;
      }
    };

    progress.onchange = function () {
      audio.currentTime = (progress.value * audio.duration) / 100;
    };

    const cdRotate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity
    });
    cdRotate.pause();

    nextBtn.onclick = function () {
      let songList = Array.prototype.slice.call($$(".c-player__song"));
      let oldIndex = _this.currentIndex;
      let oldItemSong = songList.find(function (value) {
        return value.dataset.index == oldIndex;
      });
      oldItemSong.classList.remove("active");
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.currentIndex++;
        if (_this.currentIndex >= _this.songs.length) {
          _this.currentIndex = 0;
        }
      }
      _this.loadCurrentSong();
      audio.play();
    };

    prevBtn.onclick = function () {
      let songList = Array.prototype.slice.call($$(".c-player__song"));
      let oldIndex = _this.currentIndex;
      let oldItemSong = songList.find(function (value) {
        return value.dataset.index == oldIndex;
      });
      oldItemSong.classList.remove("active");
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.currentIndex--;
        if (_this.currentIndex < 0) {
          _this.currentIndex = _this.songs.length - 1;
        }
      }
      _this.loadCurrentSong();
      audio.play();
    };

    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    playList.onclick = function (e) {
      let songNode = e.target.closest(".c-player__song:not(.active)");
      let optionNode = e.target.closest(".c-player__song-duration");
      let oldIndex = _this.currentIndex;
      let songList = Array.prototype.slice.call($$(".c-player__song"));
      let oldItemSong = songList.find(function (value) {
        return value.dataset.index == oldIndex;
      });
      if (songNode || optionNode) {
        if (songNode && !optionNode) {
          oldItemSong.classList.remove("active");
          _this.currentIndex = songNode.dataset.index;
          _this.loadCurrentSong();
          audio.play();
        }
        if (optionNode) {
          console.log(optionNode);
        }
      }
    };
  },

  playRandomSong: function () {
    let newIndex = 0;
    if (this.indexSum >= this.songs.length) {
      this.indexSum = 0;
      this.indexArray = [];
    }
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (
      newIndex === this.currentIndex ||
      this.indexArray.indexOf(newIndex) !== -1
    );
    this.indexArray.push(newIndex);
    this.indexSum++;
    this.currentIndex = newIndex;
  },

  loadCurrentSong: function () {
    let playingNow = document.querySelector("#js-playing-now h2");
    let durationSong = document.querySelector('#js-duration-song');
    
    playingNow.innerText = this.currentSong.index + '. ' + this.currentSong.name;
    durationSong.innerText = this.currentSong.duration;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;

    let songList = Array.prototype.slice.call($$(".c-player__song"));
    let itemSong = songList.find((value) => {
      return value.dataset.index == this.currentIndex;
    });
    if (itemSong) {
      itemSong.classList.add("active");
    }

    setTimeout(() => {
      let songActive = $(".c-player__song.active");
      if (songActive) {
        songActive.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }
    }, 200);
  },

  start: function () {
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.renderSongs();
  }
};

app.start();