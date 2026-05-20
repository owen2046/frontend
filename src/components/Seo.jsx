import { useEffect } from 'react'

function setMeta(selector, attr, value) {
  if (!value) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const match = selector.match(/\[(name|property)="([^"]+)"\]/)
    if (match) el.setAttribute(match[1], match[2])
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const DEFAULT_IMAGE = 'https://www.estates61.com/og-image.jpg' // ← your domain

export default function Seo({ title, description, keywords, path = '/', image }) {
  useEffect(() => {
    const siteName = 'Estates61'
    const fullTitle = title?.includes(siteName) ? title : `${title} | ${siteName}`
    const url = `${window.location.origin}${path}`
    const img = image || DEFAULT_IMAGE

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[name="keywords"]', 'content', keywords)
    setMeta('meta[name="robots"]', 'content', 'index, follow')
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:type"]', 'content', 'website')
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:image"]', 'content', img)       // ← NEW
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="twitter:image"]', 'content', img)      // ← NEW

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, keywords, path, image])

  return null
}