export type Category = 'visage'|'corps'|'savons'|'gommages'|'solaire'|'packs';
export type Product = {
  slug:string; name:string; price:number; oldPrice?:number; description:string; images:string[];
  category:Category; type:string; needs:string[]; skinTypes:string[]; zone:string;
  ingredients?:string; usage?:string; precautions?:string; inStock:boolean; badge?:string;
  reviews:{author?:string;rating:number;text:string}[]; related:string[];
};
const b = { images:[], skinTypes:[], inStock:true, reviews:[], related:[] };
export const PRODUCTS: Product[] = [
 {...b,slug:'pack-kojie-san',name:'Pack de Kojie San',price:12500,description:'Pack de savons Kojie San.',category:'savons',type:'Savon',needs:['Éclat','Nettoyage'],zone:'Visage & corps',badge:'Populaire'},
 {...b,slug:'morceau-kojie-san',name:'Morceau Kojie San',price:4500,description:'Savon Kojie San à l’unité.',category:'savons',type:'Savon',needs:['Éclat','Nettoyage'],zone:'Visage & corps'},
 {...b,slug:'savon-noir',name:'Savon noir',price:5000,description:'Savon noir pour nettoyer la peau.',category:'savons',type:'Savon',needs:['Nettoyage'],zone:'Visage & corps',badge:'Bestseller'},
 {...b,slug:'creme-solaire',name:'Crème solaire',price:5000,description:'Crème solaire pour protéger la peau.',category:'solaire',type:'Solaire',needs:['Protection'],zone:'Visage'},
 {...b,slug:'gommage-eclat',name:'Gommage éclat',price:5000,description:'Gommage pour une peau plus lumineuse.',category:'gommages',type:'Gommage',needs:['Éclat','Exfoliation'],zone:'Corps',badge:'Bestseller'},
 {...b,slug:'beurre-eclat',name:'Beurre éclat',price:5000,description:'Beurre corporel pour nourrir et illuminer la peau.',category:'corps',type:'Beurre',needs:['Éclat','Hydratation'],zone:'Corps',badge:'Bestseller'},
 {...b,slug:'gamme-19500',name:'Gamme complète 19 500',price:19500,description:'Gamme de soins complète (composition à confirmer).',category:'packs',type:'Pack',needs:['Routine'],zone:'Visage & corps',badge:'Pack'},
 {...b,slug:'gamme-20000',name:'Gamme complète 20 000',price:20000,description:'Gamme de soins complète (composition à confirmer).',category:'packs',type:'Pack',needs:['Routine'],zone:'Visage & corps',badge:'Pack'},
 {...b,slug:'gamme-27500',name:'Gamme complète 27 500',price:27500,description:'Gamme étendue (composition à confirmer).',category:'packs',type:'Pack',needs:['Routine'],zone:'Visage & corps',badge:'Pack'},
];
export const CATEGORIES: {slug:Category;fr:string;en:string}[] = [
 {slug:'visage',fr:'Visage',en:'Face'},{slug:'corps',fr:'Corps',en:'Body'},{slug:'savons',fr:'Savons',en:'Soaps'},
 {slug:'gommages',fr:'Gommages',en:'Scrubs'},{slug:'solaire',fr:'Protection solaire',en:'Sun protection'},{slug:'packs',fr:'Packs & routines',en:'Packs & routines'}];
export const NEEDS = ['Éclat','Hydratation','Nettoyage','Protection','Exfoliation','Routine'];
export const fcfa = (n:number)=> n.toLocaleString('fr-FR').replace(/\u202f/g,' ')+' FCFA';
export const bySlug = (s:string)=>PRODUCTS.find(p=>p.slug===s);
export const inCategory = (c:Category)=>PRODUCTS.filter(p=>p.category===c||(c==='visage'&&/Visage/.test(p.zone)));
export const waLink = (msg:string)=>`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '237691623686'}?text=${encodeURIComponent(msg)}`;
export const thumb = (u: string) => u.startsWith('/uploads/') ? u.replace(/\.webp$/, '-sm.webp') : u;
