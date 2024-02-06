import { useEffect, useState } from 'react';
import { useAudio } from '../../../providers/AudioProvider';

const AudioPlayer = ({ audioFiles }: { audioFiles: HTMLAudioElement[] }) => {
  const audio = useAudio();

  const [audioIndex, setAudioIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    if (audioPlaying) {
      audioFiles[audioIndex].volume = audio.audioVolume;
    }
  }, [audio.audioVolume, audioIndex, audioFiles, audioPlaying]);

  useEffect(() => {
    const playNextAudioClip = async () => {
      if (audioIndex < audioFiles.length && !audioPlaying) {
        setAudioPlaying(true);
        const audio = audioFiles[audioIndex];

        // Set audio volume
        audio.volume = audio.volume;

        try {
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
        }

        const onAudioEnded = () => {
          audio.removeEventListener('ended', onAudioEnded);
          setAudioIndex((prevIndex) => prevIndex + 1);
          setAudioPlaying(false);
          audio.remove(); // Remove audio element from memory
        };

        audio.addEventListener('ended', onAudioEnded);
      }
    };

    playNextAudioClip();
  }, [audioIndex, audioFiles, audioPlaying]);

  return null; // You can customize the UI for audio player here if needed
};

export default AudioPlayer;
