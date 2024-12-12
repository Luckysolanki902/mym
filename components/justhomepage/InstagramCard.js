import React from 'react'
import Image from 'next/image'
import { useMediaQuery } from '@mui/material'

const InstagramCard = () => {
    const isMobile = useMediaQuery('(max-width: 600px)');
    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: "1rem    2rem", borderRadius: '1rem', width:'70%', margin:'auto', cursor:'pointer', transition:'0.3s all cubic-bezier(0.075, 0.82, 0.165, 1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div><Image width={512} height={512} alt='Instagram_Full_text_logo' src={'/images/othericons/instagramplain.png'} style={{ width: '3rem', height: 'auto' }}></Image></div>
                <div style={{ fontWeight: '500' }}>@_mym_official</div>

            </div>
            {!isMobile && <div style={{fontSize:'1.5rem', fontFamily:'Jost'}}>
                For More Updates
                </div>}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div>Follow Us On</div>
                <div><Image width={958} height={360} src={'/images/othericons/instagramFull.png'} style={{ width: '6rem', height: 'auto' }} alt='Instagram_color_square_logo'></Image></div>

            </div>
        </div>
    )
}

export default InstagramCard