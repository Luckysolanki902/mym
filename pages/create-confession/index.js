import CreateConfessionForm from '@/components/CreateConfessionForm'
import React from 'react'

const CreateConfession = () => {
    return (
        <div style={{ height:'80%'}}>
                    <h1 style={{  textAlign: 'center', fontFamily: 'ITC Kristen', fontWeight: '100', marginTop: '2rem',  }}>Create Confession</h1>
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden', alignItems: 'center', height:'100%' }} className='remcomponents' >
                <div style={{}}>
                    <div>
                        <CreateConfessionForm />
                    </div>

                </div>
            </div>

        </div>
    )
}

export default CreateConfession