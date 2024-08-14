import Head from 'next/head';
import { Box, Container } from '@interchain-ui/react';
import { FooterFun } from './FooterFun';
import { Header} from "../common/Header"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // maxWidth="64rem" attributes={{ py: '$8' }}
    <Container attributes={{ pt: '$8', px:'0px' }}>
      <Head>
        <title>reactives.fun</title>
        <meta name="description" content="Reactives Chain Funny a gameFi on Cosmos" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Box minHeight="100dvh"> 
      <Header></Header>
        {children}
      </Box>
      {/* <Footer /> */}
      <FooterFun/>
    </Container>
  );
}
