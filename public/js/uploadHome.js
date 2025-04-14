/**
  📁 File: uploadHome.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isAdmin = await checkAdminStatus();

  const adminLoginDiv = document.querySelector('.admin-login');
  if (isAdmin) {
    adminLoginDiv.innerHTML = `
      <span class="admin-badge">👑 Admin Mode</span>
      <button id="uploadBtn" class="navbar-upload-btn">Upload Photo</button>
      <button id="exportBtn">Export</button>
      <button id="logoutBtn">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const csrfToken = await getCsrfToken();
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      window.location.reload();
    });
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'inline-block';
    });
  } else {
    adminLoginDiv.innerHTML = `<a href="/login">Login</a>`;
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'none';
    });
  }

  fetchVideos();
  fetchAlbums();

  const addVideoBtn = document.getElementById('addVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const closeVideoModal = document.getElementById('closeVideoModal');

  if (addVideoBtn && videoModal) {
    addVideoBtn.onclick = () => videoModal.style.display = 'block';
  }
  if (closeVideoModal && videoModal) {
    closeVideoModal.onclick = () => videoModal.style.display = 'none';
  }
  window.addEventListener('click', (event) => {
    if (videoModal && event.target === videoModal) {
      videoModal.style.display = 'none';
    }
  });

  const videoForm = document.getElementById('videoForm');
  if (videoForm) {
    videoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const youtubeLinkInput = document.getElementById('youtubeLink');
      const rawUrl = youtubeLinkInput.value.trim();
      if (!rawUrl) return;

      const cleanUrl = rawUrl.split('?')[0];
      let videoId = '';
      const shortUrlMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      const longUrlMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      const embedUrlMatch = cleanUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);

      if (shortUrlMatch) videoId = shortUrlMatch[1];
      else if (longUrlMatch) videoId = longUrlMatch[1];
      else if (embedUrlMatch) videoId = embedUrlMatch[1];

      if (videoId) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?controls=0`;
        const csrfToken = await getCsrfToken();
        fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ embedUrl })
        })
          .then(response => response.json())
          .then(() => fetchVideos())
          .catch(err => console.error('Error saving video:', err));
      }

      youtubeLinkInput.value = "";
      if (videoModal) videoModal.style.display = 'none';
    });
  }

  function fetchVideos() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    fetch('/api/videos?ts=' + Date.now())
      .then(response => response.json())
      .then(videos => {
        videoList.innerHTML = "";
        videos.forEach(video => {
          addVideoToList(video);
        });
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
      });
  }

  function addVideoToList(video) {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');
    videoItem.style.position = "relative";
    videoItem.style.overflow = "visible";

    const match = video.embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : null;
    if (!videoId) return;

    const thumbnail = document.createElement('img');
    thumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    thumbnail.alt = "YouTube Video";
    thumbnail.loading = "lazy";
    thumbnail.classList.add('video-thumbnail');
    thumbnail.style.cursor = "pointer";

    thumbnail.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `${video.embedUrl}&autoplay=1`;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.sandbox = "allow-same-origin allow-scripts allow-presentation allow-popups allow-forms";
      iframe.width = "560";
      iframe.height = "315";
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      iframe.title = "YouTube video player";
      videoItem.innerHTML = '';
      videoItem.appendChild(iframe);
    });

    videoItem.appendChild(thumbnail);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "×";
      deleteBtn.classList.add("delete-embed-btn");
      deleteBtn.style.position = "absolute";
      deleteBtn.style.top = "8px";
      deleteBtn.style.right = "8px";
      deleteBtn.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
      deleteBtn.style.border = "none";
      deleteBtn.style.color = "white";
      deleteBtn.style.borderRadius = "50%";
      deleteBtn.style.width = "24px";
      deleteBtn.style.height = "24px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.zIndex = "200";
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const csrfToken = await getCsrfToken();
        fetch(`/api/videos/${video.id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        })
          .then(res => res.ok && fetchVideos())
          .catch(err => console.error("Erreur lors de la suppression de la vidéo:", err));
      });
      videoItem.appendChild(deleteBtn);
    }

    videoList.appendChild(videoItem);
  }

  function fetchAlbums() {
    const albumList = document.getElementById('albumList');
    if (!albumList) return;
    fetch('/api/albums?ts=' + Date.now())
      .then(response => response.json())
      .then(albums => {
        albumList.innerHTML = "";
        albums.forEach(album => {
          addAlbumToList(album);
        });
      })
      .catch(err => {
        console.error('Error fetching albums:', err);
      });
  }

  function addAlbumToList(album) {
    const albumList = document.getElementById('albumList');
    if (!albumList) return;

    const albumItem = document.createElement('div');
    albumItem.classList.add('album-item');
    albumItem.style.position = "relative";
    albumItem.style.overflow = "visible";

    const iframe = document.createElement('iframe');
    iframe.style.borderRadius = "12px";
    iframe.src = album.embedUrl;
    iframe.width = "100%";
    iframe.height = "152";
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.style.zIndex = "0";

    albumItem.appendChild(iframe);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "×";
      deleteBtn.classList.add("delete-embed-btn");
      deleteBtn.style.position = "absolute";
      deleteBtn.style.top = "8px";
      deleteBtn.style.right = "8px";
      deleteBtn.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
      deleteBtn.style.border = "none";
      deleteBtn.style.color = "white";
      deleteBtn.style.borderRadius = "50%";
      deleteBtn.style.width = "24px";
      deleteBtn.style.height = "24px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.zIndex = "200";
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const csrfToken = await getCsrfToken();
        fetch(`/api/albums/${album.id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        })
          .then(res => res.ok && fetchAlbums())
          .catch(err => console.error("Erreur lors de la suppression de l'album:", err));
      });
      albumItem.appendChild(deleteBtn);
    }

    albumList.appendChild(albumItem);
  }
});