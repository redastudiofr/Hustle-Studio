/**
 * The "follow us" row in the footer: the brand's own videos
 * (public/brand/tiktok/), in display order. Each has a poster frame shown
 * until it plays. Re-encoded for the web: 480px wide, no sound (they play
 * muted, on their own), H.264 with fast start.
 *
 * To add one: put video-0N.mp4 and video-0N.webp in public/brand/tiktok/ and
 * add a line here. The account links are BRAND.social (app/config/brand.ts).
 */
export type CommunityVideo = {src: string; poster: string};

export const TIKTOK_VIDEOS: CommunityVideo[] = [
  {src: '/brand/tiktok/video-01.mp4', poster: '/brand/tiktok/video-01.webp'},
  {src: '/brand/tiktok/video-02.mp4', poster: '/brand/tiktok/video-02.webp'},
  {src: '/brand/tiktok/video-03.mp4', poster: '/brand/tiktok/video-03.webp'},
  {src: '/brand/tiktok/video-04.mp4', poster: '/brand/tiktok/video-04.webp'},
  {src: '/brand/tiktok/video-05.mp4', poster: '/brand/tiktok/video-05.webp'},
];
