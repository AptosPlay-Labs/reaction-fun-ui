// src/components/Atom.tsx
import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

const Atom: React.FC<{ count: number }> = ({ count }) => {
  const orbits = [];
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Genera un ángulo de rotación aleatorio entre 0 y 360 grados
    const randomRotation = Math.floor(Math.random() * 360);
    setRotation(randomRotation);
  }, []);

  for (let i = 0; i < count; i++) {
    orbits.push(
      <Box key={i} className="orbit">
        <Box className="electron" />
      </Box>
    );
  }

  return (
    <Box id="atom" style={{ transform: `rotate(${rotation}deg)` }}>
      <Box id="nucleus"></Box>
      {orbits}
    </Box>
  );
};

export default Atom;
