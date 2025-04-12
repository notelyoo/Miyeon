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
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
  } else {
    adminLoginDiv.innerHTML = `<a href="/login">Login</a>`;
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  fetchVideos();
  fetchAlbums();

  const addVideoBtn = document.getElementById('addVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const closeVideoModal = document.getElementById('closeVideoModal');

  if (addVideoBtn && videoModal) addVideoBtn.onclick = () => videoModal.style.display = 'block';
  if (closeVideoModal && videoModal) closeVideoModal.onclick = () => videoModal.style.display = 'none';

  window.addEventListener('click', (event) => {
    if (event.target === videoModal) videoModal.style.display = 'none';
    if (event.target === albumModal) albumModal.style.display = 'none';
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
        await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ embedUrl })
        });
        fetchVideos();
      }

      youtubeLinkInput.value = "";
      if (videoModal) videoModal.style.display = 'none';
    });
  }

  const albumForm = document.getElementById('albumForm');
  const addAlbumBtn = document.getElementById('addAlbumBtn');
  const albumModal = document.getElementById('albumModal');
  const closeAlbumModal = document.getElementById('closeAlbumModal');

  if (albumForm) {
    albumForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const albumLinkInput = document.getElementById('albumLink');
      const url = albumLinkInput.value.trim();
      const match = url.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/);
      if (!match) return;
      const albumId = match[1];
      const embedUrl = `https://open.spotify.com/embed/album/${albumId}`;
      const csrfToken = await getCsrfToken();
      await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ embedUrl })
      });
      fetchAlbums();
      albumLinkInput.value = "";
      if (albumModal) albumModal.style.display = 'none';
    });
  }

  if (addAlbumBtn && albumModal) addAlbumBtn.onclick = () => albumModal.style.display = 'block';
  if (closeAlbumModal && albumModal) closeAlbumModal.onclick = () => albumModal.style.display = 'none';

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
        document.querySelectorAll('.album-placeholder').forEach(el => albumObserver.observe(el));
      })
      .catch(err => console.error('Error fetching albums:', err));
  }

  function addAlbumToList(album) {
    const albumList = document.getElementById('albumList');
    if (!albumList) return;

    const albumItem = document.createElement('div');
    albumItem.classList.add('album-item');
    albumItem.style.position = 'relative';
    albumItem.style.overflow = 'hidden';
    albumItem.style.height = '152px';
    albumItem.style.marginBottom = '12px';
    albumItem.style.borderRadius = '12px';

    const placeholder = document.createElement('div');
    placeholder.classList.add('album-placeholder');
    placeholder.dataset.embed = album.embedUrl;
    placeholder.style.width = '100%';
    placeholder.style.height = '100%';
    placeholder.style.backgroundColor = '#111';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = '#fff';
    placeholder.style.fontSize = '14px';
    placeholder.style.borderRadius = '12px';
    placeholder.style.fontFamily = 'sans-serif';
    placeholder.textContent = 'Loading album…';

    albumItem.appendChild(placeholder);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('delete-embed-btn');
      Object.assign(deleteBtn.style, {
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        border: 'none',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        zIndex: '200'
      });
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const csrfToken = await getCsrfToken();
        await fetch(`/api/albums/${album.id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        });
        fetchAlbums();
      });
      albumItem.appendChild(deleteBtn);
    }

    albumList.appendChild(albumItem);
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
        document.querySelectorAll('.video-placeholder').forEach(el => videoObserver.observe(el));
      })
      .catch(err => console.error('Error fetching videos:', err));
  }

  const videoObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const embedUrl = container.dataset.embed;

        const iframe = document.createElement('iframe');
        iframe.src = `${embedUrl}&controls=1&modestbranding=1&rel=0`;
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
          container.innerHTML = '';
          container.appendChild(iframe);
          requestAnimationFrame(() => {
            iframe.style.opacity = '1';
          });
          obs.unobserve(container);
        }, 100);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.1
  });

  const albumObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const embedUrl = container.dataset.embed;

        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
          container.innerHTML = '';
          container.appendChild(iframe);
          requestAnimationFrame(() => {
            iframe.style.opacity = '1';
          });
          obs.unobserve(container);
        }, 100);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.1
  });

  function addVideoToList(video) {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');
    videoItem.style.position = "relative";
    videoItem.style.overflow = "hidden";
    videoItem.style.borderRadius = "12px";

    const placeholder = document.createElement('div');
    placeholder.classList.add('video-placeholder');
    placeholder.dataset.embed = video.embedUrl;
    placeholder.style.width = "100%";
    placeholder.style.paddingBottom = "56.25%";
    placeholder.style.position = "relative";
    placeholder.style.backgroundColor = "#000";
    placeholder.style.borderRadius = "12px";

    const videoIdMatch = video.embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (videoId) {
      const thumbnail = document.createElement('img');
      thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      thumbnail.alt = "";
      thumbnail.style.position = "absolute";
      thumbnail.style.top = "0";
      thumbnail.style.left = "0";
      thumbnail.style.width = "100%";
      thumbnail.style.height = "100%";
      thumbnail.style.objectFit = "cover";
      thumbnail.style.borderRadius = "12px";
      thumbnail.style.zIndex = "0";
      placeholder.appendChild(thumbnail);
    }

    videoItem.appendChild(placeholder);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "×";
      deleteBtn.classList.add("delete-embed-btn");
      Object.assign(deleteBtn.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        backgroundColor: "rgba(255, 0, 0, 0.8)",
        border: "none",
        color: "white",
        borderRadius: "50%",
        width: "24px",
        height: "24px",
        cursor: "pointer",
        zIndex: "200"
      });
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const csrfToken = await getCsrfToken();
        await fetch(`/api/videos/${video.id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        });
        fetchVideos();
      });
      videoItem.appendChild(deleteBtn);
    }

    videoList.appendChild(videoItem);
  }

  fetchAlbums();
});