// --- Data Source ---
const videos = [
  {
    id: 'v0',
    title: "How to install Flutter on Windows 2025 | Setup Android Studio",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/How_to_install_Flutter_on_Windows_2025_Setup_Android_Studio_for_Flutter_Step_by_Step_1080p.mp4",
    duration: "12:45",
    views: "15k",
    date: "1 day ago"
  },
  {
    id: 'v1',
    title: "Flutter Tutorial For Beginners In 1 Hour (1080P)",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Flutter_Tutorial_For_Beginners_In_1_Hour_1080P.mp4",
    duration: "1:02:10",
    views: "892k",
    date: "1 year ago"
  },
  {
    id: 'v2',
    title: "Discrete Mathematics 01 | Graph Theory - Basics of Graphs",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Discrete_Mathematics_01_Graph_Theory_-_Basics_of_Graphs_CS_IT_GATE_2024_Series_YT_720P.mp4",
    duration: "45:20",
    views: "5k",
    date: "2 weeks ago"
  }
];

// --- Global Elements ---
const homeView = document.getElementById('homeView');
const playerView = document.getElementById('playerView');
const videoGrid = document.getElementById('videoGrid');
const playerWrapper = document.getElementById('playerWrapper');
const playlistContainer = document.getElementById('playlistContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressFilled = document.getElementById('progressFilled');
const timeDisplay = document.getElementById('timeDisplay');
const starBtn = document.getElementById('starBtn');
const starText = document.getElementById('starText');
const followBtn = document.getElementById('followBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const shareText = document.getElementById('shareText');

let currentIndex = 0;
let isStarred = false;
let isFollowing = false;
let isDragging = false;
let inPlayerMode = false;

// --- Initialization ---
function initSystem() {
  
  // 1. Generate Home Grid Cards
  generateHomeGrid();

  // 2. Setup Player Elements
  videos.forEach((vid, index) => {
    // A. Main Video Player Elements
    const videoEl = document.createElement('video');
    videoEl.id = `vid-${index}`;
    videoEl.className = 'video-instance';
    videoEl.src = vid.src;
    videoEl.preload = 'auto';
    
    videoEl.addEventListener('timeupdate', () => {
      if(index === currentIndex) updateProgress();
    });
    videoEl.addEventListener('click', togglePlay); 
    videoEl.addEventListener('ended', nextVideo);
    
    playerWrapper.prepend(videoEl);

    // B. Playlist Sidebar Items (Using #t=1.0 for thumbnail)
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.id = `item-${index}`;
    item.innerHTML = `
      <div class="thumb-wrapper">
         <video class="thumb-video" src="${vid.src}#t=1.0" preload="metadata" muted></video>
         <div class="duration-badge">${vid.duration}</div>
      </div>
      <div class="item-info">
        <h4>${vid.title}</h4>
        <span>GitTube Academy • ${vid.views}</span>
      </div>
    `;
    item.onclick = () => switchToPlayer(index);
    playlistContainer.appendChild(item);
  });

  // 3. Listeners
  playPauseBtn.onclick = togglePlay;
  progressBar.addEventListener('click', scrub);
  progressBar.addEventListener('mousedown', () => isDragging = true);
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('mousemove', (e) => {
    if(isDragging) scrub(e);
  });
  
  searchInput.addEventListener('input', handleSearch);
  
  // 4. Check URL Routing
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  
  if (videoId) {
    const foundIndex = videos.findIndex(v => v.id === videoId);
    if (foundIndex !== -1) {
      switchToPlayer(foundIndex, false);
    } else {
      goHome(false);
    }
  } else {
    goHome(false);
  }
}

// --- Home & Routing Logic ---

function generateHomeGrid() {
  videoGrid.innerHTML = '';
  videos.forEach((vid, index) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => switchToPlayer(index);
    
    card.innerHTML = `
      <div class="card-thumb">
        <video class="card-video" src="${vid.src}#t=1.0" preload="metadata" muted></video>
        <div class="card-duration">${vid.duration}</div>
      </div>
      <div class="card-meta">
        <img src="https://github.com/github.png" class="card-avatar">
        <div class="card-text">
           <h3 class="card-title">${vid.title}</h3>
           <span class="card-channel">GitTube Academy</span>
           <span class="card-stats">${vid.views} views • ${vid.date}</span>
        </div>
      </div>
    `;
    videoGrid.appendChild(card);
  });
}

function goHome(pushHistory = true) {
  inPlayerMode = false;
  
  // Hide Player, Show Home
  playerView.classList.add('hidden');
  homeView.classList.remove('hidden');

  // Pause active video
  const activeVid = getActiveVideo();
  if (activeVid) activeVid.pause();

  if (pushHistory) {
    history.pushState(null, '', window.location.pathname);
  }
}

function switchToPlayer(index, pushHistory = true) {
  inPlayerMode = true;
  
  // Switch Views
  homeView.classList.add('hidden');
  playerView.classList.remove('hidden');

  // Logic from previous version
  const oldVid = getActiveVideo();
  if(oldVid) {
    oldVid.pause();
    oldVid.classList.remove('active');
  }

  currentIndex = index;
  const newVid = getActiveVideo();
  newVid.classList.add('active');
  newVid.play().catch(e => console.log("Autoplay blocked"));
  
  updatePlayIcon(true);
  
  document.getElementById('mainTitle').innerText = videos[index].title;
  document.getElementById('viewCount').innerText = `${videos[index].views} subscribers`;

  document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('playing'));
  document.getElementById(`item-${index}`).classList.add('playing');

  if (pushHistory) {
    const newUrl = `${window.location.pathname}?v=${videos[index].id}`;
    history.pushState({v: videos[index].id}, '', newUrl);
  }
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  if (document.activeElement === searchInput) return;
  
  // Only work if in player mode
  if (!inPlayerMode) return;

  const key = e.key.toLowerCase();
  if (key === 'f') {
    toggleFullscreen();
  } else if (key === ' ') {
    e.preventDefault(); 
    togglePlay();
  }
});

// --- Standard Player Functions ---
function getActiveVideo() {
  return document.getElementById(`vid-${currentIndex}`);
}

window.onpopstate = function(event) {
    if (event.state && event.state.v) {
        const idx = videos.findIndex(v => v.id === event.state.v);
        if (idx !== -1) switchToPlayer(idx, false);
    } else {
        goHome(false);
    }
};

function togglePlay() {
  const vid = getActiveVideo();
  if(vid.paused) {
    vid.play();
    updatePlayIcon(true);
  } else {
    vid.pause();
    updatePlayIcon(false);
  }
}

function updatePlayIcon(isPlaying) {
  const wrapper = document.getElementById('playerWrapper');
  const path = playPauseBtn.querySelector('path');
  if(isPlaying) {
    wrapper.classList.remove('paused');
    wrapper.classList.add('playing');
    path.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'); 
  } else {
    wrapper.classList.remove('playing');
    wrapper.classList.add('paused');
    path.setAttribute('d', 'M8 5v14l11-7z');
  }
}

function skipVideo(seconds) {
  const vid = getActiveVideo();
  vid.currentTime += seconds;
}

function nextVideo() {
  let next = currentIndex + 1;
  if(next >= videos.length) next = 0;
  switchToPlayer(next);
}

function updateProgress() {
  const vid = getActiveVideo();
  if (!vid.duration) return;
  const percent = (vid.currentTime / vid.duration) * 100;
  progressFilled.style.width = `${percent}%`;
  timeDisplay.innerText = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
}

function scrub(e) {
  const vid = getActiveVideo();
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  vid.currentTime = pos * vid.duration;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    playerWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// --- Social & Share ---
function toggleStar() {
  isStarred = !isStarred;
  const countEl = document.getElementById('starCount');
  let count = parseInt(countEl.innerText.replace(',',''));
  
  if(isStarred) {
    starBtn.classList.add('starred');
    starText.innerText = "Starred";
    count++;
  } else {
    starBtn.classList.remove('starred');
    starText.innerText = "Star";
    count--;
  }
  countEl.innerText = count.toLocaleString();
}

function toggleFollow() {
  isFollowing = !isFollowing;
  if(isFollowing) {
    followBtn.classList.add('following');
    followBtn.innerText = "Following";
  } else {
    followBtn.classList.remove('following');
    followBtn.innerText = "Follow";
  }
}

function shareVideo() {
    const videoId = videos[currentIndex].id;
    const url = `${window.location.origin}${window.location.pathname}?v=${videoId}`;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = shareText.innerText;
        shareText.innerText = "Copied!";
        setTimeout(() => { shareText.innerText = originalText; }, 2000);
    });
}

// --- Search ---
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    searchResults.innerHTML = '';
    
    if (query.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    const matches = videos.filter(v => v.title.toLowerCase().includes(query));
    if (matches.length > 0) {
        searchResults.style.display = 'flex';
        matches.forEach(vid => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerText = vid.title;
            div.onclick = () => {
                const idx = videos.findIndex(v => v.id === vid.id);
                switchToPlayer(idx);
                searchInput.value = '';
                searchResults.style.display = 'none';
            };
            searchResults.appendChild(div);
        });
    } else {
        searchResults.style.display = 'none';
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', initSystem);