import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { createScriptJob, deleteProject, deleteProjectFile, deleteCompletedScriptJobs, deleteScriptJob, fetchProject, fetchProjectFiles, fetchScriptJobs, setProjectProperty } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPProject, SPProjectFile, SPScriptJob } from '../../types/stan-playground-types';

type Props = {
    projectId: string
}

type TabSelectionState = {
    openTabNames: string[]
    currentTabName: string | undefined
}

type TabSelectionAction = {
    type: 'openTab'
    tabName: string
} | {
    type: 'closeTab'
    tabName: string
} | {
    type: 'closeAllTabs'
} | {
    type: 'setCurrentTab'
    tabName: string
}

const tabSelectionReducer = (state: TabSelectionState, action: TabSelectionAction) => {
    switch (action.type) {
        case 'openTab':
            if (state.openTabNames.includes(action.tabName)) {
                return {
                    ...state,
                    currentTabName: action.tabName
                }
            }
            return {
                ...state,
                openTabNames: [...state.openTabNames, action.tabName],
                currentTabName: action.tabName
            }
        case 'closeTab':
            if (!state.openTabNames.includes(action.tabName)) {
                return state
            }
            return {
                ...state,
                openTabNames: state.openTabNames.filter(x => x !== action.tabName),
                currentTabName: state.currentTabName === action.tabName ? state.openTabNames[0] : state.currentTabName
            }
        case 'closeAllTabs':
            return {
                ...state,
                openTabNames: [],
                currentTabName: undefined
            }
        case 'setCurrentTab':
            if (!state.openTabNames.includes(action.tabName)) {
                return state
            }
            return {
                ...state,
                currentTabName: action.tabName
            }
    }
}

type ProjectPageContextType = {
    projectId: string
    workspaceId: string
    project?: SPProject
    projectFiles?: SPProjectFile[]
    openTabNames: string[]
    currentTabName?: string
    scriptJobs?: SPScriptJob[]
    openTab: (tabName: string) => void
    closeTab: (tabName: string) => void
    closeAllTabs: () => void
    setCurrentTab: (tabName: string) => void
    refreshFiles: () => void
    deleteProject: () => Promise<void>
    setProjectProperty: (property: 'name', value: any) => void
    createScriptJob: (o: {scriptFileName: string}) => void
    deleteScriptJob: (scriptJobId: string) => void
    refreshScriptJobs: () => void
    deleteCompletedScriptJobs: (o: {scriptFileName: string}) => void
    deleteFile: (fileName: string) => void
}

const ProjectPageContext = React.createContext<ProjectPageContextType>({
    projectId: '',
    workspaceId: '',
    openTabNames: [],
    currentTabName: undefined,
    openTab: () => {},
    closeTab: () => {},
    closeAllTabs: () => {},
    setCurrentTab: () => {},
    refreshFiles: () => {},
    deleteProject: async () => {},
    setProjectProperty: () => {},
    createScriptJob: () => {},
    deleteScriptJob: () => {},
    refreshScriptJobs: () => {},
    deleteCompletedScriptJobs: () => {},
    deleteFile: () => {}
})

