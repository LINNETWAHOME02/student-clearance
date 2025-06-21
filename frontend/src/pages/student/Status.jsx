import React from 'react'
import Layout from '../../layout/Layout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthProvider'

import { Users } from 'lucide-react'

const Status = () => {
    const { user } = useAuth();

  return (
    <>
        <Layout>
            <StatCard
                title="Cleared"
                value={user.first_name}
                subtitle="Under supervision"
                icon={Users}
                color="text-blue-600"
            />
        </Layout>
    </>
  )
}

export default Status