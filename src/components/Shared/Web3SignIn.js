import React from 'react';
import Web3Modal from 'web3modal';
import { useToast, Button } from '@chakra-ui/react';

import { w3connect, providerOptions } from '../../utils/auth';
import { useNetwork, useWeb3Connect } from '../../contexts/PokemolContext';
import { supportedChains } from '../../utils/chains';

export const Web3SignIn = () => {
  const [, updateWeb3Connect] = useWeb3Connect();
  const [network] = useNetwork();
  const toast = useToast();

  return (
    <>
      <Button
        onClick={async () => {
          const _web3Connect = {
            w3c: new Web3Modal({
              network: network ? network.network : 'mainnet',
              providerOptions: providerOptions(network || supportedChains[1]),
              cacheProvider: true,
              theme: 'dark',
            }),
          };

          try {
            console.log(
              'connecting from button _web3Connect, network',
              _web3Connect,
              network,
            );
            const { w3c, web3, provider } = await w3connect(
              _web3Connect,
              network,
            );
            updateWeb3Connect({ w3c, web3, provider });

            // window.location.reload();
          } catch (err) {
            console.log('web3Connect error', err);

            toast({
              title: 'Wrong Network',
              position: 'top-right',
              description: err?.msg || "Couldn't connect to injected network",
              status: 'warning',
              duration: 9000,
              isClosable: true,
            });
          }
        }}
      >
        {' '}
        Connect
      </Button>
    </>
  );
};
