import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { fetchConfig } from '../config/api';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// Predefined playlists
const PLAYLISTS = {
  tavern: {
    id: 'tavern',
    name: 'Tavern Melodies',
    icon: 'fas fa-beer',
    description: 'Lively tunes and bard songs',
    tracks: ['test.mp3']
  },
  battle: {
    id: 'battle',
    name: 'Battle Hymns',
    icon: 'fas fa-shield-alt',
    description: 'Epic combat soundtracks',
    tracks: ['battle1.mp3', 'battle2.mp3']
  },
  forest: {
    id: 'forest',
    name: 'Forest Whispers',
    icon: 'fas fa-tree',
    description: 'Nature sounds and mystical ambience',
    tracks: ['forest1.mp3', 'forest2.mp3']
  },
  dungeon: {
    id: 'dungeon',
    name: 'Dungeon Depths',
    icon: 'fas fa-dungeon',
    description: 'Dark and mysterious atmospheres',
    tracks: ['dungeon1.mp3', 'dungeon2.mp3']
  },
  royal: {
    id: 'royal',
    name: 'Royal Court',
    icon: 'fas fa-crown',
    description: 'Regal and ceremonial music',
    tracks: ['royal1.mp3', 'royal2.mp3']
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic Nights',
    icon: 'fas fa-moon',
    description: 'Magical and ethereal soundscapes',
    tracks: ['mystic1.mp3', 'mystic2.mp3']
  }
};

export const AudioProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const audioRef = useRef(new Audio());
  const pollingIntervalRef = useRef(null);

  // Check if user is Dungeon Master
  const isDM = user?.role === 'dungeon_master' || user?.role === 'admin';

  // Fetch current audio state from server
  const fetchAudioState = async () => {
    if (!syncEnabled) return;

    try {
      const response = await fetch('/api/audio_state.php', fetchConfig);
      const data = await response.json();

      if (data.success && data.audioState) {
        const { playlist, track, playing, volume: serverVolume, updatedAt } = data.audioState;
        
        // Only update if server state is newer than local state
        if (playlist !== currentPlaylist?.id || track !== currentTrack) {
          if (playlist && PLAYLISTS[playlist]) {
            setCurrentPlaylist(PLAYLISTS[playlist]);
            setCurrentTrack(track);
          } else {
            setCurrentPlaylist(null);
            setCurrentTrack(null);
          }
        }

        if (playing !== isPlaying) {
          setIsPlaying(playing);
        }

        if (serverVolume !== volume) {
          setVolume(serverVolume);
        }
      }
    } catch (error) {
      console.error('Error fetching audio state:', error);
    }
  };

  // Update server with current audio state
  const updateServerState = async () => {
    if (!isDM || !syncEnabled) return;

    try {
      await fetch('/api/audio_state.php', {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({
          playlist: currentPlaylist?.id || null,
          track: currentTrack,
          playing: isPlaying,
          volume: volume
        })
      });
    } catch (error) {
      console.error('Error updating audio state:', error);
    }
  };

  // Play audio
  const playAudio = (playlist, track = null) => {
    if (!isDM) {
      toast.error('Only the Dungeon Master can control the music');
      return;
    }

    const selectedTrack = track || (playlist.tracks && playlist.tracks[0]);
    if (!selectedTrack) return;

    const trackUrl = `/audio_files/${selectedTrack}`;
    audioRef.current.src = trackUrl;
    audioRef.current.volume = volume;
    
    audioRef.current.play()
      .then(() => {
        setCurrentPlaylist(playlist);
        setCurrentTrack(selectedTrack);
        setIsPlaying(true);
        updateServerState();
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
      });
  };

  // Pause audio
  const pauseAudio = () => {
    if (!isDM) {
      toast.error('Only the Dungeon Master can control the music');
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
    updateServerState();
  };

  // Resume audio
  const resumeAudio = () => {
    if (!isDM) {
      toast.error('Only the Dungeon Master can control the music');
      return;
    }

    if (audioRef.current.src) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          updateServerState();
        })
        .catch(error => {
          console.error('Error resuming audio:', error);
          toast.error('Failed to resume audio');
        });
    }
  };

  // Stop audio
  const stopAudio = () => {
    if (!isDM) {
      toast.error('Only the Dungeon Master can control the music');
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentPlaylist(null);
    setCurrentTrack(null);
    updateServerState();
  };

  // Change volume
  const changeVolume = (newVolume) => {
    if (!isDM) {
      toast.error('Only the Dungeon Master can control the music');
      return;
    }

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    audioRef.current.volume = clampedVolume;
    updateServerState();
  };

  // Toggle sync
  const toggleSync = () => {
    setSyncEnabled(!syncEnabled);
    if (!syncEnabled) {
      fetchAudioState(); // Fetch immediately when re-enabling
    }
  };

  // Effect to sync audio playback with state
  useEffect(() => {
    if (isPlaying && currentTrack) {
      const trackUrl = `/audio_files/${currentTrack}`;
      if (audioRef.current.src !== trackUrl) {
        audioRef.current.src = trackUrl;
      }
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, volume]);

  // Effect to poll server for audio state (non-DM users)
  useEffect(() => {
    if (!isDM && syncEnabled) {
      // Initial fetch
      fetchAudioState();

      // Set up polling interval
      pollingIntervalRef.current = setInterval(fetchAudioState, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isDM, syncEnabled, currentPlaylist, currentTrack, isPlaying, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const value = {
    // State
    playlists: PLAYLISTS,
    currentPlaylist,
    currentTrack,
    isPlaying,
    volume,
    syncEnabled,
    isDM,

    // Actions
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    changeVolume,
    toggleSync
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};