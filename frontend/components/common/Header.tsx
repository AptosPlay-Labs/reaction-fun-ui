import React from "react";
import { dependencies } from "../../config";
import ChainReactionIcon from "./ChainReactionIcon";
import { Flex, VStack, Box, Button, Text} from "@chakra-ui/react";
import { useColorModeValue, useTheme, Icon } from "@interchain-ui/react"
// parece que solo funciona con interchainUI el useTheme como función o algo
import { notificateStore } from "../../store/notificateStore";

//const stacks = ["Cosmos", "reactive.fun"];

const stargazejs = dependencies[0];

export function Header() {
  const { theme, setTheme } = useTheme();
  
  const { address, username } = notificateStore();
  const toggleColorMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <Box display="flex" justifyContent="end" alignItems="center" mb="1" pt="8px" px="26px">
        {/* Contenedor para el selector de cadenas y el botón de conexión */}
        <VStack alignItems="center" mx="6px">
          <Flex alignItems="center">
            <div>
              {address}
            </div>
          </Flex>
        </VStack>
        <Button
          variant="secondary"
          size="sm"
          paddingX={0}
          onClick={toggleColorMode}
        >
          <Icon name={useColorModeValue("moonLine", "sunLine")} />
        </Button>
      </Box>

      <Box textAlign="center">
        <Flex justify="center" align="center">
          <Text>
            <ChainReactionIcon />
          </Text>
          
          <Text
            as="h1"
            fontWeight="extrabold"
            fontSize={{ base: "6xl", md: "10xl" }}
            mb="8"
          >
            Reactives.fun
          </Text>
        </Flex>
        
        <Text as="h2" fontWeight="bold">
          <Text
            as="span"
            fontSize={{ base: "2xl", md: "4xl" }}
          >
            Welcome to&nbsp;
          </Text>
         
          <Text
            as="span"
            fontSize={{ base: "2xl", md: "4xl" }}
          >
            Reactives Chain Funny a
          </Text>
          <Text
            as="span"
            fontSize={{ base: "2xl", md: "4xl" }}
            // color={useColorModeValue("$primary500", "$primary200")}
          >
            &nbsp;gameFi
          </Text>
          <Text
            as="span"
            fontSize={{ base: "2xl", md: "4xl" }}
          >
            &nbsp;on Cosmos
          </Text>
        </Text>
      </Box> 
    </>
  );
}
