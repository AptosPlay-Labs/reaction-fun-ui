import { Box, Container, Link, Stack } from "@chakra-ui/react";
import {
    Text,
    useColorModeValue,
    useTheme,
  } from "@interchain-ui/react";

export function FooterFun(){
  return (
    <Box py={4}>
      <Container maxW="container.xl">
        <Stack direction="row" spacing={4} justify="space-between" align="center">
          <Text>&copy; {new Date().getFullYear()} Reactives.fun. All rights reserved.</Text>
          <Stack direction="row" spacing={6}>
            {/* <Link href="https://twitter.com" isExternal>
              Twitter
            </Link>
            <Link href="https://github.com" isExternal>
              GitHub
            </Link>
            <Link href="https://www.linkedin.com" isExternal>
              LinkedIn
            </Link> */}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};