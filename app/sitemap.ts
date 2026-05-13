import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://tutorai.id', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://tutorai.id/auth/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://tutorai.id/auth/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
