// storyline-1.js
export function init({ scene, THREE, spawnCharacter, pointsOfInterest, advanceStoryline }){
  // ---- Spaceship interior ----
  const roomSize = 28; 
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.7, roughness: 0.4 });
  const wallMat  = new THREE.MeshStandardMaterial({ color: 0x21262c, metalness: 0.5, roughness: 0.6 });
  const glowMat  = new THREE.MeshStandardMaterial({ color: 0x2fd1e8, emissive: 0x2fd1e8, emissiveIntensity: 1.5 });

  // deck floor + panel grid
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), metalMat);
  floor.rotation.x = -Math.PI/2;
  floor.position.y = 0.02;
  scene.add(floor);
  
  const grid = new THREE.GridHelper(roomSize, 14, 0x2fd1e8, 0x1a1f24);
  grid.position.y = 0.03;
  scene.add(grid);

  // walls with a glowing base strip
  const wallHeight = 6, half = roomSize/2;
  const wallDefs = [
    { pos:[0,wallHeight/2,-half], size:[roomSize,wallHeight,0.4] },
    { pos:[0,wallHeight/2, half], size:[roomSize,wallHeight,0.4] },
    { pos:[-half,wallHeight/2,0], size:[0.4,wallHeight,roomSize] },
    { pos:[ half,wallHeight/2,0], size:[0.4,wallHeight,roomSize] },
  ];
  
  wallDefs.forEach(w => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
    wall.position.set(...w.pos);
    scene.add(wall);
    
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w.size[0]*0.9, 0.15, w.size[2]===roomSize ? roomSize*0.9 : 0.15), glowMat);
    strip.position.set(w.pos[0], 0.3, w.pos[2]);
    scene.add(strip);
  });

  // main console — this storyline's objective
  const consolePos = { x: 8, z: 8 };
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 0.9), wallMat);
  base.position.set(consolePos.x, 0.5, consolePos.z);
  scene.add(base);
  
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.08), glowMat);
  screen.position.set(consolePos.x, 1.1, consolePos.z - 0.4);
  screen.rotation.x = -0.3;
  scene.add(screen);

  // This links directly to your index file's minimap logic
  pointsOfInterest.push({ x: consolePos.x, z: consolePos.z, label: 'Main Console' });

  // ---- interact prompt ----
  const prompt = document.createElement('button');
  prompt.textContent = 'Power up Console';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'12px 22px', borderRadius:'14px', border:'none',
    background:'rgba(47,209,232,0.9)', color:'#0b1a1e', fontWeight:'700',
    fontSize:'15px', zIndex:'10', display:'none', cursor:'pointer'
  });
  document.body.appendChild(prompt);

  let done = false;
  prompt.addEventListener('click', () => {
    if(done) return;
    done = true;
    prompt.textContent = 'Systems online ✓';
    prompt.style.background = '#7CFC98'; 
    
    // Remove the button and advance the storyline in your Firebase database
    setTimeout(() => { 
      prompt.style.display = 'none'; 
      advanceStoryline();
    }, 1500);
  });

  // Check distance to show/hide the button
  window.onStorylineUpdate((dt, playerPos) => {
    if(!playerPos || done) return;
    const dx = playerPos.x - consolePos.x;
    const dz = playerPos.z - consolePos.z;
    const inRange = Math.sqrt(dx*dx + dz*dz) < 2.2;
    prompt.style.display = inRange ? 'block' : 'none';
  });
}
