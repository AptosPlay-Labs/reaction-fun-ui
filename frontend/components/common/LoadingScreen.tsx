// src/components/LoadingScreen.tsx
import React from "react";
import { Box, Spinner } from "@chakra-ui/react";

export function LoadingScreen() {

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgColor="rgba(0, 0, 0, 0.5)"
      zIndex="9999"
    >
      <Spinner size="xl" color="white" />
    </Box>
  );
};
