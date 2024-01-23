import CreateConfessionForm from '@/components/CreateConfessionForm'
import React from 'react'

const CreateConfession = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden', alignItems:'center', justifyContent:'center' }} className='remcomponents' >
            <div>
            <h1 style={{margin:'0', textAlign:'center', fontFamily:'ITC Kristen', fontWeight:'100', margin:'2rem', marginTop:'0'}}>Create Confession</h1>
            <div>
                <CreateConfessionForm />
            </div>

            </div>
        </div>
    )
}

export default CreateConfession