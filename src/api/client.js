export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function normalizeProperty(p) {
  if (!p) return p
  return {
    ...p,
    builderId: p.builderId ?? p.builder_id,
    builderName: p.builderName ?? p.builder_name,
    desc: p.desc ?? p.description,
    floorPlanUrl: p.floorPlanUrl ?? p.floor_plan_url,
    floorPlanCode: p.floorPlanCode ?? p.floor_plan_code,
    totalUnits: p.totalUnits ?? p.total_units,
    soldUnits: p.soldUnits ?? p.sold_units,
  }
}

function normalizeArticle(a) {
  if (!a) return a
  let body = a.body
  if (!body && a.content) {
    try {
      body = JSON.parse(a.content)
    } catch {
      body = [{ type: 'paragraph', text: a.content }]
    }
  }
  return {
    ...a,
    slug: a.slug ?? a.id,
    cat: a.cat ?? a.category,
    desc: a.desc ?? a.excerpt,
    read: a.read ?? a.read_time,
    heroImg: a.heroImg ?? a.hero_img ?? a.img,
    tag: a.tag ?? a.category,
    date: a.date ?? (a.published_at ? new Date(a.published_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''),
    body,
  }
}

export async function apiFetch(path, { method = 'GET', body, headers, token } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status})`, { status: res.status, payload })
  }
  return payload
}

export function buildQuery(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
  const query = new URLSearchParams(clean).toString()
  return query ? `?${query}` : ''
}

export async function getProperties(params = {}) {
  const res = await apiFetch(`/api/properties${buildQuery(params)}`)
  return {
    ...res,
    items: (res.items || []).map(normalizeProperty),
  }
}

export async function getProperty(id) {
  const res = await apiFetch(`/api/properties/${encodeURIComponent(id)}`)
  return {
    ...res,
    item: normalizeProperty(res.item),
  }
}

export async function getBuilders() {
  return apiFetch('/api/builders')
}

export async function getBuilder(id) {
  return apiFetch(`/api/builders/${encodeURIComponent(id)}`)
}

export async function getArticles(params = {}) {
  const res = await apiFetch(`/api/articles${buildQuery(params)}`)
  return {
    ...res,
    items: (res.items || []).map(normalizeArticle),
  }
}

export async function getArticle(id) {
  const res = await apiFetch(`/api/articles/${encodeURIComponent(id)}`)
  return {
    ...res,
    item: normalizeArticle(res.item),
  }
}

export function submitInquiry(data) {
  return apiFetch('/api/inquiries', { method: 'POST', body: data })
}

// ─── Users ────────────────────────────────────────────────────
// Upserts a user by phone number, returns { item: { id, name, email, phone } }
export function upsertUser(data) {
  return apiFetch('/api/users/upsert', { method: 'POST', body: data })
}

// ─── Saved Properties ─────────────────────────────────────────
// Toggle save for a property — returns { saved: true/false }
export function toggleSaved(userId, propertyId, token) {
  return apiFetch('/api/saved', { method: 'POST', body: { userId, propertyId }, token })
}

// Get all saved properties for a user — returns { items: [...] }
export async function getSavedProperties(userId, token) {
  const res = await apiFetch(`/api/saved/${encodeURIComponent(userId)}`, { token })
  return {
    ...res,
    items: (res.items || []).map(normalizeProperty),
  }
}

// Check if a specific property is saved — returns { saved: true/false }
export function checkSaved(userId, propertyId, token) {
  return apiFetch(`/api/saved/${encodeURIComponent(userId)}/${encodeURIComponent(propertyId)}`, { token })
}

// ─── Auth ────────────────────────────────────────────────────
export function signIn({ email, password }) {
  return apiFetch('/api/auth/signin', { method: 'POST', body: { email, password } })
}

export function signUp({ name, phone, email, password }) {
  return apiFetch('/api/auth/signup', { method: 'POST', body: { name, phone, email, password } })
}

export function forgotPassword(email) {
  return apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } })
}
