import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

export function useStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setData(await api.stats())
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

export function useOrgs() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setData(await api.orgs())
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

export function useOrg(id) {
  const [data, setData] = useState(null)
  const [members, setMembers] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [org, mem] = await Promise.all([api.org(id), api.members(id)])
      setData(org)
      setMembers(mem)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])
  return { data, members, loading, refetch: load }
}
