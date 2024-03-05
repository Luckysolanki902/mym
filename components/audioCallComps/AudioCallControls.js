// AudioCallControls.js
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';

const AudioCallControls = ({
    isFindingPair,
    handleFindNewButton,
}) => {
    return (
        <div className={styles.inputContainerMainDiv} >

            <div className={`${styles.inputContainer}`}>
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
            </div>
        </div>
    );
};

export default AudioCallControls;
