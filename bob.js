let posts = [];
const dataLoadState = {
  posts: { loaded: false, error: null }
};

function localServerHint() {
  if (window.location.protocol !== 'file:') return '';
  return [
    'You are opening this page via file:// which blocks reading local files with fetch().',
    'Run a local server instead, e.g.:',
    '  python3 -m http.server',
    'Then open http://localhost:8000/'
  ].join('\n');
}

function stripJsonComments(json) {
  let out = '';
  let inString = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    const n = json[i + 1];
    if (inString) {
      out += c;
      if (c === '\\') {
        out += n;
        i++;
      } else if (c === '"') {
        inString = false;
      }
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === '/' && n === '/') {
      while (i < json.length && json[i] !== '\n') i++;
    } else if (c === '/' && n === '*') {
      i += 2;
      while (i < json.length && !(json[i] === '*' && json[i + 1] === '/')) i++;
      i++;
    } else {
      out += c;
    }
  }
  return out;
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return JSON.parse(stripJsonComments(await response.text()));
}

async function fetchText(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return await response.text();
}

const REQUIRED_TEMPLATES = ['post-grid-template', 'post-card-template', 'post-page-template', 'landing-template'];

// Inline fallback for file:// or fetch failures
const FALLBACK_TEMPLATES = `
<template id="post-grid-template">
  <div class="posts-grid"></div>
</template>

<template id="post-card-template">
  <article class="post-card" onclick="navigateToPost('{{filename}}')">
    <h2 class="post-title">{{title}}</h2>
    <div class="post-bio">{{bio}}</div>
  </article>
</template>

<template id="post-page-template">
  <article class="post-page">
    <div class="section-nav">
      <button onclick="navigateToProjects()" class="nav-button">← PROJECTS</button>
      <button onclick="navigateToHome()" class="nav-button">HOME</button>
    </div>
    <header class="post-header">
      <h1>{{postTitle}}</h1>
    </header>
    <div class="markdown-content">{{postContent}}</div>
  </article>
</template>

<template id="landing-template">
  <div class="landing">
    <div class="landing-card" onclick="navigateToProjects()">
      <h2>Projects</h2>
      <p>Writeups, demos, and longer posts.</p>
    </div>
  </div>
</template>
`;

async function loadTemplates() {
  const missing = REQUIRED_TEMPLATES.filter((id) => !document.getElementById(id));
  if (missing.length === 0) return;

  try {
    const response = await fetch('templates.html', { cache: 'no-store' });
    if (!response.ok) throw new Error('templates fetch failed');
    document.body.insertAdjacentHTML('beforeend', await response.text());
  } catch (e) {
    console.warn('using inline template fallback:', e);
    document.body.insertAdjacentHTML('beforeend', FALLBACK_TEMPLATES);
  }
}

function setPostCardImage(card, imageHash) {
  if (!imageHash) return;

  const extensions = ['gif', 'png', 'webp', 'jpg', 'jpeg'];
  let extensionIndex = 0;

  const tryNextImage = () => {
    if (extensionIndex >= extensions.length) return;

    const imageUrl = `media/post-images/${imageHash}.${extensions[extensionIndex]}`;
    const image = new Image();
    extensionIndex += 1;

    image.onload = () => {
      card.style.backgroundImage = `url('${imageUrl}')`;
    };
    image.onerror = tryNextImage;
    image.src = imageUrl;
  };

  tryNextImage();
}

async function displayPosts() {
  document.body.classList.remove('resume-active', 'post12-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';
  document.title = "Dimitri's Blog";

  if (!dataLoadState.posts.loaded) await loadPosts();

  const mainContent = document.getElementById('main-content');
  if (dataLoadState.posts.error) {
    const msg = document.createElement('div');
    msg.className = 'post-bio';
    msg.textContent = `Could not load json/posts.json.\n\n${localServerHint()}`.trim();
    mainContent.innerHTML = '';
    mainContent.appendChild(msg);
    return;
  }

  const postGridTemplate = document.getElementById('post-grid-template').content.cloneNode(true);
  const postGrid = postGridTemplate.querySelector('.posts-grid');

  posts.forEach((post) => {
    const postCardTemplate = document.getElementById('post-card-template').content.cloneNode(true);
    const action = post.demoUrl ? `navigateToDemo('${post.demoUrl}')` : `navigateToPost('${post.filename}')`;
    const postCard = postCardTemplate.querySelector('.post-card');
    postCard.setAttribute('onclick', action);
    postCardTemplate.querySelector('.post-title').textContent = post.title;
    postCardTemplate.querySelector('.post-bio').textContent = post.bio;
    setPostCardImage(postCard, post.imageHash);
    postCard.style.backgroundSize = 'cover';
    postCard.style.backgroundPosition = 'center';

    postGrid.appendChild(postCardTemplate);
  });

  mainContent.innerHTML = '';
  mainContent.appendChild(postGridTemplate);
}

function fixMediaPaths(rootEl) {
  const fixUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('../media/')) return url.replace(/^\.\.\//, '');
    return url;
  };

  const elems = rootEl.querySelectorAll('[src], [href], video[poster], img');
  elems.forEach(el => {
    if (el.hasAttribute('src')) {
      const v = el.getAttribute('src');
      const nv = fixUrl(v);
      if (nv !== v) el.setAttribute('src', nv);
    }
    if (el.hasAttribute('href')) {
      const v = el.getAttribute('href');
      const nv = fixUrl(v);
      if (nv !== v) el.setAttribute('href', nv);
    }
    if (el.tagName.toLowerCase() === 'video' && el.hasAttribute('poster')) {
      const v = el.getAttribute('poster');
      const nv = fixUrl(v);
      if (nv !== v) el.setAttribute('poster', nv);
    }
  });
}

