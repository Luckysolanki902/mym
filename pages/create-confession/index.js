import CreateConfessionForm from '@/components/CreateConfessionForm'
import React, { useState, useEffect } from 'react';

import { useAuth } from '@/AuthContext';

const CreateConfession = () => {
    const { loading, userDetails } = useAuth();

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (

                <div style={{ height: '80%' }}>
                    <h1 style={{ textAlign: 'center', fontFamily: 'ITC Kristen', fontWeight: '100', marginTop: '2rem', }}>Create Confession</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden', alignItems: 'center', height: '100%' }} className='remcomponents' >
                        <CreateConfessionForm userDetails={userDetails}/>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateConfession