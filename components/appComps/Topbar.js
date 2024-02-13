import React from 'react'
import Image from 'next/image'
import SwipeableTemporaryDrawer from '@/components/appComps/Drawer';
import styles from './styles/topbar.module.css'

const Topbar = () => {
  return (
    <div className={`topbarheight ${styles.mainDiv}`}>
      <Image src={'/images/mym_logos/mymlogoinvert2.png'} width={724 / 3} height={338 / 3} alt='mym' style={{ height: '60%', width: 'auto' }}></Image>
      <div style={{display:'flex', alignItems:'center'}}>
        <SwipeableTemporaryDrawer />
      </div>
    </div>
  )
}

export default Topbar;