import AlternativesOfOmegle from '@/components/blogs/articles/AlternativesOfOmegle';
import OmegleVsSpyll from '@/components/blogs/articles/OmeglevsSpyll';
import React from 'react'

const topic = ({topic}) => {

    const articles = {
        'alternatives-to-omegle': AlternativesOfOmegle,
        'omegle-vs-spyll': OmegleVsSpyll,

      };

    const Component = articles[topic];

    if (!Component) {  
        return <h2 style={{ margin:'1rem'}}>Article not found</h2>;
     }
    
  return (
    <div style={{padding:'3rem 0'}}>
        <Component />
    </div>


  )
}

export default topic


export async function getServerSideProps(context) {
    const topic = context.params.topic ;

    return {
        props: {
            topic
        }
    }
}