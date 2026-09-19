export function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  // 1. Hide the core engine's default green ground completely
  scene.children.forEach(child => {
    if (child.isMesh && child.geometry.type === 'PlaneGeometry' && child.material.color && child.material.color.getHex() === 0x5C7A5C) {
      child.visible = false;
    }
  });

  scene.background = new THREE.Color(0x00000a);

  // starfield — cheap, just points scattered far out
  const starCount = 600;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i*3]   = (Math.random()-0.5) * 300;
    starPositions[i*3+1] = Math.random() * 150;
    starPositions[i*3+2] = -50 - Math.random() * 250;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6 }));
  scene.add(stars);

  // 2. Build the Shuttle Interior dynamically (No external files needed)
  const shuttleGroup = new THREE.Group();

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.1, roughness: 0.9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xB4623F });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 16), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.05;
  shuttleGroup.add(floor);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 16), wallMat);
  leftWall.position.set(-4, 2, 0);
  shuttleGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 16), wallMat);
  rightWall.position.set(4, 2, 0);
  shuttleGroup.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), wallMat);
  backWall.position.set(0, 2, 8);
  shuttleGroup.add(backWall);

  // Front Viewport frame
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), accentMat);
  windowFrame.position.set(0, 2, -8);
  shuttleGroup.add(windowFrame);

  // real see-through glass, tinted, not a solid wall
  const spaceGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 3),
    new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.12, roughness: 0.1, metalness: 0 })
  );
  spaceGlass.position.set(0, 2, -7.74);
  shuttleGroup.add(spaceGlass);

  const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1), accentMat);
  consoleDesk.position.set(0, 0.5, -6);
  shuttleGroup.add(consoleDesk);

  shuttleGroup.position.set(0, 0, 0);
  scene.add(shuttleGroup);

  // 2b. The real shuttle model — placed OUTSIDE the window, visible through it
  import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
    new GLTFLoader().load('./space_shuttle.glb', (gltf) => {
      const ship = gltf.scene;
      ship.scale.setScalar(1.4);
      ship.position.set(6, 4, -40);
      ship.rotation.set(0, Math.PI * 0.15, Math.PI * 0.08);
      scene.add(ship);
      // gentle drift so it doesn't look like a frozen photo
      window.onStorylineUpdate((dt) => { ship.rotation.y += dt * 0.05; });
    }, undefined, (err) => {
      console.log('shuttle model failed to load:', err.message || err);
    });
  });

  // 3. Set Interaction Target
  const targetPos = { x: 0, z: -5 };
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Flight Controls' });

  // 4. Engine Thrust Lighting
  const engineLight = new THREE.PointLight(0xff5500, 0, 30);
  engineLight.position.set(0, 2, 8);
  scene.add(engineLight);

  // 5. Launch Button UI
  const prompt = document.createElement('button');
  prompt.textContent = 'IGNITE ENGINES';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'14px 24px', borderRadius:'10px', border:'none',
    background:'#B4623F', color:'#FFFDF8', fontWeight:'700',
    fontSize:'16px', zIndex:'10', display:'none', cursor:'pointer',
    boxShadow: '0 4px 12px rgba(180,98,63,0.4)'
  });
  document.body.appendChild(prompt);

  let isLaunching = false;
  let shakeIntensity = 0;

  prompt.addEventListener('click', () => {
    if(isLaunching) return;
    isLaunching = true;
    prompt.style.display = 'none';
    engineLight.intensity = 50;
    setTimeout(() => { advanceStoryline(); }, 3500);
  });

  // 6. Proximity Check & Cinematic Camera Shake
  window.onStorylineUpdate((dt, playerPos) => {
    if(isLaunching) {
       shakeIntensity += dt * 0.8;
       const power = Math.min(shakeIntensity, 1.5);
       shuttleGroup.position.x = (Math.random() - 0.5) * 0.3 * power;
       shuttleGroup.position.z = (Math.random() - 0.5) * 0.3 * power;
       engineLight.intensity = 30 + Math.random() * 40;
       return;
    }
    if(!playerPos || isLaunching) return;
    const dx = playerPos.x - targetPos.x;
    const dz = playerPos.z - targetPos.z;
    const inRange = Math.sqrt(dx*dx + dz*dz) < 2.5;
    prompt.style.display = inRange ? 'block' : 'none';
  });
}
