// src/components/Grid.tsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import Atom from './Atom';
import Atom3d from './Atom3d';
import ExplodingCell from './ExplodingCell';

const Grid: React.FC<{ grid: any[]; isBet:boolean|null; handleClick: (rowIndex: number, colIndex: number) => void; primaryColor: string }> = ({ grid, isBet, handleClick, primaryColor }) => {
  return (
    <Box className="grid">
      {grid.map((row, rowIndex) => (
        <Box key={rowIndex} className="row">
          {row.map((cell:any, colIndex:any) => (
            <Box
              key={colIndex}
              className={`cell ${cell.player?.color}`}
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell.count < 4 ? (
                <>
                {isBet?(
                    <Atom3d count={cell.count} />
                ):(
                    <Atom count={cell.count} />
                )}
                </>
              ) : (
                <ExplodingCell count={cell.count} onExplode={() => handleClick(rowIndex, colIndex)} />
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default Grid;
