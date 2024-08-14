export type Project = {
    name: string;
    desc: string;
    link: string;
  }
  
  export const products: Project[] = [
    {
      name: 'Aptos SDK',
      desc: 'Aptos SDK for JavaScript and TypeScript for interacting with the Aptos blockchain.',
      link: 'https://github.com/aptos-labs/aptos-core/tree/main/sdk',
    },
    {
      name: 'Aptos Move',
      desc: 'Move programming language for the Aptos blockchain.',
      link: 'https://move-language.github.io/move/',
    },
    {
      name: 'Petra Wallet',
      desc: 'The official wallet for Aptos.',
      link: 'https://www.petra.app/',
    },
    {
      name: 'Aptos Academy',
      desc: 'Educational resources and tutorials for learning Aptos.',
      link: 'https://aptos.dev/academy/',
    },
    {
      name: 'Aptos CLI',
      desc: 'Command-line interface for managing Aptos accounts and transactions.',
      link: 'https://github.com/aptos-labs/aptos-core/tree/main/cli',
    },
    {
      name: 'Aptos Explorer',
      desc: 'Blockchain explorer for Aptos.',
      link: 'https://explorer.aptos.dev/',
    },
  ];
  
  export const dependencies: Project[] = [
    {
      name: 'Aptos SDK',
      desc: 'Official SDK for interacting with the Aptos blockchain.',
      link: 'https://github.com/aptos-labs/aptos-core/tree/main/sdk',
    },
    {
      name: 'React',
      desc: 'A JavaScript library for building user interfaces.',
      link: 'https://reactjs.org/',
    },
    {
      name: 'Next.js',
      desc: 'A React Framework that supports hybrid static & server rendering.',
      link: 'https://nextjs.org/',
    },
    {
      name: 'Chakra UI',
      desc: 'A simple, modular and accessible component library for React.',
      link: 'https://chakra-ui.com/',
    },
  ];