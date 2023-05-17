import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect } from 'react';
import { createAnalysisRun, deleteAnalysisRun, fetchAnalysis, fetchAnalysisFiles, fetchAnalysisRuns } from '../../dbInterface/dbInterface';
import { SPAnalysis, SPAnalysisFile, SPAnalysisRun } from '../../stan-playground-types';

type Props = {
    analysisId: string
}

type FileSelectionState = {
    openFileNames: string[]
    currentFileName: string | undefined
}

type FileSelectionAction = {
    type: 'openFile'
    fileName: string
} | {
    type: 'closeFile'
    fileName: string
} | {
    type: 'closeAllFiles'
} | {
    type: 'setCurrentFile'
    fileName: string
}

const fileSelectionReducer = (state: FileSelectionState, action: FileSelectionAction) => {
    switch (action.type) {
        case 'openFile':
            if (state.openFileNames.includes(action.fileName)) {
                return {
                    ...state,
                    currentFileName: action.fileName
                }
            }
            return {
                ...state,
                openFileNames: [...state.openFileNames, action.fileName],
                currentFileName: action.fileName
            }
        case 'closeFile':
            if (!state.openFileNames.includes(action.fileName)) {
                return state
            }
            return {
                ...state,
                openFileNames: state.openFileNames.filter(x => x !== action.fileName),
                currentFileName: state.currentFileName === action.fileName ? state.openFileNames[0] : state.currentFileName
            }
        case 'closeAllFiles':
            return {
                ...state,
                openFileNames: [],
                currentFileName: undefined
            }
        case 'setCurrentFile':
            if (!state.openFileNames.includes(action.fileName)) {
                return state
            }
            return {
                ...state,
                currentFileName: action.fileName
            }
    }
}

type AnalysisPageContextType = {
    analysisId: string
    workspaceId: string
    analysis?: SPAnalysis
    analysisFiles?: SPAnalysisFile[]
    openFileNames: string[]
    currentFileName?: string
    analysisRuns?: SPAnalysisRun[]
    openFile: (fileName: string) => void
    closeFile: (fileName: string) => void
    closeAllFiles: () => void
    setCurrentFile: (fileName: string) => void
    refreshFiles: () => void
    refreshRuns: () => void
    createAnalysisRun: (o: {stanFileName: string, datasetFileName: string, optionsFileName: string, computeResourceId: string}) => void
    deleteAnalysisRun: (analysisRunId: string) => void
}

const AnalysisPageContext = React.createContext<AnalysisPageContextType>({
    analysisId: '',
    workspaceId: '',
    openFileNames: [],
    currentFileName: undefined,
    openFile: () => {},
    closeFile: () => {},
    closeAllFiles: () => {},
    setCurrentFile: () => {},
    refreshFiles: () => {},
    refreshRuns: () => {},
    createAnalysisRun: () => {},
    deleteAnalysisRun: () => {}
})

export const SetupAnalysisPage: FunctionComponent<PropsWithChildren<Props>> = ({children, analysisId}) => {
    const [analysis, setAnalysis] = React.useState<SPAnalysis | undefined>()
    const [analysisFiles, setAnalysisFiles] = React.useState<SPAnalysisFile[] | undefined>()
    const [refreshFilesCode, setRefreshFilesCode] = React.useState(0)
    const refreshFiles = useCallback(() => setRefreshFilesCode(rfc => rfc + 1), [])

    const [analysisRuns, setAnalysisRuns] = React.useState<SPAnalysisRun[] | undefined>(undefined)
    const [refreshRunsCode, setRefreshRunsCode] = React.useState(0)
    const refreshRuns = useCallback(() => setRefreshRunsCode(rfc => rfc + 1), [])

    const [selectedFiles, selectedFilesDispatch] = React.useReducer(fileSelectionReducer, {openFileNames: [], currentFileName: undefined})

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

    const createAnalysisRunHandler = useCallback(async (o: {stanFileName: string, datasetFileName: string, optionsFileName: string, computeResourceId: string}) => {
        await createAnalysisRun(analysisId, o)
        refreshRuns()
    }, [analysisId, refreshRuns])

    const deleteAnalysisRunHandler = useCallback(async (analysisRunId: string) => {
        await deleteAnalysisRun(analysisRunId)
        refreshRuns()
    }, [refreshRuns])

    const value = React.useMemo(() => ({
        analysisId,
        workspaceId: analysis?.workspaceId ?? '',
        analysis,
        analysisFiles,
        analysisRuns,
        openFileNames: selectedFiles.openFileNames,
        currentFileName: selectedFiles.currentFileName,
        openFile: (fileName: string) => selectedFilesDispatch({type: 'openFile', fileName}),
        closeFile: (fileName: string) => selectedFilesDispatch({type: 'closeFile', fileName}),
        closeAllFiles: () => selectedFilesDispatch({type: 'closeAllFiles'}),
        setCurrentFile: (fileName: string) => selectedFilesDispatch({type: 'setCurrentFile', fileName}),
        refreshFiles,
        refreshRuns,
        createAnalysisRun: createAnalysisRunHandler,
        deleteAnalysisRun: deleteAnalysisRunHandler
    }), [analysis, analysisFiles, analysisRuns, analysisId, refreshFiles, selectedFiles, refreshRuns, createAnalysisRunHandler, deleteAnalysisRunHandler])

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