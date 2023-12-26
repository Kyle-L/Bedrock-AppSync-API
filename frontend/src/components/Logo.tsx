import { motion } from 'framer-motion';

export default function Logo({
  title,
  subtitle,
  description,
  picture
}: {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  picture?: string | null;
}) {
  const initial = { y: -50, opacity: 0 };
  const animate = { y: 0, opacity: 1 };
  const transition = { type: 'spring', stiffness: 100, damping: 10 };

  const initial2 = { x: 50, opacity: 0 };
  const animate2 = { x: 0, opacity: 1 };
  const transition2 = { type: 'spring', stiffness: 100, damping: 10 };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center items-center lg:flex-row flex-col mb-6">
        {picture && (
          <motion.img
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.5 }}
            src={picture}
            className="mr-4 w-32 h-32 rounded-full my-auto"
          />
        )}
        <div className="block text-left my-auto">
          <motion.h1
            className="lg:text-5xl text-4xl font-semibold"
            initial={initial}
            animate={animate}
            transition={{ ...transition }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="lg:text-2xl text-xl font-normal"
              initial={initial2}
              animate={animate2}
              transition={{ ...transition2, delay: 0.25 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
      <div>
        {description && (
          <motion.p
            className="text-lg font-thin mt-2 text-center"
            initial={initial2}
            animate={animate2}
            transition={{ ...transition2, delay: 0.25 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
