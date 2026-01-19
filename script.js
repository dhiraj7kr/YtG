// --- Configuration & Data ---
const videos = [
    {
        id: 'v0',
        title: "How to install Flutter on Windows 2025 | Setup Android Studio",
        src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/How_to_install_Flutter_on_Windows_2025_Setup_Android_Studio_for_Flutter_Step_by_Step_1080p.mp4",
        duration: "12:45",
        views: "15k views",
        date: "2 days ago"
    },
    {
        id: 'v1',
        title: "Flutter Tutorial For Beginners In 1 Hour (Crash Course)",
        src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Flutter_Tutorial_For_Beginners_In_1_Hour_1080P.mp4",
        duration: "1:02:10",
        views: "892k views",
        date: "1 year ago"
    },
    {
        id: 'v2',
        title: "Discrete Mathematics 01 | Graph Theory - Basics of Graphs",
        src: "https://media.githubusercontent.com/media/dhiraj7kr/YtG/main/Discrete_Mathematics_01_Graph_Theory_-_Basics_of_Graphs_CS_IT_GATE_2024_Series_YT_720P.mp4",
        duration: "45:20",
        views: "5k views",
        date: "2 weeks ago"
    }
];

// --- State ---
let state = {
    currentIndex: -1,
    isPlaying: false,
    isStarred: false,
    volume: 1.0,
    isDragging: false,
    captionsOn: false,
    playbackRate: 1.0,
    quality: '1080p'
};

