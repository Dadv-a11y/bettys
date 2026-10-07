'use client';
import { useState } from 'react';
import { thumb } from '@/lib/products';
export default function ImageField({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState(initial); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); e.target.value = ''; setBusy(true); setErr('');
    for (const f of files) {
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch('/admin/upload', { method: 'POST', body: fd }); const j = await r.json().catch(() => ({}));
      if (r.ok) setUrls(u => [...u, j.url]); else setErr(`${f.name} : ${j.error ?? 'échec du téléversement'}`);
    }
    setBusy(false);
  }
  return (<fieldset style={{border:'1px solid var(--line)',padding:'10px 14px'}}><legend>Images (la première est l’image principale)</legend>
    <input type="hidden" name="images" value={urls.join('\n')}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:10}}>{urls.map((u, i) => (<div key={u} style={{display:'grid',gap:4}}>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={thumb(u)} alt="" style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/>
      <div style={{display:'flex',gap:4}}>{i > 0 && <button type="button" className="chip" onClick={() => setUrls([u, ...urls.filter(x => x !== u)])}>1ʳᵉ</button>}<button type="button" className="chip" onClick={() => setUrls(urls.filter(x => x !== u))}>Retirer</button></div></div>))}</div>
    <p><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={onFiles} disabled={busy} aria-label="Ajouter des images"/> {busy && 'Envoi…'}</p>
    {err && <p role="alert" style={{color:'var(--acc)'}}>{err}</p>}<small>Les images sont redimensionnées et converties en WebP à l’envoi.</small></fieldset>);
}
