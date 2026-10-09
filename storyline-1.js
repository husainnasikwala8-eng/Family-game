// ===================== storyline-1.js — "The Keepsake Box" =====================
// Chapter 1. Uses only the helper API that's already wired up in index.html
// (window.createInteractable / spawnNPC / spawnItem / onStorylineUpdate),
// so it needs nothing from outside this one file — no downloaded terrain,
// no external models. The whole playable area is the existing flat yard
// (mapLimit = 14), so nothing here can walk a player off the edge.
//
// EASY TO RETHEME: everything you'd want to personalize — names, item
// labels, dialogue lines, colors — is in the CONFIG block right below.
// Swap "Grandma Fatima" for a real name, swap the three keepsakes for
// three things that actually mean something, and this becomes a real
// family moment instead of a placeholder.

const CONFIG = {
  npcName: 'Grandma Fatima',
  npcPos: { x: 0, z: -8 },
  introLine: 'Before you run off — three things of mine went missing around the yard. Will you find them for me?',
  outroLine: 'You found them all. Thank you, dear — come, sit with me a while.',
  keepsakes: [
    { label: 'Old Photograph', color: 0xC9A05C, x: -9, z: -3 },
    { label: "Grandfather's Watch", color: 0x7CFC98, x: 8, z: 4 },
    { label: 'Recipe Card', color: 0xE86A5C, x: -4, z: 9 },
  ],
};

export function init({ scene, THREE, advanceStoryline }) {
  // ---------- simple decoration so the yard doesn't feel empty, and so the
  // boundary reads as "a fenced yard" instead of an invisible wall ----------
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 });
  const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6);
  const MAP_LIMIT = 14;
  const POSTS_PER_SIDE = 14;
  for (let i = 0; i <= POSTS_PER_SIDE; i++) {
    const t = (i / POSTS_PER_SIDE) * (MAP_LIMIT * 2) - MAP_LIMIT;
    [[t, -MAP_LIMIT], [t, MAP_LIMIT], [-MAP_LIMIT, t], [MAP_LIMIT, t]].forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(x, 0.55, z);
      scene.add(post);
    });
  }

  const bushMat = new THREE.MeshStandardMaterial({ color: 0x4f7a4a, roughness: 1 });
  const bushPositions = [[-11, -11], [11, -11], [-11, 11], [11, 11], [0, -12], [0, 12]];
  bushPositions.forEach(([x, z]) => {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), bushMat);
    bush.position.set(x, 0.7, z);
    scene.add(bush);
  });

  // ---------- the NPC who starts the quest ----------
  const npc = window.spawnNPC({ x: CONFIG.npcPos.x, z: CONFIG.npcPos.z, name: CONFIG.npcName });

  // A gentle idle bob so she doesn't look frozen in place.
  const npcBaseY = npc.model.position.y;
  window.onStorylineUpdate((dt) => {
    npc._t = (npc._t || 0) + dt;
    npc.model.position.y = npcBaseY + Math.sin(npc._t * 1.5) * 0.02;
  });

  let introShown = false;
  window.createInteractable({
    x: CONFIG.npcPos.x, z: CONFIG.npcPos.z, radius: 2.4,
    label: CONFIG.npcName,
    promptText: `Talk to ${CONFIG.npcName}`,
    onInteract: () => {
      if (!introShown) {
        introShown = true;
        setStoryBanner(CONFIG.introLine);
      } else {
        setStoryBanner(progressLine());
      }
    },
  });

  // ---------- the three keepsakes ----------
  CONFIG.keepsakes.forEach((k) => {
    window.spawnItem({ x: k.x, z: k.z, label: k.label, color: k.color });
  });

  function progressLine() {
    const found = CONFIG.keepsakes.filter((k) => window.inventory.includes(k.label)).length;
    const total = CONFIG.keepsakes.length;
    return found >= total
      ? 'I have everything — come find me!'
      : `Found ${found} of ${total} so far. Keep looking.`;
  }

  // ---------- turning them in, once all three are collected ----------
  let turnedIn = false;
  window.onStorylineUpdate((dt, playerPos) => {
    if (turnedIn || !playerPos) return;
    const allFound = CONFIG.keepsakes.every((k) => window.inventory.includes(k.label));
    if (!allFound) return;

    const dx = playerPos.x - CONFIG.npcPos.x, dz = playerPos.z - CONFIG.npcPos.z;
    if (Math.sqrt(dx * dx + dz * dz) < 2.4) {
      turnedIn = true;
      setStoryBanner(CONFIG.outroLine);
      CONFIG.keepsakes.forEach((k) => {
        const idx = window.inventory.indexOf(k.label);
        if (idx !== -1) window.inventory.splice(idx, 1);
      });
      setTimeout(() => advanceStoryline(), 3000);
    }
  });

  // ---------- small on-screen banner for story lines (separate from the
  // green debug status line, so narrative text has its own clear space) ----------
  function setStoryBanner(text) {
    let el = document.getElementById('story-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'story-banner';
      Object.assign(el.style, {
        position: 'fixed', left: '50%', top: '18px', transform: 'translateX(-50%)',
        maxWidth: '86vw', padding: '10px 18px', borderRadius: '12px',
        background: 'rgba(20,14,8,0.78)', color: '#F2E9D8',
        fontFamily: "'Fraunces',serif", fontSize: '15px', textAlign: 'center',
        zIndex: '12', transition: 'opacity 0.3s ease',
      });
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(setStoryBanner._t);
    setStoryBanner._t = setTimeout(() => { el.style.opacity = '0'; }, 4500);
  }
}
