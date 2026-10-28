// Shared rules for portal, classroom board and server. No level cap.
export const CLASSES=['La mia classe'];
export const MASCOT_VERSION=2;
export const MASCOT_CATALOG={
  marmot:{name:'Marmotta',subject:'La marmotta'},
  fox:{name:'Volpe',subject:'La volpe',sheet:'mascotte-atlas.webp',row:0,rows:3},
  cat:{name:'Gatto',subject:'Il gatto',sheet:'mascotte-atlas.webp',row:1,rows:3},
  bear:{name:'Orso',subject:'L’orso',sheet:'mascotte-atlas.webp',row:2,rows:3},
  owl:{name:'Gufo',subject:'Il gufo',sheet:'mascotte-bosco.webp',row:0,rows:4},
  rabbit:{name:'Coniglio',subject:'Il coniglio',sheet:'mascotte-bosco.webp',row:1,rows:4},
  panda:{name:'Panda',subject:'Il panda',sheet:'mascotte-bosco.webp',row:2,rows:4},
  penguin:{name:'Pinguino',subject:'Il pinguino',sheet:'mascotte-bosco.webp',row:3,rows:4},
  koala:{name:'Koala',subject:'Il koala',sheet:'mascotte-savana.webp',row:0,rows:3},
  tiger:{name:'Tigre',subject:'La tigre',sheet:'mascotte-savana.webp',row:1,rows:3},
  lion:{name:'Leone',subject:'Il leone',sheet:'mascotte-savana.webp',row:2,rows:3},
  raccoon:{name:'Procione',subject:'Il procione',sheet:'mascotte-rifugio.webp',row:0,rows:3},
  hedgehog:{name:'Riccio',subject:'Il riccio',sheet:'mascotte-rifugio.webp',row:1,rows:3},
  otter:{name:'Lontra',subject:'La lontra',sheet:'mascotte-rifugio.webp',row:2,rows:3},
  wolf:{name:'Lupo',subject:'Il lupo',sheet:'mascotte-montagna.webp',row:0,rows:3},
  deer:{name:'Cerbiatto',subject:'Il cerbiatto',sheet:'mascotte-montagna.webp',row:1,rows:3},
  redpanda:{name:'Panda rosso',subject:'Il panda rosso',sheet:'mascotte-montagna.webp',row:2,rows:3},
};
export const MASCOTS=Object.fromEntries(Object.entries(MASCOT_CATALOG).map(([id,m])=>[id,m.name]));
export const CLASS_MASCOTS={};
export function defaultMascot(classId){return CLASS_MASCOTS[classId]||'marmot';}
export function resolveMascot(profile={},classId){
  // Old profiles all defaulted to marmot. Keep deliberate alternative choices;
  // new choices (including marmot) carry a version and are never reassigned.
  return Object.hasOwn(MASCOTS,profile.mascot)&&(profile.mascot!=='marmot'||profile.mascotVersion===MASCOT_VERSION)?profile.mascot:defaultMascot(classId);
}
export function mascotStyle(id){
  const m=MASCOT_CATALOG[id]||MASCOT_CATALOG.marmot;
  return m.sheet?`--mascot-sheet:url('./assets/${m.sheet}');--mascot-size:400% ${m.rows*100}%;--mascot-row:${m.row/(m.rows-1)*100}%`:"--mascot-sheet:url('./assets/marmotta.svg');--mascot-size:contain;--mascot-row:50%";
}
export function levelAt(number){const n=Math.max(1,Math.floor(number));return 900*(n-1)**2;}
export function level(points){
  const p=Math.max(0,Number(points)||0),number=Math.floor(Math.sqrt(p/900))+1,at=levelAt(number),next=levelAt(number+1);
  const names=['Pisolino','Sonno leggero','Sonno profondo','Letargo','Letargo alpino','Sogno d’alta quota','Guardiano della Valle','Mascotte d’oro','Custode delle vette','Leggenda alpina','Stella del silenzio','Campione della calma'];
  return {number,name:names[number-1]||`Leggenda del silenzio ${number-12}`,at,next,progress:Math.min(100,Math.max(0,(p-at)/(next-at)*100))};
}
