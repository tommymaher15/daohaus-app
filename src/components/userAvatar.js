import React, { useEffect, useState } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy } from 'react-icons/fa';

import { Flex, Avatar, Box, Skeleton, useToast, Icon } from '@chakra-ui/react';

import { truncateAddr } from '../utils/general';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { handleGetProfile } from '../utils/3box';

//  TODO Refactor copy UI
//  Build Generic user Avatar component for all avatars

const UserAvatar = ({ user, copyEnabled }) => {
  const [profile, setProfile] = useState(null);
  const { address } = useInjectedProvider();
  const toast = useToast();

  useEffect(() => {
    const getProfile = async () => {
      if (address) {
        try {
          const data = await handleGetProfile(address);
          if (data.status === 'error') {
            return;
          }
          setProfile(data);
        } catch (error) {
          console.log("MemberDoesn't have a profile");
        }
      }
    };

    getProfile();
  }, [address]);

  const handleNotifyCopied = () =>
    toast({
      title: 'Copied Address',
      position: 'top-right',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

  return (
    <Flex direction='row' alignItems='center'>
      {user && (
        <>
          <Avatar
            name={user.name || truncateAddr(user.memberAddress)}
            src={
              user?.image?.length
                ? `https://ipfs.infura.io/ipfs/${user?.image[0].contentUrl['/']}`
                : makeBlockie(user.memberAddress)
            }
            size='sm'
          />
          <Box
            ml={3}
            fontSize='sm'
            fontFamily='heading'
            d={['none', null, null, 'inline-block']}
          >
            {user?.name || truncateAddr(user.memberAddress)}
            <Box as='span' ml={1}>
              {user?.emoji && user.emoji}{' '}
            </Box>
            {copyEnabled === true && (
              <CopyToClipboard text={address} onCopy={handleNotifyCopied}>
                <Icon as={FaCopy} color='secondary.300' ml={2} />
              </CopyToClipboard>
            )}
          </Box>
        </>
      )}
      {!user &&
        (profile ? (
          <>
            <Avatar
              name={profile?.name || truncateAddr(address)}
              src={
                profile?.image?.length
                  ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
                  : makeBlockie(address)
              }
              size='sm'
            />
            <Box
              ml={3}
              fontSize='sm'
              fontFamily='heading'
              d={['none', null, null, 'inline-block']}
            >
              {profile?.name || truncateAddr(address)}
              <Box as='span' ml={1}>
                {profile?.emoji && profile.emoji}{' '}
              </Box>
              {copyEnabled === true && (
                <CopyToClipboard text={address} onCopy={handleNotifyCopied}>
                  <Icon as={FaCopy} color='secondary.300' ml={2} />
                </CopyToClipboard>
              )}
            </Box>
          </>
        ) : (
          <Skeleton isLoaded={address} m='0 auto'>
            {address && (
              <Flex direction='row' alignItems='center'>
                <Avatar name={address} src={makeBlockie(address)} size='sm' />
                <Box
                  fontSize='sm'
                  fontFamily='heading'
                  ml={3}
                  d={['none', null, null, 'inline-block']}
                >
                  {truncateAddr(address)}
                  {copyEnabled === true && (
                    <CopyToClipboard text={address} onCopy={handleNotifyCopied}>
                      <Icon as={FaCopy} color='secondary.300' ml={2} />
                    </CopyToClipboard>
                  )}
                </Box>
              </Flex>
            )}
          </Skeleton>
        ))}
    </Flex>
  );
};

export default UserAvatar;