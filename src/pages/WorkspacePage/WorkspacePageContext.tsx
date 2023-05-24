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
    createAnalysis: (analysisName: string) => Promise<string>
    deleteWorkspace: () => Promise<void>
    setWorkspaceUsers: (users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[]) => Promise<void>
    setWorkspaceProperty: (property: 'anonymousUserRole' | 'loggedInUserRole' | 'computeResourceId', value: any) => Promise<void>
    workspaceRole: 'none' | 'admin' | 'editor' | 'viewer' | undefined
}

const WorkspacePageContext = React.createContext<WorkspacePageContextType>({
    workspaceId: '',
    workspace: undefined,
    analyses: [],
    createAnalysis: async () => {return ''},
    deleteWorkspace: async () => {},
    setWorkspaceUsers: async () => {},
    setWorkspaceProperty: async () => {},
    workspaceRole: undefined
})

export const SetupWorkspacePage: FunctionComponent<PropsWithChildren<Props>> = ({children, workspaceId}) => {
    const [analyses, setAnalyses] = React.useState<SPAnalysis[]>([])
    const [workspace, setWorkspace] = React.useState<SPWorkspace | undefined>(undefined)
    const [analysesRefreshCode, setAnalysesRefreshCode] = React.useState(0)
    const [workspaceRefreshCode, setWorkspaceRefreshCode] = React.useState(0)

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    const createAnalysisHandler = useMemo(() => (async (analysisName: string): Promise<string> => {
        const analysisId = await createAnalysis(workspaceId, analysisName, auth)
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

    const setWorkspacePropertyHandler = useMemo(() => (async (property: 'anonymousUserRole' | 'loggedInUserRole' | 'computeResourceId', value: any) => {
        if (!auth) {
            throw Error('Not logged in')
        }
        await setWorkspaceProperty(workspaceId, property, value, auth)
        setWorkspaceRefreshCode(rc => rc + 1)
    }), [workspaceId, auth])

    useEffect(() => {
        (async () => {
            setAnalyses([])
            if (!workspaceId) return
            const analyses = await fetchAnalyses(workspaceId, auth)
            setAnalyses(analyses)
        })()
    }, [analysesRefreshCode, workspaceId, auth])

    useEffect(() => {
        (async () => {
            setWorkspace(undefined)
            if (!workspaceId) return
            const workspace = await fetchWorkspace(workspaceId, auth)
            setWorkspace(workspace)
        })()
    }, [workspaceId, workspaceRefreshCode, auth])

    const workspaceRole = useMemo(() => {
        if (!workspace) return undefined
        if (!userId) {
            return workspace.anonymousUserRole
        }
        if (workspace.ownerId === userId) return 'admin'
        const user = workspace.users.find(user => user.userId === userId)
        if (user) {
            return user.role
        }
        else {
            return workspace.loggedInUserRole
        }
    }, [workspace, userId])


    const value = React.useMemo(() => ({
        workspaceId,
        workspace,
        analyses,
        createAnalysis: createAnalysisHandler,
        deleteWorkspace: deleteWorkspaceHandler,
        setWorkspaceUsers: setWorkspaceUsersHandler,
        setWorkspaceProperty: setWorkspacePropertyHandler,
        workspaceRole
    }), [analyses, workspace, createAnalysisHandler, deleteWorkspaceHandler, setWorkspaceUsersHandler, setWorkspacePropertyHandler, workspaceId, workspaceRole])

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
        setWorkspaceProperty: context.setWorkspaceProperty,
        workspaceRole: context.workspaceRole
    }
}