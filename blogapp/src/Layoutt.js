import React from 'react'
import Head from './Head'
import { Outlet } from 'react-router-dom'
const Layoutt = () => {
  return (
    <main>
      <Head></Head>
      <Outlet/>
    </main>
  )
}

export default Layoutt