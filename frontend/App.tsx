import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
//import { Header } from "./components/Header";
//import { useState } from "react";
import { WalletSelector } from "./components/WalletSelector";
//import { WalletDetails } from "./components/WalletDetails";
//import { NetworkInfo } from "./components/NetworkInfo";
//import { AccountInfo } from "./components/AcoountInfo";
import { Flex } from "@chakra-ui/react";
//import { CHAIN_NAME } from "./config";
import { notificateStore } from "./store/notificateStore";
import { Layout, GameBoard, GameRooms, GameBoardVisual } from "./components";

import {
  
  ThemeProvider,
} from '@chakra-ui/react';

import {
  Box,
  useColorModeValue,
  useTheme
} from '@interchain-ui/react'

import { px } from "framer-motion";
import { Header } from "./components/common/Header";

function App() {
  const { connected } = useWallet();
  const { themeClass } = useTheme();
  const { currentRoom, isSpectator, setNotifyCurrentRoom, setIsSpectator } = notificateStore();




  return (
    <>
      <Box
        className={themeClass}
        minHeight="100dvh"
        backgroundColor={useColorModeValue('$white', '$background')}

      >
        <Layout>
          <WalletSelector></WalletSelector>
          <div className="flex items-center justify-center flex-col">
            {connected ? (
              <Card>
                <Flex justify="center">
                  {(!currentRoom || isSpectator) && (
                    <Box mx={2} >
                      <GameRooms />
                    </Box>
                  )}
                  {(currentRoom && !isSpectator) && (
                    <Box mx={2}>
                      <GameBoard />
                    </Box>
                  )}
                  {(currentRoom && isSpectator) && (
                    <Box mx={2}>
                      <GameBoardVisual />
                    </Box>
                  )}
                </Flex>
              </Card>
            ) : (
              <CardHeader>
                <CardTitle>To get started Connect a wallet</CardTitle>
              </CardHeader>
            )}
          </div>
        </Layout>
      </Box>
    </>
  );
}

export default App;
