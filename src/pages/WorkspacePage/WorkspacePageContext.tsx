import React, { FunctionComponent, PropsWithChildren, useEffect, useMemo } from 'react';
import { createAnalysis, deleteWorkspace, fetchAnalyses, fetchWorkspace, fetchWorkspaces, setWorkspaceUsers } from '../../dbInterface/dbInterface';
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
}

const WorkspacePageContext = React.createContext<WorkspacePageContextType>({
    workspaceId: '',
    workspace: undefined,
    analyses: [],
    createAnalysis: async () => {return ''},
    deleteWorkspace: async () => {},
    setWorkspaceUsers: async () => {}
})

export const SetupWorkspacePage: FunctionComponent<PropsWithChildren<Props>> = ({children, workspaceId}) => {
    const [analyses, setAnalyses] = React.useState<SPAnalysis[]>([])
    const [workspace, setWorkspace] = React.useState<SPWorkspace | undefined>(undefined)
    const [refreshCode, setRefreshCode] = React.useState(0)

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : undefined), [accessToken, userId])

    const createAnalysisHandler = useMemo(() => (async (): Promise<string> => {
        if (!auth) {
            throw Error('Not logged in')
        }
        const analysisId = await createAnalysis(workspaceId, auth)
        setRefreshCode(rc => rc + 1)
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
    }), [workspaceId, auth])

    useEffect(() => {
        (async () => {
            setAnalyses([])
            const analyses = await fetchAnalyses(workspaceId)
            setAnalyses(analyses)
        })()
    }, [refreshCode, workspaceId])

    useEffect(() => {
        (async () => {
            setWorkspace(undefined)
            const workspace = await fetchWorkspace(workspaceId)
            setWorkspace(workspace)
        })()
    }, [workspaceId])

    const value = React.useMemo(() => ({
        workspaceId,
        workspace,
        analyses,
        createAnalysis: createAnalysisHandler,
        deleteWorkspace: deleteWorkspaceHandler,
        setWorkspaceUsers: setWorkspaceUsersHandler
    }), [analyses, workspace, createAnalysisHandler, deleteWorkspaceHandler, setWorkspaceUsersHandler, workspaceId])

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
        setWorkspaceUsers: context.setWorkspaceUsers
    }
}