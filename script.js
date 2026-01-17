// --- Data Source ---
const videos = [
  {
    id: 'v0',
    title: "How to install Flutter on Windows 2025 | Setup Android Studio",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/How_to_install_Flutter_on_Windows_2025_Setup_Android_Studio_for_Flutter_Step_by_Step_1080p.mp4",
    duration: "12:45",
    views: "15,340",
  },
  {
    id: 'v1',
    title: "Flutter Tutorial For Beginners In 1 Hour (1080P)",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Flutter_Tutorial_For_Beginners_In_1_Hour_1080P.mp4",
    duration: "1:02:10",
    views: "892,100",
  },
  {
    id: 'v2',
    title: "Discrete Mathematics 01 | Graph Theory - Basics of Graphs",
    src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Discrete_Mathematics_01_Graph_Theory_-_Basics_of_Graphs_CS_IT_GATE_2024_Series_YT_720P.mp4",
    duration: "45:20",
    views: "5,100",
  }
];

// --- Global Elements ---
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

// --- Initialization ---
function initSystem() {
  videos.forEach((vid, index) => {
    // 1. Create Main Video Element
    const videoEl = document.createElement('video');
    videoEl.id = `vid-${index}`;
    videoEl.className = 'video-instance';
    videoEl.src = vid.src;
    videoEl.preload = 'auto'; // Ensures start frame is loaded for main player
    
    videoEl.addEventListener('timeupdate', () => {
      if(index === currentIndex) updateProgress();
    });
    videoEl.addEventListener('click', togglePlay); 
    videoEl.addEventListener('ended', nextVideo);
    
    playerWrapper.prepend(videoEl);

    // 2. Create Playlist Item (Using Video as Thumbnail)
    // We add #t=1.0 to source to force browser to grab frame at 1s
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
        <span>GitTube Academy • ${vid.views} views</span>
      </div>
    `;
    item.onclick = () => switchVideo(index);
    playlistContainer.appendChild(item);
  });

  // Listeners
  playPauseBtn.onclick = togglePlay;
  progressBar.addEventListener('click', scrub);
  progressBar.addEventListener('mousedown', () => isDragging = true);
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('mousemove', (e) => {
    if(isDragging) scrub(e);
  });
  
  // Search
  searchInput.addEventListener('input', handleSearch);
  
  // URL Routing
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  let startIdx = 0;
  if (videoId) {
    const foundIndex = videos.findIndex(v => v.id === videoId);
    if (foundIndex !== -1) startIdx = foundIndex;
  }
  switchVideo(startIdx, false);
}

// --- KEYBOARD SHORTCUTS ---
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in search bar
  if (document.activeElement === searchInput) return;

  const key = e.key.toLowerCase();

  if (key === 'f') {
    toggleFullscreen();
  } else if (key === ' ') {
    e.preventDefault(); // Prevent page scroll
    togglePlay();
  }
});

// --- Video Logic ---
function getActiveVideo() {
  return document.getElementById(`vid-${currentIndex}`);
}

function switchVideo(index, pushHistory = true) {
  const oldVid = getActiveVideo();
  if(oldVid) {
    oldVid.pause();
    oldVid.classList.remove('active');
  }

  currentIndex = index;
  const newVid = getActiveVideo();
  newVid.classList.add('active');
  
  // Note: We don't auto-play immediately on page load to allow 
  // the first frame (thumbnail) to be seen, unless user clicked a playlist item.
  // But if we want instant switch play:
  if(pushHistory) {
      newVid.play().catch(e => console.log("Autoplay blocked"));
      updatePlayIcon(true);
  } else {
      updatePlayIcon(false); // Paused initially on load
  }

  document.getElementById('mainTitle').innerText = videos[index].title;
  document.getElementById('viewCount').innerText = `${videos[index].views} views • Updated recently`;

  document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('playing'));
  document.getElementById(`item-${index}`).classList.add('playing');

  if (pushHistory) {
      const newUrl = `${window.location.pathname}?v=${videos[index].id}`;
      history.pushState({v: videos[index].id}, '', newUrl);
  }
}

window.onpopstate = function(event) {
    if (event.state && event.state.v) {
        const idx = videos.findIndex(v => v.id === event.state.v);
        if (idx !== -1) switchVideo(idx, false);
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
  switchVideo(next);
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

// --- Social & Share Logic ---
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

// --- Search Logic ---
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
                switchVideo(idx);
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