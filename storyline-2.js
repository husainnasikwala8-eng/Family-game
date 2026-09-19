export function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  // 1. Hide the core engine's default green ground completely
  scene.children.forEach(child => {
    if (child.isMesh && child.geometry.type === 'PlaneGeometry' && child.material.color.getHex() === 0x5C7A5C) {
      child.visible = false;
    }
  });

  // 2. Build the Shuttle Interior dynamically (No external files needed)
  const shuttleGroup = new THREE.Group();
  
  // Materials
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.1, roughness: 0.9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xB4623F }); // Matches your UI maroon
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Space window

  // Shuttle Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 16), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.05; // Slightly above 0 to prevent visual glitching
  shuttleGroup.add(floor);

  // Shuttle Walls (Left, Right, Back)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 16), wallMat);
  leftWall.position.set(-4, 2, 0);
  shuttleGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 16), wallMat);
  rightWall.position.set(4, 2, 0);
  shuttleGroup.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), wallMat);
  backWall.position.set(0, 2, 8);
  shuttleGroup.add(backWall);

  // Front Viewport (Space Window)
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), accentMat);
  windowFrame.position.set(0, 2, -8);
  shuttleGroup.add(windowFrame);
  
  const spaceGlass = new THREE.Mesh(new THREE.PlaneGeometry(7, 3), glassMat);
  spaceGlass.position.set(0, 2, -7.74);
  shuttleGroup.add(spaceGlass);

  // Flight Console
  const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1), accentMat);
  consoleDesk.position.set(0, 0.5, -6);
  shuttleGroup.add(consoleDesk);

  // Add the entire shuttle to the scene at the player's spawn point
  shuttleGroup.position.set(0, 0, 0);
  scene.add(shuttleGroup);

  // 3. Set Interaction Target
  const targetPos = { x: 0, z: -5 }; 
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Flight Controls' });

  // 4. Add Engine Thrust Lighting
  const engineLight = new THREE.PointLight(0xff5500, 0, 30);
  engineLight.position.set(0, 2, 8); // At the back of the shuttle
  scene.add(engineLight);

  // 5. Create the Launch Button UI
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
    
    // Simulate engine ignition
    engineLight.intensity = 50; 
    
    // Shake for 3.5 seconds, then load Level 3
    setTimeout(() => { 
      advanceStoryline();
    }, 3500);
  });

  // 6. Proximity Check & Cinematic Camera Shake
  window.onStorylineUpdate((dt, playerPos) => {
    if(isLaunching) {
       // Shake the entire shuttle group dynamically
       shakeIntensity += dt * 0.8; 
       const power = Math.min(shakeIntensity, 1.5);
       
       shuttleGroup.position.x = (Math.random() - 0.5) * 0.3 * power;
       shuttleGroup.position.z = (Math.random() - 0.5) * 0.3 * power;
       
       // Flicker the thrust lighting
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
