import seedData from './seed.json';
import sections from './sections.json';
import coverData from './covers.json';
const covers=coverData as Record<string,{src:string;source:string}>;
export type Entry = {id:string; kind:string; category:string; titleVi:string; titleEn:string; year:string; period?:string; authors:string; detailVi:string; detailEn:string; url:string; status:string; coverUrl?:string;};
export const seed = [...seedData,...sections] as Entry[];
export function bookCover(r:Entry){return r.coverUrl ?? covers[r.id]?.src ?? '';}
export function bookCoverSource(r:Entry){return r.coverUrl?'Uploaded cover':covers[r.id]?.source||'';}
export const categories:Record<string,[string,string]>={profile:['Giới thiệu','Profile sections'],wos:['Tạp chí Web of Science','Web of Science journals'],scopus:['Tạp chí Scopus','Scopus journals'],other:['Tạp chí quốc tế khác','Other international journals'],conference:['Hội thảo quốc tế','International conferences'],national:['Tạp chí trong nước','National journals'],'national-conference':['Hội thảo trong nước','National conferences'],chapter:['Chương sách','Book chapters'],authored:['Sách tác giả','Authored books'],edited:['Sách đồng biên tập','Edited books'],series:['Biên tập bộ sách','Book series'],phd:['Nghiên cứu sinh','PhD students'],master:['Học viên cao học','Master’s students'],research:['Đề tài nghiên cứu','Research projects'],guest:['Biên tập khách mời','Guest editor']};
export const statuses:Record<string,[string,string]>={listed:['Theo danh mục CV','Listed in CV'],forthcoming:['Sắp xuất bản · theo CV','Forthcoming · per CV'],inpress:['Đã chấp nhận · theo CV','Accepted · per CV'],ongoing:['Đang thực hiện','Ongoing'],completed:['Đã hoàn thành','Completed'],planned:['Đang / dự kiến hướng dẫn','Current / planned supervision'],expected:['Dự kiến hoàn thành 12/2026','Expected completion 12/2026']};
export function title(r:Entry,lang:string){return lang==='vi'?(r.titleVi||r.titleEn):(r.titleEn||r.titleVi)}
export function detail(r:Entry,lang:string){return lang==='vi'?(r.detailVi||r.detailEn):(r.detailEn||r.detailVi)}
export function mergeRecords(rows:{id:string;payload:string;deleted:number}[]){const map=new Map(seed.map(r=>[r.id,r]));for(const r of rows){if(r.deleted)map.delete(r.id);else map.set(r.id,JSON.parse(r.payload));}return Array.from(map.values());}
