// storyline-2.js
export async function init({ scene, THREE, pointsOfInterest, advanceStoryline }) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();

  // Load the newly renamed space shuttle map
  loader.load(
    './space_shuttle.glb', 
    (gltf) => {
      const spaceMap = gltf.scene;
      
      // Adjust scale if the shuttle spawns too large or too small
      spaceMap.scale.set(1, 1, 1); 
      
      // Placed at x: 50 so it does not overlap with the first room
      spaceMap.position.set(50, 0, 0); 
      
      scene.add(spaceMap);
    },
    undefined,
    (error) => {
      console.error('Error loading the shuttle:', error);
    }
  );

  // Single interaction point inside the new shuttle
  const targetPos = { x: 50, z: -2 }; 
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Shuttle Controls' });

  // Create the interactive button
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

  // Check proximity to the shuttle controls
  window.onStorylineUpdate((dt, playerPos) => {
    if(!playerPos || done) return;
    const dx = playerPos.x - targetPos.x;
    const dz = playerPos.z - targetPos.z;
    
    // Shows button when player is within 3 units of the controls
    const inRange = Math.sqrt(dx*dx + dz*dz) < 3.0; 
    prompt.style.display = inRange ? 'block' : 'none';
  });
}

