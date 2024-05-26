import React from 'react'
import Link from 'next/link'
const index = () => {
    return (
        <div style={{ padding: '1rem', display: 'flex', maxWidth: '1000px', justifyContent: 'flex-start', flexDirection:'column', margin:'auto' }}>
            <h1>Test Ids</h1>
           <section style={{padding:"1rem", display:'flex', flexDirection:'column', gap:'1rem'}}>
            <Link style={{ color: 'white', textDecoration: 'none' }} href={'/admin/testids/add'}>Add TestId</Link>
            <Link style={{ color: 'white', textDecoration: 'none' }} href={'/admin/testids/editdetails'}>Edit Details</Link>
            </section> 
        </div>
    )
}

export default index