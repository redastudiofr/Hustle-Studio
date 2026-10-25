/**
 * "Worn" clips — the vertical video carousel on every product page.
 *
 * Put your own clips (filmed by you, or by creators who agreed to it) in
 * public/videos/ and list them here, e.g.
 *   {src: '/videos/zip-grey.mp4', label: 'Hustle Zip grey, worn'},
 * Vertical 9:16 MP4 (H.264), under ~5 MB each, plays best on phones.
 *
 * While the list is empty, the carousel is not shown.
 */
export type WornVideo = {src: string; label: string};

export const WORN_VIDEOS: WornVideo[] = [];
