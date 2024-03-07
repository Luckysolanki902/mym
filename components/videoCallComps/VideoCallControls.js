import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';

const VideoCallControls = ({
    isFindingPair,
    handleFindNewButton,
    handleToggleMyAudio,
    handleTogglePartnerAudio,
    isMyAudioMuted,
    isPartnerAudioMuted,
    handleToggleMyVideo,
    handleTogglePartnerVideo,
    isMyVideoDisabled,
    isPartnerVideoDisabled,
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

                {/* Mute/Unmute Button */}
                <Tooltip title={isMyAudioMuted ? 'Unmute' : 'Mute'}>
                    <IconButton onClick={handleToggleMyAudio} disabled={isFindingPair}>
                        {isMyAudioMuted ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                </Tooltip>

                {/* Partner Mute/Unmute Button */}
                <Tooltip title={isPartnerAudioMuted ? 'Unmute Partner' : 'Mute Partner'}>
                    <IconButton onClick={handleTogglePartnerAudio} disabled={isFindingPair}>
                        {isPartnerAudioMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                    </IconButton>
                </Tooltip>

                {/* Toggle Video Button */}
                <Tooltip title={isMyVideoDisabled ? 'Enable Video' : 'Disable Video'}>
                    <IconButton onClick={handleToggleMyVideo} disabled={isFindingPair}>
                        {isMyVideoDisabled ? <VideocamOffIcon /> : <VideocamIcon />}
                    </IconButton>
                </Tooltip>


            </div>
        </div>
    );
};

export default VideoCallControls;
