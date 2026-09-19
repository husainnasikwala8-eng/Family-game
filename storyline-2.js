// storyline-2.js
export async function init({ scene, THREE, pointsOfInterest, advanceStoryline }){
  // 1. Import the GLTFLoader using the importmap already set up in your index file
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();

  // 2. Load the downloaded space map model
  // Change './space-station.glb' to whatever you named your downloaded file
  loader.load(
    './space-station.glb', 
    (gltf) => {
      const spaceMap = gltf.scene;
      
      // Scale and position the map. 
      // If the map is too big or small, adjust the scale values below.
      spaceMap.scale.set(1, 1, 1);
      
      // We offset this map by 50 units on the X-axis so it doesn't overlap 
      // with the procedural room generated in storyline-1.js
      spaceMap.position.set(50, 0, 0); 
      
      scene.add(spaceMap);
    },
    undefined,
    (error) => {
      console.error('Error loading the space map GLB:', error);
    }
  );

  // 3. Set up the 3D interaction target
  // Because we shifted the map to x: 50, we place the interaction point there too.
  // Adjust the Z coordinate based on where you want the console to be in the new map.
  const targetPos = { x: 50, z: -5 }; 
  
  // Add a marker for the minimap so the player knows where to go
  pointsOfInterest.push({ x: targetPos.x, z: targetPos.z, label: 'Navigation Computer' });

  // 4. Create the interactive button prompt
  const prompt = document.createElement('button');
  prompt.textContent = 'Access Navigation';
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
    prompt.textContent = 'Course Plotted ✓';
    prompt.style.background = '#5C7A5C'; 
    
    setTimeout(() => { 
      prompt.style.display = 'none'; 
      advanceStoryline();
    }, 1500);
  });

  // 5. Proximity trigger checks the player's distance to the target position
  window.onStorylineUpdate((dt, playerPos) => {
    if(!playerPos || done) return;
    const dx = playerPos.x - targetPos.x;
    const dz = playerPos.z - targetPos.z;
    
    // If the player is within 3 units of the target, show the button
    const inRange = Math.sqrt(dx*dx + dz*dz) < 3.0; 
    prompt.style.display = inRange ? 'block' : 'none';
  });
}

