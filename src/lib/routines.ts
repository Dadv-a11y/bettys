export type Routine = { slug:string; name:string; steps:string; productSlugs:string[]; saving:number };
export const ROUTINES: Routine[] = [
 { slug:'routine-eclat', name:'Routine éclat', steps:'Nettoyer → Exfolier → Hydrater → Protéger', productSlugs:['savon-noir','gommage-eclat','beurre-eclat','creme-solaire'], saving:0 },
 { slug:'routine-corps', name:'Routine corps', steps:'Nettoyer → Exfolier → Nourrir', productSlugs:['savon-noir','gommage-eclat','beurre-eclat'], saving:0 },
 { slug:'routine-quotidienne', name:'Routine quotidienne', steps:'Nettoyer → Protéger', productSlugs:['morceau-kojie-san','creme-solaire'], saving:0 },
];
