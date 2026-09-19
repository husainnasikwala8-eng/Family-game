// storyline-2.js
export async function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();

  // 1. Load the new Sketchfab spaceship map
  loader.load(
    './sketchfab_spaceship.glb', 
    (gltf) => {
      const spaceMap = gltf.scene;
      
      // Sketchfab models often import very small or very large.
      // Adjust these numbers (e.g., 0.5 or 5) if the ship is the wrong size.
      spaceMap.scale.set(2, 2, 2); 
      
      // Move this map 100 units away so it doesn't collide with previous maps
      spaceMap.position.set(100, 0, 0); 
      
      scene.add(spaceMap);
    },
    undefined,
    (error) => {
      console.error('Error loading the Sketchfab map:', error);
    }
  );

  // 2. Set the interactive target location inside the new map
  const targetPos = { x: 100, z: 2 }; 
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Airlock Controls' });

  // 3. Create the interaction button
  const prompt = document.createElement('button');
  prompt.textContent = 'Override Airlock';
  Object.assign(prompt.style, {
    position:'fixed', left:'50%', bottom:'110px', transform:'translateX(-50%)',
    padding:'12px 22px', borderRadius:'14px', border:'none',
    background:'rgba(92, 122, 92, 0.9)', color:'#FFFDF8', fontWeight:'700',
    fontSize:'15px', zIndex:'10', display:'none', cursor:'pointer'
  });
  document.body.appendChild(prompt);

  let done = false;
  prompt.addEventListener('click', () => {
    if(done) return;
    done = true;
    prompt.textContent = 'Airlock Opened ✓';
    prompt.style.background = '#8C4A30'; 
    
    setTimeout(() => { 
      prompt.style.display = 'none'; 
      advanceStoryline();
    }, 1500);
  });

  // 4. Proximity detection linked to the core engine
  window.onStorylineUpdate((dt, playerPos) => {
    if(!playerPos || done) return;
    const dx = playerPos.x - targetPos.x;
    const dz = playerPos.z - targetPos.z;
    const inRange = Math.sqrt(dx*dx + dz*dz) < 3.5; 
    prompt.style.display = inRange ? 'block' : 'none';
  });
}

