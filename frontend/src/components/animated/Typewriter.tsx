/**
 * Typewriter component renders text in a typewriter effect.
 *
 * @param {Object} props - Props for the Typewriter component.
 * @param {string} props.text - The text to be rendered.
 * @param {Object} [props.delay] - Object containing delay configuration.
 * @param {number} [props.delay.regular=10] - Delay for regular characters.
 * @param {number} [props.delay.punctuation=100] - Delay for punctuation characters.
 * @param {number} [props.delay.regularDeviation=20] - Deviation for regular character delay.
 * @param {number} [props.delay.punctuationDeviation=150] - Deviation for punctuation character delay.
 * @returns {JSX.Element} - Rendered Typewriter component.
 */
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

export default function Typewriter({
  text,
  delay
}: {
  text: string;
  delay?: {
    regular?: number;
    punctuation?: number;
    regularDeviation?: number;
    punctuationDeviation?: number;
  };
}) {
  const [targetText, setTargetText] = useState(text);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default character delay configuration
  const characterDelay = {
    regular: 10,
    punctuation: 100,
    regularDeviation: 20,
    punctuationDeviation: 150,
    ...delay
  };

  // Update target text when text prop changes.
  // We do this so that the typewriter effect can be restarted when the text changes.
  useEffect(() => {
    if (targetText !== text) {
      setTargetText(text);
    }
  }, [targetText, text]);

  // Calculate character delay based on configuration and render text with typewriter effect
  useEffect(() => {
    if (currentIndex < targetText.length) {
      const currentChar = targetText[currentIndex];
      const prevChar = currentIndex > 0 ? targetText[currentIndex - 1] : ' ';

      let currentDelay;

      if (['.', ',', ';', ':', '!', '?'].includes(prevChar)) {
        // If previous character is punctuation, use punctuation delay so
        // it seems like a human typing and thinking about the start of the next sentence.
        currentDelay =
          characterDelay.punctuation + Math.random() * characterDelay.punctuationDeviation;
      } else if (prevChar === ' ') {
        // If previous character is a space, use no delay so it seems like a human typing
        currentDelay = 0;
      } else {
        // For regular characters, use regular delay
        currentDelay = characterDelay.regular + Math.random() * characterDelay.regularDeviation;
      }

      // Render next character after delay
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + currentChar);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, currentDelay);

      // Clear timeout when component unmounts or delay configuration changes
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, targetText]);

  return <Markdown>{currentText}</Markdown>;
}
