// components/fullPageComps/TextChatWrapper.js
import React from 'react';
import TextChat from '@/components/chatComps/TextChat';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { TextChatProvider } from '@/context/TextChatContext';
import { FiltersProvider } from '@/context/FiltersContext';

const TextChatWrapper = ({ userDetails }) => {
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);

  // Determine which userDetails to use
  const effectiveUserDetails = session && userDetails ? userDetails : unverifiedUserDetails;

  return (
    <FiltersProvider>
      <TextChatProvider>
        <TextChat userDetails={effectiveUserDetails} />
      </TextChatProvider>
    </FiltersProvider>
  );
};

export default TextChatWrapper;
