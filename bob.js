let posts = [];
let colors = {};

async function loadTemplates() {
  const response = await fetch('templates.html');
  const html = await response.text();
  document.body.insertAdjacentHTML('beforeend', html);
}

async function displayPosts() {
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
  const response = await fetch(`folder/${filename}`);
  const markdown = await response.text();
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
      console.error("MathJax rendering failed:", e);
    }
  }
}

function navigateToPost(filename) {
  window.location.hash = `post/${filename}`;
}

function navigateToHome() {
  window.location.href = 'https://dimitrichrysafis.github.io/';
}


function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('post/')) {
    const filename = hash.slice(5);
    routes.post(filename);
  } else {
    routes.home();
  }
}

const routes = {
    home: async () => {
        await displayPosts();
        await displayMiniPosts();  // should fix bug
    },
    post: loadPost
};



async function loadPosts() {
  const response = await fetch('json/posts.json');
  posts = await response.json();
}

async function loadColors() {
  const response = await fetch('json/colors.json');
  colors = await response.json();
}

loadTemplates().then(async () => {
    await Promise.all([loadColors(), loadPosts(), loadMiniPosts()]);
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

let miniPosts = [];

async function loadMiniPosts() {
  const response = await fetch('json/mini.json');
  miniPosts = await response.json();
}

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

// do NOT touch
loadTemplates().then(async () => {
  await Promise.all([loadColors(), loadPosts(), loadMiniPosts()]);
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
