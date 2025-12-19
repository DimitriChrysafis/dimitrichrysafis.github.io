let posts = [];
let colors = {};
let writtenPosts = [];
const dataLoadState = {
  posts: { loaded: false, error: null },
  colors: { loaded: false, error: null },
  written: { loaded: false, error: null }
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

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return await response.json();
}

async function fetchText(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return await response.text();
}

function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return new Date(NaN);
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateString.trim());
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
}

function formatDate(dateString) {
  const d = parseDate(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString || '');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
// we
async function loadTemplates() {
  const ensureTemplate = (id, innerHtml) => {
    if (document.getElementById(id)) return;
    const template = document.createElement('template');
    template.id = id;
    template.innerHTML = innerHtml.trim();
    document.body.appendChild(template);
  };

  const ensureRequiredTemplates = () => {
    ensureTemplate('landing-template', `
      <div class="landing">
        <button type="button" class="landing-card" onclick="navigateToWritten()">
          <h2>Written</h2>
          <p>Short notes and thoughts.</p>
        </button>
        <button type="button" class="landing-card" onclick="navigateToProjects()">
          <h2>Projects List</h2>
          <p>Writeups, demos, and longer posts.</p>
        </button>
      </div>
    `);

    ensureTemplate('written-page-template', `
      <article class="written-page">
        <div class="section-nav">
          <button onclick="navigateToHome()" class="nav-button">← HOME</button>
          <button onclick="navigateToProjects()" class="nav-button">PROJECTS</button>
        </div>
        <header class="post-header">
          <h1>Written</h1>
          <div class="post-meta">Short thoughts and notes.</div>
        </header>
        <div class="written-list"></div>
      </article>
    `);
  };

  // Prevent duplicate injection if already present
  if (document.getElementById('post-grid-template')) {
    ensureRequiredTemplates();
    return;
  }
  try {
    const response = await fetch('templates.html', { cache: 'no-store' });
    if (!response.ok) throw new Error('templates fetch failed');
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (e) {
    // Fallback inline templates for file:// or fetch failures
    const fallback = `
<template id="post-grid-template">
  <div class="posts-grid"></div>
</template>

<template id="post-card-template">
  <article class="post-card" onclick="navigateToPost('{{filename}}')">
    <h2 class="post-title">{{title}}</h2>
    <div class="post-meta">{{date}} • {{author}}</div>
    <div class="post-bio">{{bio}}</div>
    <div class="categories">{{categories}}</div>
  </article>
</template>

<template id="post-page-template">
  <article class="post-page">
    <div class="section-nav">
      <button onclick="navigateToProjects()" class="nav-button">← PROJECTS</button>
      <button onclick="navigateToHome()" class="nav-button">HOME</button>
      <button onclick="navigateToWritten()" class="nav-button">WRITTEN</button>
    </div>
    <header class="post-header">
      <h1>{{postTitle}}</h1>
      <div class="post-meta">{{postDate}} • {{postAuthor}}</div>
    </header>
    <div class="markdown-content">{{postContent}}</div>
  </article>
</template>

<template id="landing-template">
  <div class="landing">
    <div class="landing-card" onclick="navigateToWritten()">
      <h2>Written</h2>
      <p>Short, opinionated notes.</p>
    </div>
    <div class="landing-card" onclick="navigateToProjects()">
      <h2>Projects</h2>
      <p>Writeups, demos, and longer posts.</p>
    </div>
  </div>
</template>

<template id="written-page-template">
  <article class="written-page">
    <div class="section-nav">
      <button onclick="navigateToHome()" class="nav-button">← HOME</button>
      <button onclick="navigateToProjects()" class="nav-button">PROJECTS</button>
    </div>
    <header class="post-header">
      <h1>Written</h1>
      <div class="post-meta">Short thoughts and notes.</div>
    </header>
    <div class="written-list"></div>
  </article>
</template>`;
	    document.body.insertAdjacentHTML('beforeend', fallback);
  }

  ensureRequiredTemplates();
}

async function displayLanding() {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';
  const mainContent = document.getElementById('main-content');
  const landingTemplate = document.getElementById('landing-template')?.content?.cloneNode(true);

  mainContent.innerHTML = '';
  if (landingTemplate) {
    mainContent.appendChild(landingTemplate);
  }
}

async function displayPosts() {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';

  if (!dataLoadState.posts.loaded) await loadPosts();
  if (!dataLoadState.colors.loaded) await loadColors();

  const mainContent = document.getElementById('main-content');
  if (dataLoadState.posts.error) {
    const msg = document.createElement('div');
    msg.className = 'written-content';
    msg.textContent = `Could not load json/posts.json.\n\n${localServerHint()}`.trim();
    mainContent.innerHTML = '';
    mainContent.appendChild(msg);
    return;
  }

  const nav = document.createElement('div');
  nav.className = 'section-nav';
  nav.innerHTML = `
    <button onclick="navigateToHome()" class="nav-button">← HOME</button>
    <button onclick="navigateToWritten()" class="nav-button">WRITTEN</button>
  `;
  const postGridTemplate = document.getElementById('post-grid-template').content.cloneNode(true);
  const postGrid = postGridTemplate.querySelector('.posts-grid');

  posts.forEach(post => {
    const postCardTemplate = document.getElementById('post-card-template').content.cloneNode(true);
    postCardTemplate.querySelector('.post-card').setAttribute('onclick', `navigateToPost('${post.filename}')`);
    postCardTemplate.querySelector('.post-title').textContent = post.title;
    postCardTemplate.querySelector('.post-meta').innerHTML = `${formatDate(post.date)} • ${post.author}`;
    postCardTemplate.querySelector('.post-bio').textContent = post.bio;

    const categories = post.categories.map(category => {
      const color = colors[category] || 'gray'; // Default color if category not in colors.json
      return `<span class="category" style="background-color: ${color}; color: white;">${category}</span>`;
    }).join('');
    postCardTemplate.querySelector('.categories').innerHTML = categories;

    postGrid.appendChild(postCardTemplate);
  });

  mainContent.innerHTML = '';
  mainContent.appendChild(nav);
  mainContent.appendChild(postGridTemplate);
}

async function displayWrittenIndex() {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';

  if (!dataLoadState.written.loaded) {
    await loadWrittenPosts();
  }

  const mainContent = document.getElementById('main-content');
  const template = document.getElementById('written-page-template')?.content?.cloneNode(true);

  mainContent.innerHTML = '';
  if (!template) return;

  const list = template.querySelector('.written-list');
  if (dataLoadState.written.error) {
    const err = document.createElement('div');
    err.className = 'written-content';
    err.textContent = `Could not load json/written.json.\n\n${localServerHint()}`.trim();
    list.appendChild(err);
    mainContent.appendChild(template);
    return;
  }

  const items = Array.isArray(writtenPosts) ? [...writtenPosts] : [];
  items.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'written-content';
    empty.textContent = 'No written posts yet.';
    list.appendChild(empty);
  } else {
    items.forEach(item => {
      const article = document.createElement('article');
      article.className = 'written-item';
      article.addEventListener('click', () => navigateToWrittenPost(item.filename));

      const title = document.createElement('h2');
      title.className = 'written-title';
      title.textContent = item.title || item.filename || '';

      const date = document.createElement('div');
      date.className = 'written-date';
      date.textContent = item.date ? formatDate(item.date) : '';

      article.appendChild(title);
      if (date.textContent) article.appendChild(date);
      list.appendChild(article);
    });
  }

  mainContent.appendChild(template);
  await renderMath();
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
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';
  let markdown = '';
  try {
    markdown = await fetchText(`folder/${filename}`);
  } catch (e) {
    markdown = `# Missing post\n\nCould not load folder/${filename}.\n\n${localServerHint()}`.trim();
  }
  const post = posts.find(p => p.filename === filename) || { title: filename, date: '', author: '' };

  const mainContent = document.getElementById('main-content');
  const postPageTemplate = document.getElementById('post-page-template').content.cloneNode(true);

  postPageTemplate.querySelector('.post-header h1').textContent = post.title || filename;

  const metaParts = [];
  if (post.date) metaParts.push(formatDate(post.date));
  if (post.author) metaParts.push(post.author);
  postPageTemplate.querySelector('.post-meta').textContent = metaParts.join(' • ');

  const content = (window.marked && typeof marked.parse === 'function') ? marked.parse(markdown) : markdown;
  const markdownContent = postPageTemplate.querySelector('.markdown-content');
  markdownContent.innerHTML = content;

  fixMediaPaths(markdownContent);

  mainContent.innerHTML = '';
  mainContent.appendChild(postPageTemplate);

  await renderMath();
}

async function loadWrittenPost(filename) {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';

  if (!dataLoadState.written.loaded) {
    await loadWrittenPosts();
  }

  let markdown = '';
  try {
    markdown = await fetchText(`folder/written/${filename}`);
  } catch (e) {
    markdown = `# Missing written post\n\nCould not load folder/written/${filename}.\n\n${localServerHint()}`.trim();
  }

  const post = writtenPosts.find(p => p.filename === filename) || { title: filename, date: '', author: '' };
  const mainContent = document.getElementById('main-content');
  const postPageTemplate = document.getElementById('post-page-template').content.cloneNode(true);

  postPageTemplate.querySelector('.post-header h1').textContent = post.title || filename;

  const metaParts = [];
  if (post.date) metaParts.push(formatDate(post.date));
  if (post.author) metaParts.push(post.author);
  postPageTemplate.querySelector('.post-meta').textContent = metaParts.join(' • ');

  const content = (window.marked && typeof marked.parse === 'function') ? marked.parse(markdown) : markdown;
  const markdownContent = postPageTemplate.querySelector('.markdown-content');
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

function navigateToProjects() {
  window.location.hash = 'projects';
}

function navigateToWritten() {
  window.location.hash = 'written';
}

function navigateToWrittenPost(filename) {
  window.location.hash = `written/${encodeURIComponent(filename)}`;
}

function navigateToHome() {
  if (window.location.hash) {
    window.location.hash = '';
  } else {
    routes.home();
  }
}

function displayResume() {
    window.location.href = 'resume.html';
}


function handleRoute() {
  const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hash = raw.replace(/^\//, '').trim();
  if (hash.startsWith('post/')) {
    const filename = hash.slice(5);
    routes.post(filename);
  } else if (hash.startsWith('written/')) {
    const filename = decodeURIComponent(hash.slice('written/'.length));
    routes.writtenPost(filename);
  } else if (hash === 'projects') {
    routes.projects();
  } else if (hash === 'written') {
    routes.written();
  } else if (hash === 'postresume') {
    routes.resume();
  } else {
    routes.home();
  }
}

const routes = {
    home: displayLanding,
    projects: displayPosts,
    written: displayWrittenIndex,
    writtenPost: loadWrittenPost,
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

async function loadWrittenPosts() {
  dataLoadState.written.loaded = false;
  dataLoadState.written.error = null;
  try {
    const data = await fetchJson('json/written.json');
    writtenPosts = Array.isArray(data) ? data : [];
  } catch (e) {
    writtenPosts = [];
    dataLoadState.written.error = e;
    console.error(e);
  } finally {
    dataLoadState.written.loaded = true;
  }
}

async function loadColors() {
  dataLoadState.colors.loaded = false;
  dataLoadState.colors.error = null;
  try {
    const data = await fetchJson('json/colors.json');
    colors = (data && typeof data === 'object') ? data : {};
  } catch (e) {
    colors = {};
    dataLoadState.colors.error = e;
    console.error(e);
  } finally {
    dataLoadState.colors.loaded = true;
  }
}

loadTemplates().then(async () => {
  await Promise.all([loadColors(), loadPosts(), loadWrittenPosts()]);
  handleRoute();
});

window.addEventListener('keydown', function(event) {
  if (event.key === 'P' || event.key === 'p') {
    const script = document.createElement('script');
    script.src = '3.js';
    script.type = 'module';
    document.body.appendChild(script);
    console.log("3.js IS IN!");
  }
});

window.addEventListener('hashchange', handleRoute);

// ensure posts/colors are available even if route changes later
window.addEventListener('load', async () => {
  if (!dataLoadState.posts.loaded || !dataLoadState.colors.loaded || !dataLoadState.written.loaded) {
    try { await Promise.all([loadColors(), loadPosts(), loadWrittenPosts()]); } catch {}
  }
});


let emojis = [];
let lastSparkleTime = 0;

fetch('json/emojis.json')
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
    sparkle.style.left = `${e.pageX}px`;
    sparkle.style.top = `${e.pageY}px`;

    document.body.appendChild(sparkle);

    // Automatically remove sparkle after 1 second
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
});
