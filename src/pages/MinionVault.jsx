import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { useToken } from '../contexts/TokenContext';
import BankChart from '../components/bankChart';
import BalanceList from '../components/balanceList';
import MainViewLayout from '../components/mainViewLayout';
import TextBox from '../components/TextBox';
import VaultNftCard from '../components/vaultNftCard';
import CrossDaoInternalBalanceList from '../components/crossDaoInternalBalanceList';
import { fetchMinionInternalBalances } from '../utils/theGraph';
import { fetchNativeBalance } from '../utils/tokenExplorerApi';
import { supportedChains } from '../utils/chain';
import { vaultConfigByType } from '../data/vaults';

const MinionVault = ({ overview, customTerms, daoVaults }) => {
  const { daochain, minion } = useParams();
  const { currentDaoTokens } = useToken();
  const toast = useToast();
  const [vault, setVault] = useState(null);
  const [erc20Balances, setErc20Balances] = useState(null);
  const [nativeBalance, setNativeBalance] = useState(null);
  const [internalBalances, setInternalBalances] = useState(null);

  const handleCopy = () => {
    toast({
      title: 'Vault Address Copied',
      position: 'top-right',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const ctaButton = (
    <Flex>
      <CopyToClipboard text={vault?.address} mr={2} onCopy={handleCopy}>
        <Button>Copy Address</Button>
      </CopyToClipboard>
    </Flex>
  );

  useEffect(() => {
    const setupBalanceData = async () => {
      // setup minion erc20 list data (native token, erc20s, internal balances)
      const vaultMatch = daoVaults.find(vault => {
        return vault.address === minion;
      });
      // TODO: shape this on the api side and remove formatting here
      const tempFormattedVaultData = vaultMatch.erc20s.map(token => {
        return {
          ...token,
          id: token.contractAddress,
          logoUri: token.logoURI,
          tokenAddress: token.contractAddress,
          tokenBalance: token.balance,
          tokenName: token.name,
          totalUSD: token.usd * (+token.balance / 10 ** +token.decimals),
        };
      });

      const nativeBalance = await fetchNativeBalance(minion, daochain);
      if (+nativeBalance > 0) {
        // TODO: need better native data and move to a helper/maybe up in context
        setNativeBalance([
          {
            isNative: true,
            totalUSD: 0,
            usd: 0,
            id: daochain,
            logoUri: '',
            tokenAddress: daochain,
            tokenBalance: nativeBalance,
            decimals: '18',
            tokenName: supportedChains[daochain].nativeCurrency,
            symbol: supportedChains[daochain].nativeCurrency,
          },
        ]);
      }

      const internalBalanceRes = await fetchMinionInternalBalances({
        chainID: daochain,
        minionAddress: minion,
      });

      const internalBalanceData = internalBalanceRes
        .flatMap(dao => {
          return dao.tokenBalances.map(b => {
            return { ...b, moloch: dao.moloch, meta: dao.meta };
          });
        })
        .filter(bal => +bal.tokenBalance > 0);

      setVault({
        ...vaultMatch,
        config: vaultConfigByType[vaultMatch.type],
      });
      setErc20Balances(tempFormattedVaultData);
      setInternalBalances(internalBalanceData);
    };
    if (daoVaults && minion) {
      setupBalanceData();
    }
  }, [daoVaults, minion]);

  return (
    <MainViewLayout
      header={`${vault?.name || ''}`}
      customTerms={customTerms}
      headerEl={vault ? ctaButton : null}
      isDao
    >
      {!vault && <Spinner />}
      {vault && (
        <Flex wrap='wrap'>
          <Box
            w={['100%', null, null, null, '70%']}
            pr={[0, null, null, null, 6]}
            pb={6}
          >
            <BankChart
              overview={overview}
              customTerms={customTerms}
              minionVault={vault}
              balanceData={vault.balanceHistory}
              daoVaults={daoVaults}
              visibleVaults={[vault]}
            />
            <CrossDaoInternalBalanceList
              tokens={internalBalances}
              currentDaoTokens={currentDaoTokens}
            />
            <BalanceList vaultConfig={vault.config} balances={erc20Balances} />
            {nativeBalance && (
              <BalanceList
                vaultConfig={vault.config}
                balances={nativeBalance}
                isNativeToken
              />
            )}
          </Box>
          <Box
            w={['100%', null, null, null, '30%']}
            pr={[0, null, null, null, 6]}
            pb={6}
          >
            {vault.nfts.length > 0 && (
              <>
                <Flex direction='row' justify='space-between'>
                  <TextBox w='100%'>NFTS</TextBox>
                  {/* <TextBox w='100%' fontcolor='secondary'>
                    <Link
                      to={`/dao/${daochain}/${daoid}/gallery/minion/${minion}`}
                    >
                      View Gallery
                    </Link>
                  </TextBox> */}
                </Flex>
                {vault.nfts.map((nft, i) => (
                  <VaultNftCard nft={nft} key={i} />
                ))}
              </>
            )}
          </Box>
        </Flex>
      )}
    </MainViewLayout>
  );
};

export default MinionVault;