async function loadPost(filename) {
  document.body.classList.remove('resume-active');
  document.body.classList.toggle('post12-active', filename === 'post12.md');
  const header = document.querySelector('.header');
  if (header) header.style.display = filename === 'post12.md' ? 'none' : 'flex';
  const post = posts.find(p => p.filename === filename) || { title: filename, date: '', author: '' };
  if (post.demoUrl) {
    window.location.href = post.demoUrl;
    return;
  }

  let markdown = '';
  try {
    markdown = await fetchText(`folder/${filename}`);
  } catch (e) {
    markdown = `# Missing post\n\nCould not load folder/${filename}.\n\n${localServerHint()}`.trim();
  }

  const mainContent = document.getElementById('main-content');
  const postPageTemplate = document.getElementById('post-page-template').content.cloneNode(true);
  document.title = `${post.title || filename} | Dimitri's Blog`;

  postPageTemplate.querySelector('.post-header h1').textContent = post.title || filename;

  const content = (window.marked && typeof marked.parse === 'function') ? marked.parse(markdown) : markdown;
  const markdownContent = postPageTemplate.querySelector('.markdown-content');
  if (filename === 'post12.md') {
    markdownContent.classList.add('post12-content');
    markdownContent.closest('.post-page')?.classList.add('post12-page');
  }
  markdownContent.innerHTML = content;

  fixMediaPaths(markdownContent);

  mainContent.innerHTML = '';
  mainContent.appendChild(postPageTemplate);

  await renderMath();
}

async function renderMath() {
  if (window.MathJax) {
    try {
      await MathJax.typesetPromise();
    } catch (e) {
      console.error("MathJax rendering bomb:", e);
    }
  }
}

function navigateToPost(filename) {
  window.location.hash = `post/${filename}`;
}

function navigateToDemo(url) {
  window.location.href = url;
}

function navigateToProjects() {
  window.location.hash = 'projects';
}

function navigateToHome() {
  routes.home();
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function displayResume() {
    window.location.href = 'resume.html';
}


function showRouteError(error) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;
  const msg = document.createElement('div');
  msg.className = 'post-bio';
  msg.textContent = `Something went wrong while rendering this page.\n\n${error}`.trim();
  mainContent.innerHTML = '';
  mainContent.appendChild(msg);
}

async function handleRoute() {
  // Guard against routes firing before templates are ready
  if (REQUIRED_TEMPLATES.some((id) => !document.getElementById(id))) {
    await loadTemplates();
  }

  const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hash = raw.replace(/^\//, '').trim();
  let route;
  if (hash.startsWith('post/')) {
    route = routes.post(hash.slice(5));
  } else if (hash === 'projects') {
    route = routes.projects();
  } else if (hash === 'postresume') {
    route = routes.resume();
  } else {
    route = routes.home();
  }

  try {
    await route;
  } catch (e) {
    console.error('route render failed:', e);
    showRouteError(e);
  }
}

const routes = {
    home: displayPosts,
    projects: displayPosts,
    post: loadPost,
    resume: displayResume
};



async function loadPosts() {
  dataLoadState.posts.loaded = false;
  dataLoadState.posts.error = null;
  try {
    const data = await fetchJson('json/posts.json');
    posts = Array.isArray(data) ? data : [];
  } catch (e) {
    posts = [];
    dataLoadState.posts.error = e;
    console.error(e);
  } finally {
    dataLoadState.posts.loaded = true;
  }
}

loadTemplates().then(async () => {
  await loadPosts();
  handleRoute();
});

let easterEggLoaded = false;
window.addEventListener('keydown', function(event) {
  if (event.key === 'P' || event.key === 'p') {
    if (easterEggLoaded) return;
    easterEggLoaded = true;
    const script = document.createElement('script');
    script.src = '3.js';
    script.type = 'module';
    document.body.appendChild(script);
    console.log("3.js IS IN!");
  }
});

window.addEventListener('hashchange', handleRoute);

// ensure posts are available even if route changes later
window.addEventListener('load', async () => {
  if (!dataLoadState.posts.loaded) {
    try { await loadPosts(); } catch {}
  }
});


let emojis = [];
let lastSparkleTime = 0;

fetch('json/emojis.json', { cache: 'no-store' })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        emojis = data;
    })
    .catch((error) => console.error(error));

document.addEventListener('mousemove', (e) => {
    if (emojis.length === 0) return;

    const now = Date.now();

    if (now - lastSparkleTime < 100) return;
    lastSparkleTime = now;

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = randomEmoji;
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;

    document.body.appendChild(sparkle);

    // Automatically remove sparkle after 1 second
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
});
