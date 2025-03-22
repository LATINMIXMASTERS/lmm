
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
    const { artist, title } = extractArtistAndTitle(titleInfo);
    metadata.artist = artist;
    metadata.title = title;
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
                    text.match(/currentsong=(.*?)(&|$)/) ||
                    text.match(/song_title="([^"]*)"/) ||
                    text.match(/Current Song: <[^>]*>([^<]*)<\//) ||
                    text.match(/Now Playing:.*?>(.*?)<\//);
                    
  if (titleMatch && titleMatch[1]) {
    // Found title in HTML or text format
    const titleInfo = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const { artist, title } = extractArtistAndTitle(titleInfo);
    
    return {
      artist: artist,
      title: title,
      startedAt: new Date()
    };
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
    const { artist, title } = extractArtistAndTitle(titleInfo);
    
    return {
      artist: artist || source.artist || 'Unknown Artist',
      title: title,
      startedAt: new Date(),
      album: source.album || undefined
    };
  }
  
  return {};
};

/**
 * Parses Shoutcast v2 format
 * @param data - The data object from Shoutcast response
 * @returns Partial RadioMetadata object
 */
export const parseShoutcastData = (data: any): Partial<RadioMetadata> => {
  // Multiple possible formats from different Shoutcast versions
  const titleInfo = data?.songtitle || data?.title || data?.streamtitle || 
                   data?.data?.songtitle || data?.data?.title || data?.current_song || 
                   data?.currenttitle || data?.currentsong;
                   
  if (titleInfo) {
    const { artist, title } = extractArtistAndTitle(titleInfo);
    
    return {
      artist: artist || data.artist || 'Unknown Artist',
      title: title,
      startedAt: new Date()
    };
  }
  
  return {};
};

/**
 * Parses now_playing.json format (common for many radio backends)
 * @param data - The data object from now_playing response
 * @returns Partial RadioMetadata object
 */
export const parseNowPlayingJson = (data: any): Partial<RadioMetadata> => {
  // Check for AzuraCast format
  if (data?.now_playing?.song) {
    const song = data.now_playing.song;
    return {
      title: song.title,
      artist: song.artist,
      album: song.album,
      coverArt: song.art || song.artwork_url,
      startedAt: new Date()
    };
  }
  
  // Check for simple now_playing format
  if (data?.now_playing || data?.currentSong || data?.current_song) {
    const songInfo = data.now_playing || data.currentSong || data.current_song;
    
    if (typeof songInfo === 'string') {
      const { artist, title } = extractArtistAndTitle(songInfo);
      return {
        artist,
        title,
        startedAt: new Date()
      };
    } else if (typeof songInfo === 'object') {
      return {
        title: songInfo.title || songInfo.name,
        artist: songInfo.artist || songInfo.performer || 'Unknown Artist',
        album: songInfo.album,
        coverArt: songInfo.artwork || songInfo.cover || songInfo.art,
        startedAt: new Date()
      };
    }
  }
  
  return {};
};

/**
 * Extracts artist and title from a combined string
 * @param trackString - The combined track string (typically "Artist - Title")
 * @returns Object with separated artist and title
 */
export const extractArtistAndTitle = (trackString: string): { artist: string, title: string } => {
  if (!trackString) {
    return {
      artist: 'Unknown Artist',
      title: 'Unknown Track'
    };
  }
  
  // Common formats:
  // Artist - Title
  // Artist "Title"
  // Artist: Title
  const patterns = [
    /(.*?)\s-\s(.*)/,        // Artist - Title
    /(.*?)\s["""](.*?)["""]/,   // Artist "Title"
    /(.*?):\s+(.*)/,         // Artist: Title
    /(.*?)\s[▸▶♫]+\s(.*)/    // Artist ▶ Title
  ];
  
  for (const pattern of patterns) {
    const match = trackString.match(pattern);
    if (match) {
      return {
        artist: match[1]?.trim() || 'Unknown Artist',
        title: match[2]?.trim() || 'Unknown Track'
      };
    }
  }
  
  // If no pattern matched, assume it's all title
  return {
    artist: 'Unknown Artist',
    title: trackString.trim() || 'Unknown Track'
  };
};
