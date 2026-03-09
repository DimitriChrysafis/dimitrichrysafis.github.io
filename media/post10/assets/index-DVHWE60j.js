const appRoot = document.querySelector("#app");

if (appRoot) {
  document.title = "WebGPU-Ocean-JS";
  document.body.innerHTML = `
    <div id="debug-info">
      <span id="error-reason"></span>
    </div>
    <canvas id="fluidCanvas"></canvas>
  `;
}

const inlineStyle = document.createElement("style");
inlineStyle.textContent = `
  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  canvas {
    width: 100%;
    height: 100%;
  }

  #debug-info {
    position: fixed;
  }

  * {
    user-select: none;
  }
`;
document.head.appendChild(inlineStyle);

await loadScript("https://unpkg.com/stats.js@0.17.0/build/stats.min.js");
await loadScript("https://unpkg.com/dat.gui@0.7.9/build/dat.gui.min.js");
await import("../main.js?v=20260309i");

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
