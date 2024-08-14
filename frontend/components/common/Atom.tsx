// src/components/Atom.tsx
import React from 'react';
import { Box } from '@chakra-ui/react';

const Atom: React.FC<{ count: number }> = ({ count }) => {
  const atoms = [];

  for (let i = 0; i < count; i++) {
    atoms.push(
      <Box key={i} className="atom" />
    );
  }

  return <Box className="atoms-container">{atoms}</Box>;
};

export default Atom;
