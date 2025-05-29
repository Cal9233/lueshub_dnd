import React, { useState } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import './AudioControls.css';

const AudioControls = () => {
  const {
    playlists,
    currentPlaylist,
    isPlaying,
    volume,
    syncEnabled,
    isDM,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    changeVolume,
    toggleSync
  } = useAudio();

  const [showPlaylists, setShowPlaylists] = useState(false);

  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  const handlePlaylistSelect = (playlist) => {
    playAudio(playlist);
    setShowPlaylists(false);
  };

  if (!isDM) {
    // Non-DM view - show current playing status only
    return (
      <div className="audio-controls non-dm">
        <div className="audio-status">
          {currentPlaylist ? (
            <>
              <i className={`${currentPlaylist.icon} playlist-icon`}></i>
              <span className="now-playing">
                {currentPlaylist.name} {isPlaying ? '(Playing)' : '(Paused)'}
              </span>
            </>
          ) : (
            <span className="no-music">No music playing</span>
          )}
        </div>
        <div className="sync-toggle">
          <label>
            <input
              type="checkbox"
              checked={syncEnabled}
              onChange={toggleSync}
            />
            Sync with DM
          </label>
        </div>
      </div>
    );
  }

  // DM view - full controls
  return (
    <div className="audio-controls dm">
      <div className="audio-header">
        <i className="fas fa-music"></i>
        <h3>Ambient Music Controls</h3>
      </div>

      <div className="current-track">
        {currentPlaylist ? (
          <>
            <i className={`${currentPlaylist.icon} playlist-icon`}></i>
            <div className="track-info">
              <span className="playlist-name">{currentPlaylist.name}</span>
              <span className="playlist-description">{currentPlaylist.description}</span>
            </div>
          </>
        ) : (
          <span className="no-selection">No playlist selected</span>
        )}
      </div>

      <div className="playback-controls">
        {!isPlaying ? (
          <>
            {currentPlaylist && (
              <button className="control-button play" onClick={resumeAudio}>
                <i className="fas fa-play"></i> Resume
              </button>
            )}
            <button 
              className="control-button playlist" 
              onClick={() => setShowPlaylists(!showPlaylists)}
            >
              <i className="fas fa-list"></i> Select Playlist
            </button>
          </>
        ) : (
          <>
            <button className="control-button pause" onClick={pauseAudio}>
              <i className="fas fa-pause"></i> Pause
            </button>
            <button className="control-button stop" onClick={stopAudio}>
              <i className="fas fa-stop"></i> Stop
            </button>
          </>
        )}
      </div>

      <div className="volume-control">
        <i className="fas fa-volume-down"></i>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <i className="fas fa-volume-up"></i>
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>

      {showPlaylists && (
        <div className="playlist-grid">
          {Object.values(playlists).map(playlist => (
            <div
              key={playlist.id}
              className="playlist-item"
              onClick={() => handlePlaylistSelect(playlist)}
            >
              <i className={`${playlist.icon} playlist-icon`}></i>
              <div className="playlist-details">
                <span className="playlist-name">{playlist.name}</span>
                <span className="playlist-description">{playlist.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="audio-footer">
        <p className="sync-info">
          <i className="fas fa-info-circle"></i>
          Music will automatically sync to all players in the session
        </p>
      </div>
    </div>
  );
};

export default AudioControls;