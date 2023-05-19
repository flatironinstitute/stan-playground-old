import React, { FunctionComponent, PropsWithChildren, useEffect, useMemo } from 'react';
import { createAnalysis, deleteWorkspace, fetchAnalyses } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPAnalysis } from '../../types/stan-playground-types';

type Props = {
    workspaceId: string
}

type WorkspacePageContextType = {
    workspaceId: string
    analyses: SPAnalysis[]
    createAnalysis: () => Promise<string>
    deleteWorkspace: () => Promise<void>
}

const WorkspacePageContext = React.createContext<WorkspacePageContextType>({
    workspaceId: '',
    analyses: [],
    createAnalysis: async () => {return ''},
    deleteWorkspace: async () => {}
})

export const SetupWorkspacePage: FunctionComponent<PropsWithChildren<Props>> = ({children, workspaceId}) => {
    const [analyses, setAnalyses] = React.useState<SPAnalysis[]>([])
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

    useEffect(() => {
        (async () => {
            setAnalyses([])
            const workspaces = await fetchAnalyses(workspaceId)
            setAnalyses(workspaces)
        })()
    }, [refreshCode, workspaceId])

    const value = React.useMemo(() => ({
        workspaceId,
        analyses,
        createAnalysis: createAnalysisHandler,
        deleteWorkspace: deleteWorkspaceHandler
    }), [analyses, createAnalysisHandler, deleteWorkspaceHandler, workspaceId])

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
        analyses: context.analyses,
        createAnalysis: context.createAnalysis,
        deleteWorkspace: context.deleteWorkspace
    }
}