'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Download, X } from 'lucide-react';
import FilesPanel from './files-panel';
import BookCover from '../book-cover';
import { Entry, categories, statuses, title, bookCover } from '@/data/model';
const kinds: Record<string, [
    string,
    string
]> = { section: ['Mục giới thiệu', 'Profile sections'], publication: ['Công bố khoa học', 'Publications'], book: ['Sách', 'Books'], project: ['Đề tài', 'Projects'], student: ['Nghiên cứu sinh / học viên', 'Students'], service: ['Phục vụ học thuật', 'Academic service'] };
const categoryKind: Record<string, string> = { profile: 'section', wos: 'publication', scopus: 'publication', other: 'publication', conference: 'publication', national: 'publication', 'national-conference': 'publication', chapter: 'publication', authored: 'book', edited: 'book', series: 'book', research: 'project', phd: 'student', master: 'student', guest: 'service' };
export default function Admin({accountName}:{accountName:string}) {
    const lang=String('en');
    const [records, setRecords] = useState<Entry[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState(''), [kind, setKind] = useState('all'), [q, setQ] = useState(''), [limit, setLimit] = useState(20), [edit, setEdit] = useState<Entry | null>(null), [removing, setRemoving] = useState<Entry | null>(null), [busy, setBusy] = useState(false);
    
    const ix = 1;
    async function load() { setLoading(true); setError(''); try {
        const r = await fetch('/api/records');
        if (!r.ok)
            throw Error('Unable to load data. Please retry.');
        setRecords((await r.json() as {
            records: Entry[];
        }).records);
    }
    catch (e) {
        setError(String(e));
    }
    finally {
        setLoading(false);
    } }
    useEffect(() => { load(); }, []);
    useEffect(() => { document.documentElement.lang = lang; }, [lang]);
    useEffect(() => { if (!edit && !removing)
        return; function escape(e: KeyboardEvent) { if (e.key === 'Escape' && !busy) {
        setEdit(null);
        setRemoving(null);
    } } window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [edit, removing, busy]);
    async function uploadCover(file:File) {setBusy(true);setError('');try{const form=new FormData();form.set('file',file);const res=await fetch('/api/uploads',{method:'POST',body:form});const data=await res.json() as {url?:string;error?:string};if(!res.ok||!data.url)throw Error(data.error||'Image upload failed.');field('coverUrl',data.url);}catch(e){setError(e instanceof Error?e.message:'Image upload failed.');}finally{setBusy(false);}}
    async function save(r: Entry, remove = false) { setBusy(true); setError(''); try {
        const res = await fetch('/api/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ record: r, remove }) });
        const body = await res.json() as {
            error?: string;
        };
        if (!res.ok)
            throw Error(body.error);
        setRecords(prev => remove ? prev.filter(x => x.id !== r.id) : prev.some(x => x.id === r.id) ? prev.map(x => x.id === r.id ? r : x) : [r, ...prev]);
        setEdit(null);
        setRemoving(null);
        setNotice('Saved online. Changes appear when the website is reopened.');
    }
    catch (e) {
        setError(String(e));
    }
    finally {
        setBusy(false);
    } }
    function create() { const k = kind === 'all' ? 'publication' : kind; setError(''); setEdit({ id: 'custom-' + crypto.randomUUID(), kind: k, category: Object.keys(categoryKind).find(c => categoryKind[c] === k)!, titleVi: '', titleEn: '', year: new Date().getFullYear().toString(), period: '', authors: '', detailVi: '', detailEn: '', url: '', status: 'listed' }); }
    function exportData() { const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'le-dac-nhuong-research.json'; a.click(); URL.revokeObjectURL(url); }
    const list = records.filter(r => (kind === 'all' ? r.kind !== 'section' : r.kind === kind) && [r.titleVi, r.titleEn, r.authors].join(' ').toLowerCase().includes(q.toLowerCase())).sort((a, b) => Number(b.year) - Number(a.year));
    function field(k: keyof Entry, v: string) { setEdit(e => e ? { ...e, [k]: v } : null); }
    return <><header className="admin-header"><a className="text-link" href="/"><ArrowLeft size={17}/>{'Back to profile'}</a><div className="admin-account"><span>{accountName}</span><a href="/signout-with-chatgpt?return_to=%2Flogin" target="_top">Sign out</a></div></header><main className="admin-main"><div className="admin-heading"><div><span className="eyebrow">LE DAC NHUONG / CONTENT STUDIO</span><h1>{'Manage content'}</h1><p>{'Update your research records and save them online.'}</p></div><button className="button primary" style={kind==='section'?{display:'none'}:undefined} onClick={create} disabled={loading || !!error && !records.length}><Plus size={17}/>{'Add record'}</button></div><FilesPanel/>{notice && <div className="admin-message" role="status">{notice}</div>}{error && !edit && !removing && <div className="admin-message error" role="alert">{error} <button onClick={load}>{'Retry'}</button></div>}<div className="admin-tools"><input value={q} placeholder={'Search records…'} onChange={e => { setQ(e.target.value); setLimit(20); }}/><select aria-label="Category" value={kind} onChange={e => { setKind(e.target.value); setLimit(20); }}><option value="all">{'All research records'}</option>{Object.entries(kinds).map(([k, v]) => <option value={k} key={k}>{v[ix]}</option>)}</select><button disabled={loading || !records.length} className="button outline" onClick={exportData}><Download size={15}/>{'Export JSON'}</button></div><p className="admin-note">{kind==='section'?'Edit the text displayed in your overview and biography. Changes are saved directly to the website.':'Add and edit publications, books, projects, students and academic service. Choose Profile sections to update your introduction and biography.'}</p>{loading ? <p>{'Loading…'}</p> : <><div className="result-count">{list.length} {'records'}</div><div className="admin-list">{list.slice(0, limit).map(r => <div className="admin-row" key={r.id}><div><small>{r.year} · {categories[r.category]?.[ix] || r.category}</small><strong>{title(r, lang)}</strong></div><div><button onClick={() => { setEdit({ ...r }); setError(''); }}>{'Edit'}</button>{r.kind!=='section'&&<button className="danger" onClick={() => { setRemoving(r); setError(''); }}>Delete</button>}</div></div>)}</div>{!list.length && <div className="empty">{'No records found.'}</div>}{list.length > limit && <div className="load-more"><button className="button outline" onClick={() => setLimit(limit + 30)}>{'Load more'}</button></div>}</>}</main>{edit && <div className="modal-overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><button className="icon-button close" aria-label="Close" disabled={busy} onClick={() => setEdit(null)}><X /></button><span className="eyebrow">CONTENT STUDIO</span><h2 id="editor-title">{'Edit record'}</h2>{error && <div className="admin-message error" role="alert">{error}</div>}<form className="admin-form" onSubmit={e => { e.preventDefault(); save(edit); }}>{edit.kind!=='section'&&<><label>{'Content type'}<select value={edit.kind} onChange={e => setEdit({ ...edit, kind: e.target.value, category: Object.keys(categoryKind).find(c => categoryKind[c] === e.target.value)! })}>{Object.entries(kinds).filter(([k])=>k!=='section').map(([k, v]) => <option key={k} value={k}>{v[ix]}</option>)}</select></label><label>{'Category'}<select value={edit.category} onChange={e => field('category', e.target.value)}>{Object.entries(categories).filter(([k]) => categoryKind[k] === edit.kind).map(([k, v]) => <option key={k} value={k}>{v[ix]}</option>)}</select></label></>}<label className="full">{edit.kind==='section'?'Section':'Name / title'}<input readOnly={edit.kind==='section'} value={edit.titleEn} required onChange={e => field('titleEn', e.target.value)} maxLength={1000}/></label>{edit.kind!=='section'&&<><label>{'Year'}<input value={edit.year} pattern="[0-9]{4}" required onChange={e => field('year', e.target.value)}/></label><label>{'Period (optional)'}<input value={edit.period || ''} onChange={e => field('period', e.target.value)} placeholder="2026–2029" maxLength={60}/></label><label className="full">{'Authors / role'}<input value={edit.authors} onChange={e => field('authors', e.target.value)} maxLength={3000}/></label></>}<label className="full">{edit.kind==='section'?'Text shown on website':'Description / citation'}<textarea value={edit.detailEn} onChange={e => field('detailEn', e.target.value)} maxLength={18000}/></label>{edit.kind!=='section'&&<><label>{'DOI / website URL'}<input type="url" placeholder="https://doi.org/…" value={edit.url} onChange={e => field('url', e.target.value)} maxLength={2000}/></label><label>{'Status'}<select value={edit.status} onChange={e => field('status', e.target.value)}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v[ix]}</option>)}</select></label></>}{edit.kind==='book'&&<div className="cover-editor full"><div><BookCover record={edit}/></div><div><label>Book cover image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)uploadCover(f);}}/></label><p>Upload the corresponding cover (JPG, PNG or WebP, up to 5 MB), then save the record.</p><label>Cover URL (optional)<input value={edit.coverUrl??bookCover(edit)} onChange={e=>field('coverUrl',e.target.value)} placeholder="https://…"/></label><button type="button" className="text-link" onClick={()=>setEdit(e=>{if(!e)return e;const copy={...e};delete copy.coverUrl;return copy;})}>Restore original cover</button></div></div>}<div className="save-actions"><button disabled={busy} className="button outline" type="button" onClick={() => setEdit(null)}>{'Cancel'}</button><button disabled={busy} className="button primary" type="submit">{busy ? 'Saving…' : 'Save online'}</button></div></form></section></div>}{removing && <div className="modal-overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">{'Delete this record?'}</h2><p>{title(removing, lang)}</p>{error && <div className="admin-message error">{error}</div>}<div className="save-actions"><button autoFocus disabled={busy} className="button outline" onClick={() => setRemoving(null)}>{'Cancel'}</button><button disabled={busy} className="button primary" onClick={() => save(removing, true)}>{busy ? 'Deleting…' : 'Confirm deletion'}</button></div></section></div>}</>;
}
