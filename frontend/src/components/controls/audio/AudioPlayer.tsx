import { useEffect, useState } from 'react';
import { useAudio } from '../../../providers/AudioProvider';

/**
 * AudioPlayer Component
 * 
 * This component manages the playback of audio clips.
 * 
 * @param {Object} props - The props for the AudioPlayer component.
 * @param {string[]} props.audioClips - Array of URLs for audio clips.
 */
const AudioPlayer = ({ audioClips }: { audioClips: string[] }) => {
  // Custom hook to access audio context
  const audio = useAudio();

  // Create audio elements for each clip
  const audioFiles = audioClips.map((clip) => new Audio(clip));

  // State variables to manage playback
  const [audioIndex, setAudioIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Effect to update audio volume when it changes
  useEffect(() => {
    if (audioPlaying) {
      audioFiles[audioIndex].volume = audio.audioVolume;
    }
  }, [audio.audioVolume, audioIndex, audioFiles, audioPlaying]);

  // Effect to play the next audio clip
  useEffect(() => {
    const playNextAudioClip = async () => {
      if (audioIndex < audioFiles.length && !audioPlaying) {
        setAudioPlaying(true);
        const audioElement = audioFiles[audioIndex];

        // Set audio volume
        audioElement.volume = audio.audioVolume;

        try {
          await audioElement.play();
        } catch (error) {
          console.error('Error playing audio:', error);
        }

        const onAudioEnded = () => {
          // Cleanup event listener and update state
          audioElement.removeEventListener('ended', onAudioEnded);
          setAudioIndex((prevIndex) => prevIndex + 1);
          setAudioPlaying(false);
          // Remove audio element from memory
          audioElement.remove();
        };

        // Listen for audio end event
        audioElement.addEventListener('ended', onAudioEnded);
      }
    };

    // Start playing next audio clip
    playNextAudioClip();
  }, [audioIndex, audioFiles, audioPlaying]);

  // You can customize the UI for audio player here if needed
  return null;
};

export default AudioPlayer;
