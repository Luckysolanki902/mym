import React from 'react'
import Link from 'next/link'
const index = () => {
    return (
        <div style={{ padding: '1rem', display: 'flex', maxWidth: '1000px', justifyContent: 'flex-start', flexDirection:'column', margin:'auto' }}>
            <h1>Admin Homepage</h1>
           <section style={{padding:"1rem"}}>
            <Link style={{ color: 'white', textDecoration: 'none' }} href={'/admin/confessions'}>Confessions</Link>
            
            </section> 
        </div>
    )
}

export default index