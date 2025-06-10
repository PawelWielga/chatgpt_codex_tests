document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('cube-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
        new THREE.MeshBasicMaterial({ color: 0xff00ff }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff })
    ];
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    camera.position.z = 3;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    onWindowResize();
    animate();
});
