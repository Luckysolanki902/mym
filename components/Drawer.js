import * as React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '@/components/componentStyles/topbar.module.css';


export default function SwipeableTemporaryDrawer(props) {
    const router = useRouter();

    const isActive = (href) => {
        return router.asPath === href;
    };

    const [state, setState] = React.useState({
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const list = (anchor) => (
        <div
            className={styles.MainCont}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <div className={styles.imageCont}>
                <Image className={styles.logoImage} src={'/images/mym_logos/mymlogoinvert2.png'} width={724 / 2} height={338 / 2} alt="mym" title='maddy logo' />
            </div>
            <List className={styles.list}>
                {[
                    { text: 'Home', href: '/' },
                    { text: 'Option 2', href: '/#homecontactdiv' },
                    { text: 'Option 3', href: '/#searchyourbikeinput' },
                    { text: 'Option 4', href: '/bikenotfound' },
                ].map((item, index) => (
                    <ListItem
                        key={item.text}
                        className={`${styles.sideBarListItem} ${isActive(item.href) ? styles.activeListItem : ''}`}
                    >
                        <Link href={item.href} className={styles.sideBarLinks} passHref>
                            <ListItemButton className={styles.sideBarListItem}>
                                <ListItemIcon className={styles.listItemIcon}>
                                    {index === 0 ? (
                                        <HomeRoundedIcon className={styles.sideIcon} />
                                    ) : index === 1 ? (
                                        <PhoneIcon className={styles.sideIcon} />
                                    ) : index === 2 ? (
                                        <SearchIcon className={styles.sideIcon} />
                                    ) : (
                                        <ReportProblemRoundedIcon className={styles.sideIcon} />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <h3 className={styles.linkText}>
                                            {item.text}
                                        </h3>
                                    }
                                    className={styles.link}
                                />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <div className={styles.drawermain}>
            <Button
                onClick={toggleDrawer('right', true)}
                startIcon={<MenuIcon className={styles.menuIcon} style={{fontSize:'40px'}}/>}
            >
            </Button>
            <SwipeableDrawer
                anchor="right"
                open={state['right']}
                onClose={toggleDrawer('right', false)}
                onOpen={toggleDrawer('right', true)}
                className={styles.swipeableDrawer}
            >
                {list('right')}
            </SwipeableDrawer>
        </div>
    );
}
