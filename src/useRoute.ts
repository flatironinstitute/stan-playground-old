import { useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export type Route = {
    page: 'home'
} | {
    page: 'analysis'
    analysisId: string
} | {
    page: 'workspace'
    workspaceId: string
}

const useRoute = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const p = location.pathname
    const route: Route = useMemo(() => {
        if (p.startsWith('/analysis/')) {
            const a = p.split('/')
            const analysisId = a[2]
            return {
                page: 'analysis',
                analysisId
            }
        }
        else if (p.startsWith('/workspace/')) {
            const a = p.split('/')
            const workspaceId = a[2]
            return {
                page: 'workspace',
                workspaceId
            }
        }
        else {
            return {
                page: 'home'
            }
        }
    }, [p])

    const setRoute = useCallback((r: Route) => {
        if (r.page === 'home') {
            navigate('/')
        }
        else if (r.page === 'analysis') {
            navigate(`/analysis/${r.analysisId}`)
        }
        else if (r.page === 'workspace') {
            navigate(`/workspace/${r.workspaceId}`)
        }
    }, [navigate])

    return {
        route,
        setRoute
    }    
}

export default useRoute