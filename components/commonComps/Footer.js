import React from 'react'
import styles from './styles/footer.module.css'
import Image from 'next/image'
import Link from 'next/link'
const Footer = () => {
    return (
        <div>
            <div className={styles.contactContainer} id='homecontactdiv'>
                <div className={styles.contactHeading}>
                    Contact Us
                </div>
                {/* <div className={styles.contactContent}>
                    <span><Image width={95} height={89} alt='icon' src={'/images/othericons/whatsappwhite.png'} priority={true}></Image></span>
                    <span style={{ cursor: 'pointer' }}> <a className={styles.contactLink} style={{ color: 'white' }} href="tel: 9027495997">9027495997</a>, <a className={styles.contactLink} style={{ color: 'white' }} href="tel: 6395809873">6395809873</a> </span>
                </div> */}
                <div className={styles.contactContent}>
                    <span><Image width={95} height={89} alt='icon' src={'/images/othericons/mail.png'} priority={true}></Image></span>
                    <span style={{ cursor: 'pointer' }}><a className={styles.contactLink} style={{ color: 'white' }} href="mailto: connect.meetyourmate@gmail.com">connect.meetyourmate@gmail.com</a></span>
                </div>
                <div className={styles.contactContent}>
                    <span><Image width={95} height={89} alt='icon' src={'/images/othericons/instagramw.png'} priority={true}></Image></span>
                    <span style={{ cursor: 'pointer' }}><a target={'_blank'} className={styles.contactLink} style={{ color: 'white' }} href="https://instagram.com/_mym_official?igshid=NGVhN2U2NjQ0Yg==">@_mym_official</a></span>
                </div>

                <div className={styles.tnc}>
                     <Link href={'/about-us'} style={{color:'white', textDecoration:'none'}}>About Us</Link>  | <Link href={'/termsandconditions'} style={{color:'white', textDecoration:'none'}}>Terms and Conditions</Link> </div>

            </div>
        </div>
    )
}

export default Footer
