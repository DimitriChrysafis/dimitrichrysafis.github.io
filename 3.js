// :( never used this
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.157.0/three.module.min.js';

function cT(s = 256, cS = 32, c1 = 0xFF5733, c2 = 0x33FF57) {
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d');

    for (let y = 0; y < s; y += cS) {
        for (let x = 0; x < s; x += cS) {
            ctx.fillStyle = (Math.floor(x / cS) + Math.floor(y / cS)) % 2 === 0
                ? `#${c1.toString(16)}`
                : `#${c2.toString(16)}`;
            ctx.fillRect(x, y, cS, cS);
        }
    }

    return new THREE.CanvasTexture(c);
}

const s = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });

r.setSize(window.innerWidth, window.innerHeight);
r.setClearColor(0xf4f4f4, 0);
document.getElementById('scene-container').appendChild(r.domElement);

const t = cT(256, 32, 0xFF5733, 0x33FF57);

const g = new THREE.TorusKnotGeometry(2, 0.5, 100, 16);
const m = new THREE.MeshBasicMaterial({
    map: t,
    side: THREE.DoubleSide,
});
const kn = new THREE.Mesh(g, m);
s.add(kn);

cam.position.z = 8;

const pL1 = new THREE.PointLight(0xff0000, 5, 100);
pL1.position.set(10, 10, 10);
s.add(pL1);

const aL = new THREE.AmbientLight(0x0000ff, 1);
s.add(aL);

function a() {
    requestAnimationFrame(a);

    kn.rotation.x += 0.02;
    kn.rotation.y += 0.02;

    r.render(s, cam);
}

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    r.setSize(w, h);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
});

a();
