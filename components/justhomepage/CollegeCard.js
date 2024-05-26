import React from 'react'
import styles from './styles/collegecard.module.css'
const CollegeCard = ({ firstname, lastname, live }) => {
    return (
        <div className={styles.main}>
            <div className={styles.center}>
                <h1>{firstname} <br /> {lastname}</h1>
                {live ?
                    <div className={styles.liveParent}><span className={styles.circle}></span>LIVE</div>
                    :
                    <div className={styles.csParent}>Coming <br /> Soon</div>
                }

            </div>
        </div>
    )
}

export default CollegeCard