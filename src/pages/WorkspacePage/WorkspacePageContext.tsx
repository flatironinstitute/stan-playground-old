import React, { FunctionComponent, PropsWithChildren, useEffect, useMemo } from 'react';
import { createAnalysis, deleteWorkspace, fetchAnalyses, fetchWorkspace, setWorkspaceProperty, setWorkspaceUsers } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPAnalysis, SPWorkspace } from '../../types/stan-playground-types';

type Props = {
    workspaceId: string
}

type WorkspacePageContextType = {
    workspaceId: string
    workspace: SPWorkspace | undefined
    analyses: SPAnalysis[]
    createAnalysis: () => Promise<string>
    deleteWorkspace: () => Promise<void>
    setWorkspaceUsers: (users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[]) => Promise<void>
    setWorkspaceProperty: (property: 'anonymousUserRole' | 'loggedInUserRole', value: any) => Promise<void>
}

const WorkspacePageContext = React.createContext<WorkspacePageContextType>({
    workspaceId: '',
    workspace: undefined,
    analyses: [],
    createAnalysis: async () => {return ''},
    deleteWorkspace: async () => {},
    setWorkspaceUsers: async () => {},
    setWorkspaceProperty: async () => {},
})

export const SetupWorkspacePage: FunctionComponent<PropsWithChildren<Props>> = ({children, workspaceId}) => {
    const [analyses, setAnalyses] = React.useState<SPAnalysis[]>([])
    const [workspace, setWorkspace] = React.useState<SPWorkspace | undefined>(undefined)
    const [analysesRefreshCode, setAnalysesRefreshCode] = React.useState(0)
    const [workspaceRefreshCode, setWorkspaceRefreshCode] = React.useState(0)

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : undefined), [accessToken, userId])

    const createAnalysisHandler = useMemo(() => (async (): Promise<string> => {
        if (!auth) {
            throw Error('Not logged in')
        }
        const analysisId = await createAnalysis(workspaceId, auth)
        setAnalysesRefreshCode(rc => rc + 1)
        return analysisId
    }), [workspaceId, auth])

    const deleteWorkspaceHandler = useMemo(() => (async () => {
        if (!auth) {
            throw Error('Not logged in')
        }
        await deleteWorkspace(workspaceId, auth)
    }), [workspaceId, auth])

    const setWorkspaceUsersHandler = useMemo(() => (async (users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[]) => {
        if (!auth) {
            throw Error('Not logged in')
        }
        await setWorkspaceUsers(workspaceId, users, auth)
        setWorkspaceRefreshCode(rc => rc + 1)
    }), [workspaceId, auth])

    const setWorkspacePropertyHandler = useMemo(() => (async (property: 'anonymousUserRole' | 'loggedInUserRole', value: any) => {
        if (!auth) {
            throw Error('Not logged in')
        }
        await setWorkspaceProperty(workspaceId, property, value, auth)
        setWorkspaceRefreshCode(rc => rc + 1)
    }), [workspaceId, auth])

    useEffect(() => {
        (async () => {
            setAnalyses([])
            const analyses = await fetchAnalyses(workspaceId)
            setAnalyses(analyses)
        })()
    }, [analysesRefreshCode, workspaceId])

    useEffect(() => {
        (async () => {
            setWorkspace(undefined)
            const workspace = await fetchWorkspace(workspaceId)
            setWorkspace(workspace)
        })()
    }, [workspaceId, workspaceRefreshCode])

    const value = React.useMemo(() => ({
        workspaceId,
        workspace,
        analyses,
        createAnalysis: createAnalysisHandler,
        deleteWorkspace: deleteWorkspaceHandler,
        setWorkspaceUsers: setWorkspaceUsersHandler,
        setWorkspaceProperty: setWorkspacePropertyHandler
    }), [analyses, workspace, createAnalysisHandler, deleteWorkspaceHandler, setWorkspaceUsersHandler, setWorkspacePropertyHandler, workspaceId])

    return (
        <WorkspacePageContext.Provider value={value}>
            {children}
        </WorkspacePageContext.Provider>
    )
}

export const useWorkspace = () => {
    const context = React.useContext(WorkspacePageContext)
    return {
        workspaceId: context.workspaceId,
        workspace: context.workspace,
        analyses: context.analyses,
        createAnalysis: context.createAnalysis,
        deleteWorkspace: context.deleteWorkspace,
        setWorkspaceUsers: context.setWorkspaceUsers,
        setWorkspaceProperty: context.setWorkspaceProperty
    }
}