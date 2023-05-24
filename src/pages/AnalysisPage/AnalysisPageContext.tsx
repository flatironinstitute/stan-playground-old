import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { createAnalysisRun, createScriptJob, deleteAnalysis, deleteAnalysisRun, deleteCompletedScriptJobs, deleteScriptJob, fetchAnalysis, fetchAnalysisFiles, fetchAnalysisRuns, fetchScriptJobs, setAnalysisProperty } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPScriptJob } from '../../types/stan-playground-types';

type Props = {
    analysisId: string
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

type AnalysisPageContextType = {
    analysisId: string
    workspaceId: string
    analysis?: SPAnalysis
    analysisFiles?: SPAnalysisFile[]
    openTabNames: string[]
    currentTabName?: string
    analysisRuns?: SPAnalysisRun[]
    scriptJobs?: SPScriptJob[]
    openTab: (tabName: string) => void
    closeTab: (tabName: string) => void
    closeAllTabs: () => void
    setCurrentTab: (tabName: string) => void
    refreshFiles: () => void
    refreshRuns: () => void
    createAnalysisRun: (o: {stanFileName: string, datasetFileName: string, optionsFileName: string}) => void
    deleteAnalysisRun: (analysisRunId: string) => void
    deleteAnalysis: () => Promise<void>
    setAnalysisProperty: (property: 'name', value: any) => void
    createScriptJob: (o: {scriptFileName: string}) => void
    deleteScriptJob: (scriptJobId: string) => void
    refreshScriptJobs: () => void
    deleteCompletedScriptJobs: (o: {scriptFileName: string}) => void
}

const AnalysisPageContext = React.createContext<AnalysisPageContextType>({
    analysisId: '',
    workspaceId: '',
    openTabNames: [],
    currentTabName: undefined,
    openTab: () => {},
    closeTab: () => {},
    closeAllTabs: () => {},
    setCurrentTab: () => {},
    refreshFiles: () => {},
    refreshRuns: () => {},
    createAnalysisRun: () => {},
    deleteAnalysisRun: () => {},
    deleteAnalysis: async () => {},
    setAnalysisProperty: () => {},
    createScriptJob: () => {},
    deleteScriptJob: () => {},
    refreshScriptJobs: () => {},
    deleteCompletedScriptJobs: () => {}
})

export const SetupAnalysisPage: FunctionComponent<PropsWithChildren<Props>> = ({children, analysisId}) => {
    const [analysis, setAnalysis] = React.useState<SPAnalysis | undefined>()
    const [analysisFiles, setAnalysisFiles] = React.useState<SPAnalysisFile[] | undefined>()
    const [refreshFilesCode, setRefreshFilesCode] = React.useState(0)
    const refreshFiles = useCallback(() => setRefreshFilesCode(rfc => rfc + 1), [])

    const [analysisRuns, setAnalysisRuns] = React.useState<SPAnalysisRun[] | undefined>(undefined)
    const [refreshRunsCode, setRefreshRunsCode] = React.useState(0)
    const refreshRuns = useCallback(() => setRefreshRunsCode(rfc => rfc + 1), [])

    const [scriptJobs, setScriptJobs] = React.useState<SPScriptJob[] | undefined>(undefined)
    const [refreshScriptJobsCode, setRefreshScriptJobsCode] = React.useState(0)
    const refreshScriptJobs = useCallback(() => setRefreshScriptJobsCode(c => c + 1), [])

    const [refreshAnalysisCode, setRefreshAnalysisCode] = React.useState(0)
    const refreshAnalysis = useCallback(() => setRefreshAnalysisCode(rac => rac + 1), [])

    const [selectedTabs, selectedTabsDispatch] = React.useReducer(tabSelectionReducer, {openTabNames: [], currentTabName: undefined})

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    useEffect(() => {
        (async () => {
            setAnalysis(undefined)
            if (!analysisId) return
            const analysis = await fetchAnalysis(analysisId, auth)
            setAnalysis(analysis)
        })()
    }, [analysisId, auth, refreshAnalysisCode])

    useEffect(() => {
        (async () => {
            setAnalysisFiles(undefined)
            if (!analysisId) return
            const af = await fetchAnalysisFiles(analysisId, auth)
            setAnalysisFiles(af)
        })()
    }, [refreshFilesCode, analysisId, auth])

    useEffect(() => {
        (async () => {
            setAnalysisRuns(undefined)
            if (!analysisId) return
            const ar = await fetchAnalysisRuns(analysisId, auth)
            setAnalysisRuns(ar)
        })()
    }, [refreshRunsCode, analysisId, auth])

    useEffect(() => {
        (async () => {
            setScriptJobs(undefined)
            if (!analysisId) return
            const x = await fetchScriptJobs(analysisId, auth)
            setScriptJobs(x)
        })()
    }, [refreshScriptJobsCode, analysisId, auth])

    const createAnalysisRunHandler = useCallback(async (o: {stanFileName: string, datasetFileName: string, optionsFileName: string}) => {
        if (!analysis) return
        await createAnalysisRun(analysis.workspaceId, analysisId, o, auth)
        refreshRuns()
    }, [analysis, analysisId, refreshRuns, auth])

    const deleteAnalysisRunHandler = useCallback(async (analysisRunId: string) => {
        if (!analysis) return
        await deleteAnalysisRun(analysis.workspaceId, analysisId, analysisRunId, auth)
        refreshRuns()
    }, [analysis, analysisId, refreshRuns, auth])

    const createScriptJobHandler = useCallback(async (o: {scriptFileName: string}) => {
        if (!analysis) return
        await createScriptJob(analysis.workspaceId, analysisId, o, auth)
        refreshScriptJobs()
    }, [analysis, analysisId, refreshScriptJobs, auth])

    const deleteScriptJobHandler = useCallback(async (scriptJobId: string) => {
        if (!analysis) return
        await deleteScriptJob(analysis.workspaceId, analysisId, scriptJobId, auth)
        refreshScriptJobs()
    }, [analysis, analysisId, refreshScriptJobs, auth])

    const deleteCompletedScriptJobsHandler = useCallback(async (o: {scriptFileName: string}) => {
        if (!analysis) return
        await deleteCompletedScriptJobs(analysis.workspaceId, analysisId, o.scriptFileName, auth)
        refreshScriptJobs()
    }, [analysis, analysisId, refreshScriptJobs, auth])

    const deleteAnalysisHandler = useMemo(() => (async () => {
        if (!analysis) return
        await deleteAnalysis(analysis.workspaceId, analysisId, auth)
    }), [analysis, analysisId, auth])

    const setAnalysisPropertyHandler = useCallback(async (property: 'name', val: any) => {
        await setAnalysisProperty(analysisId, property, val, auth)
        refreshAnalysis()
    }, [analysisId, refreshAnalysis, auth])

    const value = React.useMemo(() => ({
        analysisId,
        workspaceId: analysis?.workspaceId ?? '',
        analysis,
        analysisFiles,
        analysisRuns,
        openTabNames: selectedTabs.openTabNames,
        currentTabName: selectedTabs.currentTabName,
        scriptJobs,
        openTab: (tabName: string) => selectedTabsDispatch({type: 'openTab', tabName}),
        closeTab: (tabName: string) => selectedTabsDispatch({type: 'closeTab', tabName}),
        closeAllTabs: () => selectedTabsDispatch({type: 'closeAllTabs'}),
        setCurrentTab: (tabName: string) => selectedTabsDispatch({type: 'setCurrentTab', tabName}),
        refreshFiles,
        refreshRuns,
        createAnalysisRun: createAnalysisRunHandler,
        deleteAnalysisRun: deleteAnalysisRunHandler,
        deleteAnalysis: deleteAnalysisHandler,
        setAnalysisProperty: setAnalysisPropertyHandler,
        refreshScriptJobs,
        createScriptJob: createScriptJobHandler,
        deleteScriptJob: deleteScriptJobHandler,
        deleteCompletedScriptJobs: deleteCompletedScriptJobsHandler
    }), [analysis, analysisFiles, analysisRuns, analysisId, refreshFiles, selectedTabs, refreshRuns, createAnalysisRunHandler, deleteAnalysisRunHandler, deleteAnalysisHandler, setAnalysisPropertyHandler, refreshScriptJobs, scriptJobs, createScriptJobHandler, deleteScriptJobHandler, deleteCompletedScriptJobsHandler])

    return (
        <AnalysisPageContext.Provider value={value}>
            {children}
        </AnalysisPageContext.Provider>
    )
}

export const useAnalysis = () => {
    const context = React.useContext(AnalysisPageContext)
    return context
}