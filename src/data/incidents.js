// Shared adapter for /api/incidents items. Extracted so any screen that
// renders the citizen-reporter Shorts feed (HomeScreen rails, the App-level
// 'shortsfeed' route) projects incidents onto the SHORT_NEWS shape the same
// way, with the same media-URL resolution rules.
import { API_BASE } from '../api/client.js';

// Backend returns either full URLs (S3) or relative paths. Relative paths
// are resolved against the host portion of API_BASE (i.e. API_BASE minus
// the trailing /api).
export function resolveMediaUrl(u) {
  if (!u) return '';
  if (u.startsWith('http')) return u;
  const imgHost = API_BASE.replace(/\/api\/?$/, '');
  return `${imgHost}${u}`;
}

// Incident → SHORT_NEWS shape (vertical reel item).
// Source fields (real /api/incidents response):
//   cover_image_path → full S3 image URL (used as thumbnail)
//   video_path       → full S3 video URL (drives HTML5 <video> in viewer)
//   is_live (0|1)    → live flag
//   post_location    → plain city string fallback
// Legacy paths kept as fallbacks in case staging/dev returns the older shape.
export function mapIncidentToShort(it) {
  return {
    id:          it?.id,
    orientation: 'vertical',
    titleTe:     it?.title || '',
    titleEn:     it?.title || '',
    fullText:    it?.description || it?.title || '',
    channel:     it?.location?.city ? `${it.location.city} TV`
              : it?.post_location ? `${it.post_location} TV`
              : 'INCIDENTS',
    reporter:    it?.author_name || '',
    location:    it?.location?.city || it?.location?.area || it?.post_location || '',
    category:    it?.category?.name || 'Incident',
    views:       '',
    duration:    '',
    live:        !!(it?.is_live),
    uploadDate:  '',
    uploadTime:  '',
    img:         resolveMediaUrl(it?.cover_image_path || it?.thumbnail),
    mediaUrl:    resolveMediaUrl(it?.video_path || it?.media_url),
    bg:          ['#1a0a00', '#7a1500'],
    uploadedAt:  it?.created_at ? new Date(it.created_at) : new Date(),
  };
}
