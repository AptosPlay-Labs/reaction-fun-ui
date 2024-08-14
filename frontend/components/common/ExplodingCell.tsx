import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@chakra-ui/react';

const ExplodingCell: React.FC<{ count: number; onExplode: () => void }> = ({ count, onExplode }) => {
  return (
    <AnimatePresence>
      {count === 4 && (
        <motion.div
          className="explosion"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 0] }}
          exit={{ scale: 0 }}
          transition={{ duration: 1 }}
          onAnimationComplete={onExplode}
        >
          <Box className="explosion" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExplodingCell;
