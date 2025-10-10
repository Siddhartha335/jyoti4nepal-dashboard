import React from 'react'
import AdminShell from '@components/layout'

const Adminlayout = ({children}:{
    children:React.ReactNode
}) => {
  return (
    <AdminShell>
        {children}
    </AdminShell>
  )
}

export default Adminlayout