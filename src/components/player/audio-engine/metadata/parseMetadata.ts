
import { RadioMetadata } from '@/models/RadioStation';

/**
 * Parses Icecast/Shoutcast metadata string format
 * @param metadataString - The raw metadata string from the stream
 * @returns Partial RadioMetadata object
 */
export const parseIcecastMetadata = (metadataString: string): Partial<RadioMetadata> => {
  const metadata: Partial<RadioMetadata> = {};
  
  // Simple parsing of common metadata formats
  const streamTitle = metadataString.match(/StreamTitle='([^']*)'/);
  if (streamTitle && streamTitle[1]) {
    const titleInfo = streamTitle[1];
    
    // Try to extract artist and title (common format: Artist - Title)
    const match = titleInfo.match(/(.*?)\s-\s(.*)/);
    if (match) {
      metadata.artist = match[1]?.trim();
      metadata.title = match[2]?.trim();
    } else {
      metadata.title = titleInfo.trim();
    }
  }
  
  return metadata;
};

/**
 * Parses HTML or text content for metadata
 * @param text - The HTML or text content
 * @returns Partial RadioMetadata object
 */
export const parseTextMetadata = (text: string): Partial<RadioMetadata> => {
  // Try to extract metadata from HTML or text
  const titleMatch = text.match(/<title>(.*?)<\/title>/) || 
                    text.match(/StreamTitle='([^']*)'/) ||
                    text.match(/currentsong=(.*?)(&|$)/);
                    
  if (titleMatch && titleMatch[1]) {
    // Found title in HTML or text format
    const titleInfo = titleMatch[1];
    const match = titleInfo.match(/(.*?)\s-\s(.*)/);
    
    if (match) {
      return {
        artist: match[1]?.trim(),
        title: match[2]?.trim(),
        startedAt: new Date()
      };
    } else {
      return {
        title: titleInfo.trim(),
        artist: 'Unknown Artist',
        startedAt: new Date()
      };
    }
  }
  
  return {};
};

/**
 * Parses Icecast JSON format
 * @param data - The data object from Icecast response
 * @returns Partial RadioMetadata object
 */
export const parseIcecastJson = (data: any): Partial<RadioMetadata> => {
  if (!data?.icestats?.source) return {};
  
  const source = Array.isArray(data.icestats.source) 
    ? data.icestats.source[0] 
    : data.icestats.source;
  
  if (source.title) {
    const titleInfo = source.title;
    const match = titleInfo.match(/(.*?)\s-\s(.*)/);
    
    if (match) {
      return {
        artist: match[1]?.trim(),
        title: match[2]?.trim(),
        startedAt: new Date(),
        album: source.album || undefined
      };
    } else {
      return {
        title: titleInfo.trim(),
        artist: source.artist || 'Unknown Artist',
        startedAt: new Date(),
        album: source.album || undefined
      };
    }
  }
  
  return {};
};

/**
 * Parses Shoutcast v2 format
 * @param data - The data object from Shoutcast response
 * @returns Partial RadioMetadata object
 */
export const parseShoutcastData = (data: any): Partial<RadioMetadata> => {
  if (!data?.songtitle && !data?.title) return {};
  
  const titleInfo = data.songtitle || data.title;
  const match = titleInfo.match(/(.*?)\s-\s(.*)/);
  
  if (match) {
    return {
      artist: match[1]?.trim(),
      title: match[2]?.trim(),
      startedAt: new Date()
    };
  } else {
    return {
      title: titleInfo.trim(),
      artist: data.artist || 'Unknown Artist',
      startedAt: new Date()
    };
  }
};

/**
 * Parses now_playing.json format (common for many radio backends)
 * @param data - The data object from now_playing response
 * @returns Partial RadioMetadata object
 */
export const parseNowPlayingJson = (data: any): Partial<RadioMetadata> => {
  if (!data?.now_playing?.song) return {};
  
  const song = data.now_playing.song;
  return {
    title: song.title,
    artist: song.artist,
    album: song.album,
    coverArt: song.art || song.artwork_url,
    startedAt: new Date()
  };
};

/**
 * Extracts artist and title from a combined string
 * @param trackString - The combined track string (typically "Artist - Title")
 * @returns Object with separated artist and title
 */
export const extractArtistAndTitle = (trackString: string): { artist: string, title: string } => {
  const match = trackString.match(/(.*?)\s-\s(.*)/);
  
  if (match) {
    return {
      artist: match[1]?.trim() || 'Unknown Artist',
      title: match[2]?.trim() || 'Unknown Track'
    };
  } else {
    return {
      artist: 'Unknown Artist',
      title: trackString.trim() || 'Unknown Track'
    };
  }
};
