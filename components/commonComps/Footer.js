import React from 'react'
import styles from './styles/footer.module.css'
import Image from 'next/image'
import Link from 'next/link'
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';
const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.contactContainer} id='homecontactdiv'>
            <div className={styles.glassPanel}>
                <div className={styles.contactHeading}>
                    <p>Contact Us</p>
                    <span>Help us improve and grow.</span>
                </div>
                <div className={styles.contactContentWrap}>
                    <div className={styles.contactContent}>
                        <span>
                            <Image className={styles.contactIcon} width={95} height={89} alt='Email icon' src={'/images/othericons/mail.png'} />
                        </span>
                        <span>
                            <a className={styles.contactLink} href="mailto: luckysolanki902@gmail.com">connect@spyll.in</a>
                        </span>
                    </div>
                    <div className={styles.contactContent}>
                        <span>
                            <Image className={styles.contactIcon} width={95} height={89} alt='Instagram icon' src={'/images/othericons/instagramw.png'} />
                        </span>
                        <span>
                            <a target={'_blank'} rel='noreferrer' className={styles.contactLink} href="https://instagram.com/_spyll_">@_spyll_</a>
                        </span>
                    </div>
                </div>
                <div className={styles.metaRow}>
                    <div className={styles.tnc}>
                        <Link href={'/about-us'}>About Us</Link>
                        <span className={styles.separator}>/</span>
                        <Link href={'/how-we-protect-anonymity'}>How We Protect Anonymity</Link>
                    </div>
                    <p className={styles.copy}>© {currentYear} Spyll</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
