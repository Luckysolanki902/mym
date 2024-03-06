import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';
// import { MobileView } from 'react-device-detect';

const AudioCallControls = ({
    isFindingPair,
    handleFindNewButton,
    handleToggleMute,
    isMuted,
    isPartnerMuted,
    handleTogglePartnerMute
}) => {

    return (
        <div className={styles.inputContainerMainDiv}>
            <div className={`${styles.inputContainer}`}>
                {/* Find New Button */}
                <button className={styles.newButton} disabled={isFindingPair} onClick={handleFindNewButton} title="Find New">
                    {isFindingPair ? (
                        <CircularProgress size={24} style={{ color: 'white' }} />
                    ) : (
                        <Image
                            src={'/images/sidebaricons/randomchat.png'}
                            width={1080 / 10}
                            height={720 / 10}
                            alt="icon"
                            className={styles.randomIcon}
                        />
                    )}
                </button>

                {/* Mute Button */}
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                    <IconButton onClick={handleToggleMute} disabled={isFindingPair}>
                        {isMuted ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isPartnerMuted ? '' : 'Silence'}>
                        <IconButton onClick={handleTogglePartnerMute}>
                            {isPartnerMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </IconButton>
                    </Tooltip>

                {/* Toggle Loudspeaker Button (For Phone Only) */}
                {/* <MobileView>
                    <Tooltip title={isLoudspeaker ? 'Switch to Earpiece' : 'Switch to Loudspeaker'}>
                        <IconButton onClick={handleToggleLoudspeaker} disabled={isFindingPair}>
                            {isLoudspeaker ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </IconButton>
                    </Tooltip>
                </MobileView> */}
            </div>
        </div>
    );
};

export default AudioCallControls;