export const SetupProjectPage: FunctionComponent<PropsWithChildren<Props>> = ({children, projectId}) => {
    const [project, setProject] = React.useState<SPProject | undefined>()
    const [projectFiles, setProjectFiles] = React.useState<SPProjectFile[] | undefined>()
    const [refreshFilesCode, setRefreshFilesCode] = React.useState(0)
    const refreshFiles = useCallback(() => setRefreshFilesCode(rfc => rfc + 1), [])

    const [scriptJobs, setScriptJobs] = React.useState<SPScriptJob[] | undefined>(undefined)
    const [refreshScriptJobsCode, setRefreshScriptJobsCode] = React.useState(0)
    const refreshScriptJobs = useCallback(() => setRefreshScriptJobsCode(c => c + 1), [])

    const [refreshProjectCode, setRefreshProjectCode] = React.useState(0)
    const refreshProject = useCallback(() => setRefreshProjectCode(rac => rac + 1), [])

    const [selectedTabs, selectedTabsDispatch] = React.useReducer(tabSelectionReducer, {openTabNames: [], currentTabName: undefined})

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    useEffect(() => {
        (async () => {
            setProject(undefined)
            if (!projectId) return
            const project = await fetchProject(projectId, auth)
            setProject(project)
        })()
    }, [projectId, auth, refreshProjectCode])

    useEffect(() => {
        (async () => {
            setProjectFiles(undefined)
            if (!projectId) return
            const af = await fetchProjectFiles(projectId, auth)
            setProjectFiles(af)
        })()
    }, [refreshFilesCode, projectId, auth])

    useEffect(() => {
        let canceled = false
        ;(async () => {
            setScriptJobs(undefined)
            if (!projectId) return
            const x = await fetchScriptJobs(projectId, auth)
            if (canceled) return
            setScriptJobs(x)
        })()
        return () => {canceled = true}
    }, [refreshScriptJobsCode, projectId, auth])

    // if any script jobs are newly completed, refresh the files
    const [previousScriptJobs, setPreviousScriptJobs] = React.useState<SPScriptJob[] | undefined>(undefined)
    useEffect(() => {
        if (!scriptJobs) return
        if (previousScriptJobs) {
            const newlyCompletedJobs = scriptJobs.filter(j => (
                j.status === 'completed' && (
                    !previousScriptJobs.find(pj => (pj.scriptJobId === j.scriptJobId) && pj.status === 'completed')
                )
            ))
            if (newlyCompletedJobs.length > 0) {
                refreshFiles()
            }
        }
        setPreviousScriptJobs(scriptJobs)
    }, [scriptJobs, previousScriptJobs, refreshFiles])

    const createScriptJobHandler = useCallback(async (o: {scriptFileName: string}) => {
        if (!project) return
        await createScriptJob(project.workspaceId, projectId, o, auth)
        refreshScriptJobs()
    }, [project, projectId, refreshScriptJobs, auth])

    const deleteScriptJobHandler = useCallback(async (scriptJobId: string) => {
        if (!project) return
        await deleteScriptJob(project.workspaceId, projectId, scriptJobId, auth)
        refreshScriptJobs()
    }, [project, projectId, refreshScriptJobs, auth])

    const deleteCompletedScriptJobsHandler = useCallback(async (o: {scriptFileName: string}) => {
        if (!project) return
        await deleteCompletedScriptJobs(project.workspaceId, projectId, o.scriptFileName, auth)
        refreshScriptJobs()
    }, [project, projectId, refreshScriptJobs, auth])

    const deleteProjectHandler = useMemo(() => (async () => {
        if (!project) return
        await deleteProject(project.workspaceId, projectId, auth)
    }), [project, projectId, auth])

    const setProjectPropertyHandler = useCallback(async (property: 'name', val: any) => {
        await setProjectProperty(projectId, property, val, auth)
        refreshProject()
    }, [projectId, refreshProject, auth])

    const deleteFile = useCallback(async (fileName: string) => {
        if (!project) return
        await deleteProjectFile(project.workspaceId, projectId, fileName, auth)
        refreshFiles()
    }, [project, projectId, refreshFiles, auth])

    const value = React.useMemo(() => ({
        projectId,
        workspaceId: project?.workspaceId ?? '',
        project,
        projectFiles,
        openTabNames: selectedTabs.openTabNames,
        currentTabName: selectedTabs.currentTabName,
        scriptJobs,
        openTab: (tabName: string) => selectedTabsDispatch({type: 'openTab', tabName}),
        closeTab: (tabName: string) => selectedTabsDispatch({type: 'closeTab', tabName}),
        closeAllTabs: () => selectedTabsDispatch({type: 'closeAllTabs'}),
        setCurrentTab: (tabName: string) => selectedTabsDispatch({type: 'setCurrentTab', tabName}),
        refreshFiles,
        deleteProject: deleteProjectHandler,
        setProjectProperty: setProjectPropertyHandler,
        refreshScriptJobs,
        createScriptJob: createScriptJobHandler,
        deleteScriptJob: deleteScriptJobHandler,
        deleteCompletedScriptJobs: deleteCompletedScriptJobsHandler,
        deleteFile
    }), [project, projectFiles, projectId, refreshFiles, selectedTabs, deleteProjectHandler, setProjectPropertyHandler, refreshScriptJobs, scriptJobs, createScriptJobHandler, deleteScriptJobHandler, deleteCompletedScriptJobsHandler, deleteFile])

    return (
        <ProjectPageContext.Provider value={value}>
            {children}
        </ProjectPageContext.Provider>
    )
}

export const useProject = () => {
    const context = React.useContext(ProjectPageContext)
    return context
}