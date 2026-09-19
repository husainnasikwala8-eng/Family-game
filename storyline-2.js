// storyline-2.js
export async function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  
  // 1. Find the default green ground from your index file and hide it
  scene.children.forEach(child => {
    if (child.isMesh && child.geometry.type === 'PlaneGeometry' && child.material.color.getHex() === 0x5C7A5C) {
      child.visible = false;
    }
  });

  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();

  // 2. Load the space shuttle map
  loader.load(
    './space_shuttle.glb', 
    (gltf) => {
      const spaceMap = gltf.scene;
      
      spaceMap.scale.set(1, 1, 1); 
      
      // Spawn exactly at the player's starting coordinates
      // We raise it by 0.05 so the floor doesn't clip into the void
      spaceMap.position.set(0, 0.05, 0); 
      
      scene.add(spaceMap);
    },
    undefined,
    (error) => {
      console.error('Error loading the shuttle:', error);
    }
  );

  // 3. Set the target directly in front of where the player spawns
  const targetPos = { x: 0, z: -4 }; 
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Shuttle Controls' });

  // 4. Create the interactive button
  const prompt = document.createElement('button');
  prompt.textContent = 'Launch Shuttle';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'12px 22px', borderRadius:'14px', border:'none',
    background:'rgba(180, 98, 63, 0.9)', color:'#FFFDF8', fontWeight:'700',
    fontSize:'15px', zIndex:'10', display:'none', cursor:'pointer'
  });
  document.body.appendChild(prompt);

  let done = false;
  prompt.addEventListener('click', () => {
    if(done) return;
    done = true;
    prompt.textContent = 'Engines Fired ✓';
    prompt.style.background = '#5C7A5C'; 
    
    setTimeout(() => { 
      prompt.style.display = 'none'; 
      advanceStoryline();
    }, 1500);
  });

  // 5. Proximity detection
  window.onStorylineUpdate((dt, playerPos) => {
    if(!playerPos || done) return;
    const dx = playerPos.x - targetPos.x;
    const dz = playerPos.z - targetPos.z;
    
    const inRange = Math.sqrt(dx*dx + dz*dz) < 3.0; 
    prompt.style.display = inRange ? 'block' : 'none';
  });
}
