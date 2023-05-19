import React, { useCallback, useEffect, useMemo } from 'react';
import { createWorkspace, fetchWorkspaces } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPWorkspace } from '../../types/stan-playground-types';


type HomePageContextType = {
    workspaces: SPWorkspace[]
    createWorkspace: (workspaceName: string) => Promise<void>
}

const HomePageContext = React.createContext<HomePageContextType>({workspaces: [], createWorkspace: async () => {}})

export const SetupHomePage = (props: {children: React.ReactNode}) => {
    const [workspaces, setWorkspaces] = React.useState<SPWorkspace[]>([])
    const [refreshCode, setRefreshCode] = React.useState(0)

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : undefined), [accessToken, userId])

    const createWorkspaceHandler = useCallback(async (workspaceName: string) => {
        if (!auth) {
            console.warn('Not logged in.')
            return
        }
        await createWorkspace(workspaceName, auth)
        setRefreshCode(rc => rc + 1)
    }, [auth])

    useEffect(() => {
        (async () => {
            setWorkspaces([])
            const workspaces = await fetchWorkspaces()
            setWorkspaces(workspaces)
        })()
    }, [refreshCode])

    const value = React.useMemo(() => ({
        workspaces,
        createWorkspace: createWorkspaceHandler
    }), [workspaces, createWorkspaceHandler])

    return (
        <HomePageContext.Provider value={value}>
            {props.children}
        </HomePageContext.Provider>
    )
}

export const useHome = () => {
    const context = React.useContext(HomePageContext)
    return {
        workspaces: context.workspaces,
        createWorkspace: context.createWorkspace
    }
}