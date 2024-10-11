 import React, { useEffect, useState } from 'react'
 import Post from "../Post"

 const Indexpage = () => {
  const [posts , setPosts] = useState([]);
   useEffect(()=>{
    fetch('http://localhost:4000/post').then(response =>{
      response.json().then(posts =>{
        // console.log(posts);
        setPosts(posts);
      })
    })
  },[]);
   return (
     <div className='parent-front'>
      <div className='front'>
      {
        posts.length > 0 ? (posts.map(post=>(
          <Post {...post}/>
        ))) : <h1>Loading!!!</h1>
      }
     </div>
     </div>
   )
 }
 
 export default Indexpage