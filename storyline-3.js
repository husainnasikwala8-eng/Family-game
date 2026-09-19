// storyline-3.js
export function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  
  // 1. Erase the simulation's green ground to reveal the void
  scene.children.forEach(child => {
    if (child.isMesh && child.geometry.type === 'PlaneGeometry' && child.material.color.getHex() === 0x5C7A5C) {
      child.visible = false;
    }
  });

  // 2. The Void Environment Setup
  scene.background = new THREE.Color(0x050508);
  scene.fog = new THREE.FogExp2(0x050508, 0.02);

  const levelGroup = new THREE.Group();
  scene.add(levelGroup);

  // --- HD MATERIALS ---
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, metalness: 0.9, roughness: 0.1 });
  const gridMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.5, roughness: 0.8 });
  const neonCyan = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2.0 });
  const neonMagenta = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 2.0 });
  const goldCore = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 1.0, roughness: 0.2, emissive: 0x884400, emissiveIntensity: 1.5 });

  // 3. Sector 18: The Grand Platform
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(25, 28, 1, 32), obsidianMat);
  platform.position.set(0, -0.5, 0);
  levelGroup.add(platform);

  const grid = new THREE.GridHelper(50, 25, 0x00ffff, 0x111111);
  grid.position.y = 0.01;
  levelGroup.add(grid);

  // 4. Raigad-Class Monolithic Pillars
  const pillarGeom = new THREE.BoxGeometry(2, 20, 2);
  const ringGeom = new THREE.TorusGeometry(1.5, 0.1, 8, 24);
  const numPillars = 8;
  const radius = 18;

  for (let i = 0; i < numPillars; i++) {
    const angle = (i / numPillars) * Math.PI * 2;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const pillar = new THREE.Mesh(pillarGeom, obsidianMat);
    pillar.position.set(px, 10, pz);
    pillar.lookAt(0, 10, 0);
    levelGroup.add(pillar);

    // Add glowing neon rings to each pillar
    const ring = new THREE.Mesh(ringGeom, i % 2 === 0 ? neonCyan : neonMagenta);
    ring.position.set(px, 2, pz);
    ring.rotation.y = angle;
    ring.rotation.x = Math.PI / 2;
    levelGroup.add(ring);
  }

  // 5. The HN Visuals Mainframe Core (Procedural Hologram)
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 4, 0);
  levelGroup.add(coreGroup);

  const coreMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.4, 128, 16), goldCore);
  coreGroup.add(coreMesh);

  const outerSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 1), neonCyan);
  outerSphere.material.wireframe = true;
  outerSphere.material.transparent = true;
  outerSphere.material.opacity = 0.3;
  coreGroup.add(outerSphere);

  // 6. Floating Data Streams (InstancedMesh for Mobile 60FPS Performance)
  const dataCount = 150;
  const dataGeom = new THREE.BoxGeometry(0.1, 0.5, 0.1);
  const dataInstanced = new THREE.InstancedMesh(dataGeom, neonCyan, dataCount);
  const dummy = new THREE.Object3D();
  const dataSpeeds = [];

  for (let i = 0; i < dataCount; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 15;
    const z = (Math.random() - 0.5) * 10;
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    dataInstanced.setMatrixAt(i, dummy.matrix);
    dataSpeeds.push(0.02 + Math.random() * 0.05);
  }
  levelGroup.add(dataInstanced);

  // 7. Dynamic Lighting Rig
  const coreLight = new THREE.PointLight(0xffaa00, 5, 20);
  coreLight.position.set(0, 4, 0);
  levelGroup.add(coreLight);

  const cyanLight = new THREE.PointLight(0x00ffff, 3, 30);
  cyanLight.position.set(10, 5, 10);
  levelGroup.add(cyanLight);

  const magentaLight = new THREE.PointLight(0xff0055, 3, 30);
  magentaLight.position.set(-10, 5, -10);
  levelGroup.add(magentaLight);

  // 8. The Objective Terminal
  const terminalPos = { x: 0, z: 6 };
  const terminalBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1), obsidianMat);
  terminalBase.position.set(terminalPos.x, 0.6, terminalPos.z);
  levelGroup.add(terminalBase);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), neonMagenta);
  screen.position.set(terminalPos.x, 1.4, terminalPos.z - 0.4);
  screen.rotation.x = -0.4;
  levelGroup.add(screen);

  pointsOfInterest.push({ x: terminalPos.x, z: terminalPos.z, label: 'Master Server' });

  // 9. Cyberpunk UI Interaction
  const prompt = document.createElement('button');
  prompt.textContent = 'INITIATE BURHANUDDIN PROTOCOL';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'16px 28px', borderRadius:'8px', border:'2px solid #00ffff',
    background:'rgba(5, 5, 8, 0.9)', color:'#00ffff', fontWeight:'800',
    fontSize:'14px', letterSpacing:'1px', zIndex:'10', display:'none', cursor:'pointer',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)', textTransform: 'uppercase'
  });
  document.body.appendChild(prompt);

  let isDecrypted = false;
  let time = 0;

  prompt.addEventListener('click', () => {
    if(isDecrypted) return;
    isDecrypted = true;
    
    // Cinematic hack sequence
    prompt.style.background = '#ff0055';
    prompt.style.color = '#fff';
    prompt.style.borderColor = '#ff0055';
    prompt.style.boxShadow = '0 0 25px rgba(255, 0, 85, 0.8)';
    prompt.textContent = 'DECRYPTING HN-VISUALS MAINFRAME...';
    
    coreLight.color.setHex(0xff0055);
    outerSphere.material.color.setHex(0xff0055);
    
    setTimeout(() => { 
      prompt.textContent = 'ACCESS GRANTED';
      setTimeout(() => {
        prompt.style.display = 'none';
        advanceStoryline();
      }, 1500);
    }, 2500);
  });

  // 10. The 60FPS Animation Loop
  window.onStorylineUpdate((dt, playerPos) => {
    time += dt;

    // Spin and float the Mainframe Core
    if (coreGroup) {
      coreGroup.rotation.y += dt * 0.5;
      coreGroup.rotation.x += dt * 0.2;
      coreGroup.position.y = 4 + Math.sin(time * 2) * 0.5;
    }

    // Spin the outer wireframe cage in reverse
    if (outerSphere) {
      outerSphere.rotation.y -= dt * 0.8;
      outerSphere.rotation.z += dt * 0.3;
      
      // Expand rapidly during decryption
      if (isDecrypted) {
        outerSphere.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
      }
    }

    // Animate the floating data streams upwards
    if (dataInstanced) {
      for (let i = 0; i < dataCount; i++) {
        dataInstanced.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        
        dummy.position.y += dataSpeeds[i] * (isDecrypted ? 5 : 1); // Speed up if hacked
        if (dummy.position.y > 15) dummy.position.y = 0;
        
        dummy.updateMatrix();
        dataInstanced.setMatrixAt(i, dummy.matrix);
      }
      dataInstanced.instanceMatrix.needsUpdate = true;
    }

    // Proximity check for the UI button
    if(!playerPos || isDecrypted) return;
    const dx = playerPos.x - terminalPos.x;
    const dz = playerPos.z - terminalPos.z;
    const inRange = Math.sqrt(dx*dx + dz*dz) < 3.5; 
    prompt.style.display = inRange ? 'block' : 'none';
  });
}

