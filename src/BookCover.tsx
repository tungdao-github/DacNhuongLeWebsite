'use client';
import {useState,useEffect} from 'react';
import {BookOpen} from 'lucide-react';
import {Entry,bookCover,title} from './model';
export default function BookCover({record}:{record:Entry}){const src=bookCover(record);const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[src]);return <div className="real-book-cover">{src&&!failed?<img src={src} alt={'Book cover: '+title(record,'en')} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<div className="cover-unavailable"><BookOpen size={36} strokeWidth={1}/><span>{record.category==='series'?'Book series':'Cover not yet available'}</span></div>}</div>}
