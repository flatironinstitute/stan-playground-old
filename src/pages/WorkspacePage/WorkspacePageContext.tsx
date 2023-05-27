import React, { FunctionComponent, PropsWithChildren, useEffect, useMemo } from 'react';
import { createProject, deleteWorkspace, fetchProjects, fetchWorkspace, setWorkspaceProperty, setWorkspaceUsers } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { useSPMain } from '../../SPMainContext';
import { SPProject, SPWorkspace } from '../../types/stan-playground-types';

type Props = {
    workspaceId: string
}

type WorkspacePageContextType = {
    workspaceId: string
    workspace: SPWorkspace | undefined
    projects: SPProject[]
    createProject: (projectName: string) => Promise<string>
    deleteWorkspace: () => Promise<void>
    setWorkspaceUsers: (users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[]) => Promise<void>
    setWorkspaceProperty: (property: 'publiclyReadable' | 'listed' | 'computeResourceId', value: any) => Promise<void>
    workspaceRole: 'none' | 'admin' | 'editor' | 'viewer' | undefined
}

const WorkspacePageContext = React.createContext<WorkspacePageContextType>({
    workspaceId: '',
    workspace: undefined,
    projects: [],
    createProject: async () => {return ''},
    deleteWorkspace: async () => {},
    setWorkspaceUsers: async () => {},
    setWorkspaceProperty: async () => {},
    workspaceRole: undefined
})

export const SetupWorkspacePage: FunctionComponent<PropsWithChildren<Props>> = ({children, workspaceId}) => {
    const [projects, setProjects] = React.useState<SPProject[]>([])
    const [workspace, setWorkspace] = React.useState<SPWorkspace | undefined>(undefined)
    const [projectsRefreshCode, setProjectsRefreshCode] = React.useState(0)
    const [workspaceRefreshCode, setWorkspaceRefreshCode] = React.useState(0)

    const {refreshWorkspaces} = useSPMain()

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    const createProjectHandler = useMemo(() => (async (projectName: string): Promise<string> => {
        const projectId = await createProject(workspaceId, projectName, auth)
        setProjectsRefreshCode(rc => rc + 1)
        return projectId
    }), [workspaceId, auth])

    const deleteWorkspaceHandler = useMemo(() => (async () => {
        await deleteWorkspace(workspaceId, auth)
        refreshWorkspaces()
    }), [workspaceId, auth, refreshWorkspaces])

    const setWorkspaceUsersHandler = useMemo(() => (async (users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[]) => {
        await setWorkspaceUsers(workspaceId, users, auth)
        setWorkspaceRefreshCode(rc => rc + 1)
    }), [workspaceId, auth])

    const setWorkspacePropertyHandler = useMemo(() => (async (property: 'publiclyReadable' | 'listed' | 'computeResourceId', value: any) => {
        await setWorkspaceProperty(workspaceId, property, value, auth)
        setWorkspaceRefreshCode(rc => rc + 1)
    }), [workspaceId, auth])

    useEffect(() => {
        (async () => {
            setProjects([])
            if (!workspaceId) return
            const projects = await fetchProjects(workspaceId, auth)
            setProjects(projects)
        })()
    }, [projectsRefreshCode, workspaceId, auth])

    useEffect(() => {
        (async () => {
            setWorkspace(undefined)
            if (!workspaceId) return
            const workspace = await fetchWorkspace(workspaceId, auth)
            setWorkspace(workspace)
        })()
    }, [workspaceId, workspaceRefreshCode, auth])

    const workspaceRole: 'admin' | 'viewer' | 'none' | 'editor' | undefined = useMemo(() => {
        if (!workspace) return undefined
        if (userId) {
            if (workspace.ownerId === userId) return 'admin'
            const user = workspace.users.find(user => user.userId === userId)
            if (user) {
                return user.role
            }
        }
        return workspace.publiclyReadable ? 'viewer' : 'none'
    }, [workspace, userId])

    const value = React.useMemo(() => ({
        workspaceId,
        workspace,
        projects,
        createProject: createProjectHandler,
        deleteWorkspace: deleteWorkspaceHandler,
        setWorkspaceUsers: setWorkspaceUsersHandler,
        setWorkspaceProperty: setWorkspacePropertyHandler,
        workspaceRole
    }), [projects, workspace, createProjectHandler, deleteWorkspaceHandler, setWorkspaceUsersHandler, setWorkspacePropertyHandler, workspaceId, workspaceRole])

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
        projects: context.projects,
        createProject: context.createProject,
        deleteWorkspace: context.deleteWorkspace,
        setWorkspaceUsers: context.setWorkspaceUsers,
        setWorkspaceProperty: context.setWorkspaceProperty,
        workspaceRole: context.workspaceRole
    }
}