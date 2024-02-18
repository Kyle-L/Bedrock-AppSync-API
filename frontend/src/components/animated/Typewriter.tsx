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
  const [target, setTarget] = useState(text);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (target !== text) {
      setTarget(text);
    }
  }, [target, text]);

  const characterDelay = {
    regular: 10,
    punctuation: 100,
    regularDeviation: 20,
    punctuationDeviation: 150,
    ...delay
  }

  useEffect(() => {
    if (currentIndex < target.length) {
      const currentChar = target[currentIndex];
      const prevChar = currentIndex > 0 ? target[currentIndex - 1] : ' ';

      let currentDelay;
      if (['.', ',', ';', ':', '!', '?'].includes(prevChar)) {
        currentDelay = characterDelay.punctuation + Math.random() * characterDelay.punctuationDeviation;
      } else if (prevChar === ' ') {
        currentDelay = 0;
      } else {
        currentDelay = characterDelay.regular + Math.random() * characterDelay.regularDeviation;
      }

      console.log(prevChar, currentDelay);

      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + currentChar);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, currentDelay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, target]);

  return <Markdown>{currentText}</Markdown>;
}