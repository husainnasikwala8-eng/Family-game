// storyline-3.js
export async function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  
  // 1. Erase the simulation's green ground to reveal the void
  scene.children.forEach(child => {
    if (child.isMesh && child.geometry.type === 'PlaneGeometry') {
      child.visible = false;
    }
  });

  // 2. The Void Environment Setup
  scene.background = new THREE.Color(0x020205);
  scene.fog = new THREE.FogExp2(0x020205, 0.015);

  const spaceGroup = new THREE.Group();
  scene.add(spaceGroup);

  // --- LAYER 1: THE STARFIELD ---
  const starGeom = new THREE.BufferGeometry();
  const starCount = 4000;
  const starPos = new Float32Array(starCount * 3);
  for(let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 300;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starGeom, starMat);
  spaceGroup.add(stars);

  // --- LAYER 2: MASSIVE RINGED PLANET ---
  const planetGroup = new THREE.Group();
  planetGroup.position.set(-60, -20, -100);
  spaceGroup.add(planetGroup);

  const planetCore = new THREE.Mesh(
    new THREE.SphereGeometry(25, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a2b4c, roughness: 0.7, metalness: 0.2 })
  );
  planetGroup.add(planetCore);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(26.5, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15, side: THREE.BackSide })
  );
  planetGroup.add(atmosphere);

  const rings = new THREE.Mesh(
    new THREE.TorusGeometry(40, 4, 2, 128),
    new THREE.MeshStandardMaterial({ color: 0x885533, transparent: true, opacity: 0.7, roughness: 0.9 })
  );
  rings.rotation.x = Math.PI / 1.8;
  planetGroup.add(rings);

  // --- LAYER 3: MOVING ASTEROID FIELD ---
  const meteorCount = 150;
  const meteorGeom = new THREE.DodecahedronGeometry(1.2, 1);
  const meteorMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9, metalness: 0.1 });
  const meteors = new THREE.InstancedMesh(meteorGeom, meteorMat, meteorCount);
  
  const dummy = new THREE.Object3D();
  const meteorData = [];
  for(let i = 0; i < meteorCount; i++) {
    meteorData.push({
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 150,
      rx: Math.random() * 0.05,
      ry: Math.random() * 0.05,
      speed: 0.2 + Math.random() * 0.5
    });
  }
  spaceGroup.add(meteors);

  // --- LAYER 4: PILOTING THE UPLOADED SHUTTLE ---
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();
  let shuttleMesh = null;

  loader.load(
    './space_shuttle.glb', 
    (gltf) => {
      shuttleMesh = gltf.scene;
      shuttleMesh.scale.set(1.5, 1.5, 1.5); 
      scene.add(shuttleMesh);
      
      // Hide the default human characters so only the ship is visible
      scene.traverse((child) => {
        if (child.isSkinnedMesh) child.visible = false;
        if (child.isCSS2DObject) child.visible = false; // Hides floating name tags
      });
    },
    undefined,
    (error) => console.error("Could not load space_shuttle.glb. Ensure spelling is exact.", error)
  );

  // Cinematic Hyperjump Prompt
  const prompt = document.createElement('button');
  prompt.textContent = 'INITIATE WARP JUMP';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'14px 24px', borderRadius:'10px', border:'none',
    background:'#B4623F', color:'#FFFDF8', fontWeight:'700', 
    fontSize:'16px', zIndex:'10', display:'none', cursor:'pointer',
    boxShadow: '0 4px 12px rgba(180,98,63,0.5)'
  });
  document.body.appendChild(prompt);

  const warpTarget = { x: 0, z: -30 };
  pointsOfInterest.push({ x: warpTarget.x, z: warpTarget.z, label: 'Warp Gate' });

  // Add a glowing warp gate to navigate towards
  const gate = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.5, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0x7CFC98, emissive: 0x7CFC98, emissiveIntensity: 2.0 })
  );
  gate.position.set(warpTarget.x, 2, warpTarget.z);
  scene.add(gate);

  let jumping = false;
  prompt.addEventListener('click', () => {
    if(jumping) return;
    jumping = true;
    prompt.textContent = 'WARP ENGAGED';
    prompt.style.background = '#7CFC98';
    prompt.style.color = '#000';
    
    // Simulate jumping to lightspeed before advancing
    setTimeout(() => { 
      prompt.style.display = 'none'; 
      advanceStoryline();
    }, 2000);
  });

  // --- THE 60-FPS CINEMATIC RENDER LOOP ---
  let lastX = 0, lastZ = 0;

  window.onStorylineUpdate((dt, playerPos) => {
    // 1. Rotate the planet
    planetGroup.rotation.y += dt * 0.05;

    // 2. Animate the Asteroid Field
    for (let i = 0; i < meteorCount; i++) {
      let data = meteorData[i];
      data.z += data.speed; // Meteors fly past you continuously
      
      // Infinite looping: if meteor goes behind the camera, reset it far ahead
      if (data.z > 80) data.z = -80;
      
      dummy.position.set(data.x, data.y, data.z);
      dummy.rotation.x += data.rx;
      dummy.rotation.y += data.ry;
      dummy.updateMatrix();
      meteors.setMatrixAt(i, dummy.matrix);
    }
    meteors.instanceMatrix.needsUpdate = true;

    // 3. Sync the shuttle perfectly to the engine controls
    if (playerPos && shuttleMesh) {
      // Hover the ship slightly above the void
      shuttleMesh.position.set(playerPos.x, playerPos.y + 1, playerPos.z);
      
      // Calculate movement direction to rotate the ship accurately
      const dx = playerPos.x - lastX;
      const dz = playerPos.z - lastZ;
      
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        // Smoothly point the nose of the ship in the direction of travel
        const targetAngle = Math.atan2(dx, dz);
        shuttleMesh.rotation.y = targetAngle;
      }
      
      lastX = playerPos.x;
      lastZ = playerPos.z;

      // Warp Gate Proximity Trigger
      if (!jumping) {
        const dist = Math.sqrt(Math.pow(playerPos.x - warpTarget.x, 2) + Math.pow(playerPos.z - warpTarget.z, 2));
        prompt.style.display = dist < 5.0 ? 'block' : 'none';
      }
    }
    
    // Warp acceleration animation
    if (jumping && shuttleMesh) {
       shuttleMesh.position.z -= 2.5; // Blast the ship forward into the gate
    }
  });
}

