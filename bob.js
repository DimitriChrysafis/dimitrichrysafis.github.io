
async function loadTemplates() {
  const response = await fetch('templates.html');
  const html = await response.text();
  document.body.insertAdjacentHTML('beforeend', html); // Append templates to the body
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

    const categories = post.categories.map(category => `<span class="category">${category}</span>`).join('');
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
  postPageTemplate.querySelector('.post-meta').innerHTML = `${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ${post.author}`;
  postPageTemplate.querySelector('.markdown-content').innerHTML = marked.parse(markdown);

  mainContent.innerHTML = ''; // Clear existing content
  mainContent.appendChild(postPageTemplate);
}

function navigateToPost(filename) {
  window.location.hash = `post/${filename}`;
}

function navigateToHome() {
  window.location.hash = '';
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
  home: displayPosts,
  post: loadPost
};

async function loadPosts() {
  const response = await fetch('posts.json');
  posts = await response.json();
  handleRoute();
}

loadTemplates().then(() => {
  loadPosts();
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