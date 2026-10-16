import { seed, type Entry } from '@/data/model'

export type StoredUpload = { bytes: Uint8Array; contentType: string }

type RuntimeStore = {
  records: Map<string, Entry | null>
  uploads: Map<string, StoredUpload>
}

declare global {
  // eslint-disable-next-line no-var
  var __dacNhuongStore: RuntimeStore | undefined
}

const runtimeStore: RuntimeStore = globalThis.__dacNhuongStore ??= {
  records: new Map(),
  uploads: new Map(),
}

export function getRecords() {
  const records = new Map(seed.map((record) => [record.id, record]))
  for (const [id, record] of runtimeStore.records) {
    if (record === null) records.delete(id)
    else records.set(id, record)
  }
  return [...records.values()]
}

export function saveRecord(record: Entry, remove = false) {
  runtimeStore.records.set(record.id, remove ? null : record)
}

export function saveUpload(id: string, upload: StoredUpload) {
  runtimeStore.uploads.set(id, upload)
}

export function getUpload(id: string) {
  return runtimeStore.uploads.get(id)
}
