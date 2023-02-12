import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface SnowProps {
    duration: number;
    size: number;
    color: string;
}

const Snow: React.FC<SnowProps> = ({ duration, size, color }) => {
    const snowflakeVariants: Variants = {
        initial: {
            y: '-10vh',
            x: Math.random() * window.innerWidth,
            opacity: 0,
        },
        animate: {
            y: '100vh',
            x: Math.random() * window.innerWidth,
            opacity: 1,
            transition: {
                duration: duration,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
            },
        },
    };

    return (
        <motion.div
            className="fixed pointer-events-none inset-0 z-10"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: color,
                filter: 'blur(1px)',
            }}
            initial="initial"
            animate="animate"
            variants={snowflakeVariants}
        />
    );
};

export default function Snowfall({ count = 100 }: { count?: number }) {
    const snowflakes = [];

    for (let i = 0; i < count; i++) {
        snowflakes.push(
            <Snow
                key={i}
                duration={Math.random() * 60 + 5}
                size={Math.random() * 5 + 5}
                color="#fff"
            />
        );
    }

    return <>{snowflakes}</>;
}