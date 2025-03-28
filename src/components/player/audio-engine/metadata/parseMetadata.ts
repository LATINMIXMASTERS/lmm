
/**
 * Extracts artist and title from a stream title string
 * Common formats: "Artist - Title", "Title by Artist", etc.
 */
export const extractArtistAndTitle = (streamTitle: string): { artist: string; title: string } => {
  if (!streamTitle) {
    return { artist: '', title: '' };
  }

  // Try to split on common delimiters
  if (streamTitle.includes(' - ')) {
    const [artist, title] = streamTitle.split(' - ');
    return { artist: artist.trim(), title: title.trim() };
  }
  
  if (streamTitle.includes(' by ')) {
    const [title, artist] = streamTitle.split(' by ');
    return { artist: artist.trim(), title: title.trim() };
  }
  
  // Try other possible formats
  const artistMatch = streamTitle.match(/^(.*?)\s*[:\-–—]\s*(.*)$/);
  if (artistMatch && artistMatch.length > 2) {
    return { artist: artistMatch[1].trim(), title: artistMatch[2].trim() };
  }
  
  // If we can't parse it, use the whole string as the title
  return { artist: '', title: streamTitle.trim() };
};
