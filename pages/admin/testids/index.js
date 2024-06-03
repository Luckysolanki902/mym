import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Container, List, ListItem, ListItemText } from '@mui/material';

const Index = () => {
    return (
        <div>

            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" style={{ flexGrow: 1, textAlign:'center', cursor:'pointer' }}>
                        <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Admin Panel
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>
        <div style={{ padding: '1rem', display: 'flex', maxWidth: '1000px', justifyContent: 'flex-start', flexDirection: 'column', margin: 'auto' }}>
            <Container maxWidth="lg" style={{ paddingTop: '2rem' }}>
                <Typography variant="h3" gutterBottom>
                    Admin TestIds
                </Typography>
                <div style={{ marginTop: '2rem' }}>
                    <List>
                        <ListItem button component={Link} href="/admin/testids/add">
                            <ListItemText primary="Add TestId" />
                        </ListItem>
                        <ListItem button component={Link} href="/admin/testids/editdetails">
                            <ListItemText primary="Edit Details" />
                        </ListItem>
                    </List>
                </div>
            </Container>
        </div>
        </div>
    );
}

export default Index;
