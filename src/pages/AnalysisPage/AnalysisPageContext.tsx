import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { createAnalysisRun, deleteAnalysis, deleteAnalysisRun, fetchAnalysis, fetchAnalysisFiles, fetchAnalysisRuns } from '../../dbInterface/dbInterface';
import { useGithubAuth } from '../../GithubAuth/useGithubAuth';
import { SPAnalysis, SPAnalysisFile, SPAnalysisRun } from '../../types/stan-playground-types';

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
    openTab: (tabName: string) => void
    closeTab: (tabName: string) => void
    closeAllTabs: () => void
    setCurrentTab: (tabName: string) => void
    refreshFiles: () => void
    refreshRuns: () => void
    createAnalysisRun: (o: {stanFileName: string, datasetFileName: string, optionsFileName: string}) => void
    deleteAnalysisRun: (analysisRunId: string) => void
    deleteAnalysis: () => Promise<void>
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
    deleteAnalysis: async () => {}
})

export const SetupAnalysisPage: FunctionComponent<PropsWithChildren<Props>> = ({children, analysisId}) => {
    const [analysis, setAnalysis] = React.useState<SPAnalysis | undefined>()
    const [analysisFiles, setAnalysisFiles] = React.useState<SPAnalysisFile[] | undefined>()
    const [refreshFilesCode, setRefreshFilesCode] = React.useState(0)
    const refreshFiles = useCallback(() => setRefreshFilesCode(rfc => rfc + 1), [])

    const [analysisRuns, setAnalysisRuns] = React.useState<SPAnalysisRun[] | undefined>(undefined)
    const [refreshRunsCode, setRefreshRunsCode] = React.useState(0)
    const refreshRuns = useCallback(() => setRefreshRunsCode(rfc => rfc + 1), [])

    const [selectedTabs, selectedTabsDispatch] = React.useReducer(tabSelectionReducer, {openTabNames: [], currentTabName: undefined})

    useEffect(() => {
        (async () => {
            setAnalysis(undefined)
            const analysis = await fetchAnalysis(analysisId)
            setAnalysis(analysis)
        })()
    }, [analysisId])

    useEffect(() => {
        (async () => {
            setAnalysisFiles(undefined)
            const af = await fetchAnalysisFiles(analysisId)
            setAnalysisFiles(af)
        })()
    }, [refreshFilesCode, analysisId])

    useEffect(() => {
        (async () => {
            setAnalysisRuns(undefined)
            const ar = await fetchAnalysisRuns(analysisId)
            setAnalysisRuns(ar)
        })()
    }, [refreshRunsCode, analysisId])

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : undefined), [accessToken, userId])

    const createAnalysisRunHandler = useCallback(async (o: {stanFileName: string, datasetFileName: string, optionsFileName: string}) => {
        if (!analysis) return
        if (!auth) {
            console.warn('Not logged in.')
            return
        }
        await createAnalysisRun(analysis.workspaceId, analysisId, o, auth)
        refreshRuns()
    }, [analysis, analysisId, refreshRuns, auth])

    const deleteAnalysisRunHandler = useCallback(async (analysisRunId: string) => {
        if (!analysis) return
        if (!auth) {
            console.warn('Not logged in.')
            return
        }
        await deleteAnalysisRun(analysis.workspaceId, analysisId, analysisRunId, auth)
        refreshRuns()
    }, [analysis, analysisId, refreshRuns, auth])

    const deleteAnalysisHandler = useMemo(() => (async () => {
        if (!analysis) return
        if (!auth) {
            console.warn('Not logged in.')
            return
        }
        await deleteAnalysis(analysis.workspaceId, analysisId, auth)
    }), [analysis, analysisId, auth])

    const value = React.useMemo(() => ({
        analysisId,
        workspaceId: analysis?.workspaceId ?? '',
        analysis,
        analysisFiles,
        analysisRuns,
        openTabNames: selectedTabs.openTabNames,
        currentTabName: selectedTabs.currentTabName,
        openTab: (tabName: string) => selectedTabsDispatch({type: 'openTab', tabName}),
        closeTab: (tabName: string) => selectedTabsDispatch({type: 'closeTab', tabName}),
        closeAllTabs: () => selectedTabsDispatch({type: 'closeAllTabs'}),
        setCurrentTab: (tabName: string) => selectedTabsDispatch({type: 'setCurrentTab', tabName}),
        refreshFiles,
        refreshRuns,
        createAnalysisRun: createAnalysisRunHandler,
        deleteAnalysisRun: deleteAnalysisRunHandler,
        deleteAnalysis: deleteAnalysisHandler
    }), [analysis, analysisFiles, analysisRuns, analysisId, refreshFiles, selectedTabs, refreshRuns, createAnalysisRunHandler, deleteAnalysisRunHandler, deleteAnalysisHandler])

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