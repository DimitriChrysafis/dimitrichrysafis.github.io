let posts = [];
let colors = {};
// we
async function loadTemplates() {
  // Prevent duplicate injection if called twice
  if (document.getElementById('post-grid-template')) return;
  try {
    const response = await fetch('templates.html');
    if (!response.ok) throw new Error('templates fetch failed');
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (e) {
    // Fallback for file:// loading (no fetch)
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
    <button onclick="navigateToHome()" class="back-button">← BACK</button>
    <header class="post-header">
      <h1>{{postTitle}}</h1>
      <div class="post-meta">{{postDate}} • {{postAuthor}}</div>
    </header>
    <div class="markdown-content">{{postContent}}</div>
  </article>
</template>`;
    document.body.insertAdjacentHTML('beforeend', fallback);
  }
}

async function displayPosts() {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';
  const mainContent = document.getElementById('main-content');
  const postGridTemplate = document.getElementById('post-grid-template').content.cloneNode(true);
  const postGrid = postGridTemplate.querySelector('.posts-grid');

  posts.forEach(post => {
    const postCardTemplate = document.getElementById('post-card-template').content.cloneNode(true);
    postCardTemplate.querySelector('.post-card').setAttribute('onclick', `navigateToPost('${post.filename}')`);
    postCardTemplate.querySelector('.post-title').textContent = post.title;
    postCardTemplate.querySelector('.post-meta').innerHTML = `${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ${post.author}`;
    postCardTemplate.querySelector('.post-bio').textContent = post.bio;

    const categories = post.categories.map(category => {
      const color = colors[category] || 'gray'; // Default color if category not in colors.json
      return `<span class="category" style="background-color: ${color}; color: white;">${category}</span>`;
    }).join('');
    postCardTemplate.querySelector('.categories').innerHTML = categories;

    postGrid.appendChild(postCardTemplate);
  });

  mainContent.innerHTML = '';
  mainContent.appendChild(postGridTemplate);
}

async function loadPost(filename) {
  document.body.classList.remove('resume-active');
  const header = document.querySelector('.header');
  if (header) header.style.display = 'flex';
  let markdown = '';
  try {
    const response = await fetch(`folder/${filename}`);
    if (!response.ok) throw new Error('post fetch failed');
    markdown = await response.text();
  } catch (e) {
    // Fallback for file:// — look for inline script with id `post-<filename>`
    const inline = document.getElementById(`post-${filename}`);
    if (inline) {
      markdown = inline.textContent || '';
    }
  }
  const post = posts.find(p => p.filename === filename);

  const mainContent = document.getElementById('main-content');
  const postPageTemplate = document.getElementById('post-page-template').content.cloneNode(true);

  postPageTemplate.querySelector('.post-header h1').textContent = post.title;
  postPageTemplate.querySelector('.post-meta').innerHTML =
    `${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ${post.author}`;

  const content = marked.parse(markdown);
  const markdownContent = postPageTemplate.querySelector('.markdown-content');
  markdownContent.innerHTML = content;

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

function navigateToHome() {
  // Keep navigation local-friendly: just clear the hash
  window.location.hash = '';
}

function displayResume() {
    window.location.href = 'resume.html';
}


function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('post/')) {
    const filename = hash.slice(5);
    routes.post(filename);
  } else if (hash === 'postresume') {
    routes.resume();
  } else {
    routes.home();
  }
}

const routes = {
    home: async () => {
        await displayPosts();
        // await displayMiniPosts();  // DISABLED: Mini posts removed from display
    },
    post: loadPost,
    resume: displayResume
};



async function loadPosts() {
  try {
    const response = await fetch('json/posts.json');
    if (!response.ok) throw new Error('posts fetch failed');
    posts = await response.json();
  } catch (e) {
    // Fallback for file:// loading (pull from inline script if present)
    const inline = document.getElementById('posts-json');
    if (inline) {
      try { posts = JSON.parse(inline.textContent); } catch {}
    }
    posts = posts || [];
  }
}

async function loadColors() {
  try {
    const response = await fetch('json/colors.json');
    if (!response.ok) throw new Error('colors fetch failed');
    colors = await response.json();
  } catch (e) {
    const inline = document.getElementById('colors-json');
    if (inline) {
      try { colors = JSON.parse(inline.textContent); } catch {}
    }
    colors = colors || {};
  }
}

loadTemplates().then(async () => {
    await Promise.all([loadColors(), loadPosts()/* , loadMiniPosts() */]); // Mini posts loading disabled
    handleRoute();
});

/*
loadTemplates().then(async () => {
    await Promise.all([loadColors(), loadPosts(), loadMiniPosts()]);
    handleRoute();
});

 */

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

let miniPosts = [];

async function loadMiniPosts() {
  const response = await fetch('json/mini.json');
  miniPosts = await response.json();
}

// DISABLED: Mini posts display function - content preserved in json/mini.json
/*
async function displayMiniPosts() {
  const mainContent = document.getElementById('main-content');
  const miniPostsContainer = document.createElement('div');
  miniPostsContainer.className = 'mini-posts';

  miniPosts.forEach(miniPost => {
    const miniPostElement = document.createElement('div');
    miniPostElement.className = 'mini-post';

    miniPostElement.innerHTML = `
      <h3 class="mini-title">${miniPost.title}</h3>
      <p class="mini-date">${new Date(miniPost.date).toLocaleDateString('en-US')}</p>
      <p class="mini-content">${miniPost.content}</p>
    `;

    miniPostsContainer.appendChild(miniPostElement);
  });

  mainContent.appendChild(miniPostsContainer);
}
*/

// do NOT touch
loadTemplates().then(async () => {
  await Promise.all([loadColors(), loadPosts()/* , loadMiniPosts() */]); // Mini posts loading disabled
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