// --- DOM Elements ---
const els = {
    homeView: document.getElementById('homeView'),
    playerView: document.getElementById('playerView'),
    videoGrid: document.getElementById('videoGrid'),
    playerWrapper: document.getElementById('playerWrapper'),
    playlistContainer: document.getElementById('playlistContainer'),
    mainTitle: document.getElementById('mainTitle'),
    viewCount: document.getElementById('viewCount'),
    videoDate: document.getElementById('videoDate'),
    progressBar: document.getElementById('progressBar'),
    progressFilled: document.getElementById('progressFilled'),
    progressHover: document.getElementById('progressHover'),
    scrubHead: document.querySelector('.scrub-head'),
    timeDisplay: document.getElementById('timeDisplay'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    bigPlayBtn: document.getElementById('bigPlayBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    muteBtn: document.getElementById('muteBtn'),
    starBtn: document.getElementById('starBtn'),
    starCount: document.getElementById('starCount'),
    starText: document.getElementById('starText'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    captionBtn: document.getElementById('captionBtn'),
    settingsMenu: document.getElementById('settingsMenu'),
    menuMain: document.getElementById('menuMain'),
    menuSpeed: document.getElementById('menuSpeed'),
    menuQuality: document.getElementById('menuQuality'),
    dispSpeed: document.getElementById('dispSpeed'),
    dispQuality: document.getElementById('dispQuality')
};

let activeVideoEl = null;

// --- Initialization ---
function init() {
    renderHomeGrid();
    renderPlaylist();
    setupGlobalEvents();
    
    const params = new URLSearchParams(window.location.search);
    const vidId = params.get('v');
    if (vidId) {
        const idx = videos.findIndex(v => v.id === vidId);
        if (idx !== -1) loadVideo(idx);
    }
}

// --- Rendering ---
function renderHomeGrid() {
    els.videoGrid.innerHTML = videos.map((vid, index) => `
        <div class="video-card" onmouseenter="previewPlay(this, ${index})" onmouseleave="previewStop(this)" onclick="loadVideo(${index})">
            <div class="card-thumbnail">
                <video class="thumb-media" src="${vid.src}#t=0.1" preload="metadata" muted playsinline></video>
                <div class="duration">${vid.duration}</div>
            </div>
            <div class="card-info">
                <img src="https://github.com/github.png" class="card-avatar">
                <div class="card-text">
                    <h3>${vid.title}</h3>
                    <div class="card-meta">GitTube Academy • ${vid.views} • ${vid.date}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPlaylist() {
    els.playlistContainer.innerHTML = videos.map((vid, index) => `
        <div class="playlist-item" id="pl-item-${index}" onclick="loadVideo(${index})">
            <div class="pl-thumb">
                <video class="pl-img" src="${vid.src}#t=1.0" preload="metadata"></video>
            </div>
            <div class="pl-info">
                <h4>${vid.title}</h4>
                <span>${vid.views}</span>
            </div>
        </div>
    `).join('');
}

// --- Player Logic ---
function loadVideo(index, pushHistory = true) {
    if (activeVideoEl) {
        activeVideoEl.pause();
        activeVideoEl.remove();
    }

    state.currentIndex = index;
    // Reset video state
    state.captionsOn = false;
    state.playbackRate = 1.0;
    els.dispSpeed.innerText = "Normal";
    updateCaptionBtn();

    const vidData = videos[index];

    // UI Updates
    els.homeView.classList.add('hidden');
    els.playerView.classList.remove('hidden');
    els.mainTitle.innerText = vidData.title;
    els.viewCount.innerText = `${vidData.views} subscribers`;
    els.videoDate.innerText = `Published ${vidData.date}`;
    
    document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`pl-item-${index}`)?.classList.add('active');

    // Create Video Element
    activeVideoEl = document.createElement('video');
    activeVideoEl.className = 'video-element';
    activeVideoEl.src = vidData.src;
    activeVideoEl.volume = state.volume;
    
    // Add dummy track for captions demo
    const track = document.createElement('track');
    track.kind = 'captions';
    track.label = 'English';
    track.srclang = 'en';
    track.src = ''; // Needs a .vtt file for real captions
    activeVideoEl.appendChild(track);
    
    // Events
    activeVideoEl.addEventListener('timeupdate', updateProgress);
    activeVideoEl.addEventListener('ended', () => { state.isPlaying = false; updatePlayIcons(); });
    activeVideoEl.addEventListener('click', togglePlay);
    activeVideoEl.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
        togglePlay();
    });

    els.playerWrapper.prepend(activeVideoEl);
    
    if (pushHistory) {
        history.pushState({ v: vidData.id }, '', `?v=${vidData.id}`);
    }
}

function goHome() {
    if (activeVideoEl) activeVideoEl.pause();
    els.playerView.classList.add('hidden');
    els.homeView.classList.remove('hidden');
    state.currentIndex = -1;
    history.pushState(null, '', window.location.pathname);
}

// --- Controls ---
function togglePlay() {
    if (!activeVideoEl) return;
    if (activeVideoEl.paused) {
        activeVideoEl.play();
        state.isPlaying = true;
    } else {
        activeVideoEl.pause();
        state.isPlaying = false;
    }
    updatePlayIcons();
}

function updatePlayIcons() {
    const wrapper = els.playerWrapper;
    const btnPath = els.playPauseBtn.querySelector('path');
    
    if (state.isPlaying) {
        wrapper.classList.remove('paused');
        wrapper.classList.add('playing');
        btnPath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'); 
    } else {
        wrapper.classList.remove('playing');
        wrapper.classList.add('paused');
        btnPath.setAttribute('d', 'M8 5v14l11-7z'); 
    }
}

function updateProgress() {
    if (!activeVideoEl || state.isDragging) return;
    const pct = (activeVideoEl.currentTime / activeVideoEl.duration) * 100;
    els.progressFilled.style.width = `${pct}%`;
    els.scrubHead.style.left = `${pct}%`;
    updateTimeDisplay();
}

function updateTimeDisplay() {
    if(!activeVideoEl) return;
    const cur = formatTime(activeVideoEl.currentTime);
    const dur = formatTime(activeVideoEl.duration || 0);
    els.timeDisplay.innerText = `${cur} / ${dur}`;
}

function scrub(e) {
    if (!activeVideoEl) return;
    const rect = els.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    activeVideoEl.currentTime = clamped * activeVideoEl.duration;
    els.progressFilled.style.width = `${clamped * 100}%`;
    els.scrubHead.style.left = `${clamped * 100}%`;
}

// --- Captions & Settings ---
function toggleCaptions() {
    state.captionsOn = !state.captionsOn;
    updateCaptionBtn();
    
    // Toggle actual track if available
    if(activeVideoEl && activeVideoEl.textTracks[0]) {
        activeVideoEl.textTracks[0].mode = state.captionsOn ? 'showing' : 'hidden';
    } else {
        if(state.captionsOn) console.log("Captions enabled (No VTT source provided for demo)");
    }
}

function updateCaptionBtn() {
    if (state.captionsOn) els.captionBtn.classList.add('active');
    else els.captionBtn.classList.remove('active');
}

function toggleSettingsMenu() {
    els.settingsMenu.classList.toggle('hidden');
    // Reset to main menu
    closeSubmenu();
}

function openSubmenu(menu) {
    els.menuMain.classList.add('hidden');
    if (menu === 'speed') els.menuSpeed.classList.remove('hidden');
    if (menu === 'quality') els.menuQuality.classList.remove('hidden');
}

function closeSubmenu() {
    els.menuMain.classList.remove('hidden');
    els.menuSpeed.classList.add('hidden');
    els.menuQuality.classList.add('hidden');
}

function changeSpeed(rate) {
    if (!activeVideoEl) return;
    state.playbackRate = rate;
    activeVideoEl.playbackRate = rate;
    
    // Update Text
    const text = rate === 1.0 ? "Normal" : rate + "x";
    els.dispSpeed.innerText = text;
    
    // Toggle active checkmarks (visual)
    // Note: In a production app, you'd dynamically render the checkmarks based on state
    
    closeSubmenu();
    toggleSettingsMenu(); // Close entire menu
}

function changeQuality(quality) {
    // Since these are single MP4 files, we can't actually change the bitrate without DASH/HLS
    // This simulates the UI interaction
    state.quality = quality;
    els.dispQuality.innerText = quality;
    
    console.log(`Quality preference set to: ${quality}`);
    
    closeSubmenu();
    toggleSettingsMenu();
}

// --- Utilities ---
function formatTime(s) {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function previewPlay(card, index) {
    if(window.innerWidth > 900) {
        const vid = card.querySelector('video');
        vid.currentTime = 0;
        vid.play().catch(e => {}); 
    }
}

function previewStop(card) {
    const vid = card.querySelector('video');
    vid.pause();
    vid.currentTime = 0;
}

// --- Global Events ---
function setupGlobalEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const key = e.key.toLowerCase();
        if (key === ' ' && state.currentIndex !== -1) { e.preventDefault(); togglePlay(); }
        if (key === 'f') toggleFullscreen();
        if (key === 'm') toggleMute();
        if (key === 'c') toggleCaptions();
        if (key === '/') { e.preventDefault(); els.searchInput.focus(); }
    });

    els.progressBar.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        scrub(e);
    });
    document.addEventListener('mousemove', (e) => {
        if (state.isDragging) scrub(e);
        if (e.target.closest('.progress-area')) {
            const rect = els.progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            els.progressHover.style.width = `${pos * 100}%`;
        }
    });
    document.addEventListener('mouseup', () => { state.isDragging = false; });

    els.playPauseBtn.onclick = togglePlay;
    els.bigPlayBtn.onclick = togglePlay;
    
    els.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value;
        if(activeVideoEl) activeVideoEl.volume = state.volume;
    });
    els.muteBtn.onclick = toggleMute;
    
    els.searchInput.addEventListener('input', handleSearch);
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) els.searchResults.style.display = 'none';
        
        // Close Settings if clicked outside of menu or toggle button
        if (!e.target.closest('#settingsMenu') && !e.target.closest('#settingsBtn')) {
            els.settingsMenu.classList.add('hidden');
        }
    });

    window.onpopstate = (e) => {
        if (e.state && e.state.v) {
            const idx = videos.findIndex(v => v.id === e.state.v);
            if(idx !== -1) loadVideo(idx, false);
        } else {
            goHome();
        }
    };
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        els.playerWrapper.requestFullscreen().catch(err => {});
    } else {
        document.exitFullscreen();
    }
}

function toggleMute() {
    if (!activeVideoEl) return;
    activeVideoEl.muted = !activeVideoEl.muted;
    const path = els.muteBtn.querySelector('path');
    if(activeVideoEl.muted) path.setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z');
    else path.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
}

function toggleStar() {
    state.isStarred = !state.isStarred;
    let count = parseInt(els.starCount.innerText.replace(',', ''));
    if (state.isStarred) {
        els.starBtn.classList.add('active');
        els.starText.innerText = "Starred";
        count++;
    } else {
        els.starBtn.classList.remove('active');
        els.starText.innerText = "Star";
        count--;
    }
    els.starCount.innerText = count.toLocaleString();
}

function shareVideo() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    const shareSpan = document.getElementById('shareText');
    const original = shareSpan.innerText;
    shareSpan.innerText = "Copied!";
    setTimeout(() => shareSpan.innerText = original, 2000);
}

function handleSearch(e) {
    const q = e.target.value.toLowerCase();
    const res = els.searchResults;
    res.innerHTML = '';
    
    if(!q) { res.style.display = 'none'; return; }
    
    const matches = videos.filter(v => v.title.toLowerCase().includes(q));
    if(matches.length) {
        res.style.display = 'flex';
        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerText = m.title;
            div.onclick = () => {
                const idx = videos.indexOf(m);
                loadVideo(idx);
                res.style.display = 'none';
                els.searchInput.value = '';
            };
            res.appendChild(div);
        });
    } else {
        res.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);