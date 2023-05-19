import { isSPAnalysis, isSPAnalysisFile, isSPAnalysisRun, isSPWorkspace, SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPWorkspace } from "./stan-playground-types"
import validateObject, { isArrayOf, isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject"

// getWorkspaces

export type GetWorkspacesRequest = {
    type: 'getWorkspaces'
    timestamp: number
}

export const isGetWorkspacesRequest = (x: any): x is GetWorkspacesRequest => {
    return validateObject(x, {
        type: isEqualTo('getWorkspaces'),
        timestamp: isNumber
    })
}

export type GetWorkspacesResponse = {
    type: 'getWorkspaces'
    workspaces: SPWorkspace[]
}

export const isGetWorkspacesResponse = (x: any): x is GetWorkspacesResponse => {
    return validateObject(x, {
        type: isEqualTo('getWorkspaces'),
        workspaces: isArrayOf(isSPWorkspace)
    })
}

// createWorkspace

export type CreateWorkspaceRequest = {
    type: 'createWorkspace'
    timestamp: number
    name: string
}

export const isCreateWorkspaceRequest = (x: any): x is CreateWorkspaceRequest => {
    return validateObject(x, {
        type: isEqualTo('createWorkspace'),
        timestamp: isNumber,
        name: isString
    })
}

export type CreateWorkspaceResponse = {
    type: 'createWorkspace'
    workspaceId: string
}

export const isCreateWorkspaceResponse = (x: any): x is CreateWorkspaceResponse => {
    return validateObject(x, {
        type: isEqualTo('createWorkspace'),
        workspaceId: isString
    })
}

// getAnalyses

export type GetAnalysesRequest = {
    type: 'getAnalyses'
    timestamp: number
    workspaceId: string
}

export const isGetAnalysesRequest = (x: any): x is GetAnalysesRequest => {
    return validateObject(x, {
        type: isEqualTo('getAnalyses'),
        timestamp: isNumber,
        workspaceId: isString
    })
}

export type GetAnalysesResponse = {
    type: 'getAnalyses'
    analyses: SPAnalysis[]
}

export const isGetAnalysesResponse = (x: any): x is GetAnalysesResponse => {
    return validateObject(x, {
        type: isEqualTo('getAnalyses'),
        analyses: isArrayOf(isSPAnalysis)
    })
}

// getAnalysis

export type GetAnalysisRequest = {
    type: 'getAnalysis'
    timestamp: number
    analysisId: string
}

export const isGetAnalysisRequest = (x: any): x is GetAnalysisRequest => {
    return validateObject(x, {
        type: isEqualTo('getAnalysis'),
        timestamp: isNumber,
        analysisId: isString
    })
}

export type GetAnalysisResponse = {
    type: 'getAnalysis'
    analysis: SPAnalysis
}

export const isGetAnalysisResponse = (x: any): x is GetAnalysisResponse => {
    return validateObject(x, {
        type: isEqualTo('getAnalysis'),
        analysis: isSPAnalysis
    })
}

// createAnalysis

export type CreateAnalysisRequest = {
    type: 'createAnalysis'
    timestamp: number
    workspaceId: string
}

export const isCreateAnalysisRequest = (x: any): x is CreateAnalysisRequest => {
    return validateObject(x, {
        type: isEqualTo('createAnalysis'),
        timestamp: isNumber,
        workspaceId: isString
    })
}

export type CreateAnalysisResponse = {
    type: 'createAnalysis'
    analysisId: string
}

export const isCreateAnalysisResponse = (x: any): x is CreateAnalysisResponse => {
    return validateObject(x, {
        type: isEqualTo('createAnalysis'),
        analysisId: isString,
    })
}

// deleteWorkspace

export type DeleteWorkspaceRequest = {
    type: 'deleteWorkspace'
    timestamp: number
    workspaceId: string
}

export const isDeleteWorkspaceRequest = (x: any): x is DeleteWorkspaceRequest => {
    return validateObject(x, {
        type: isEqualTo('deleteWorkspace'),
        timestamp: isNumber,
        workspaceId: isString
    })
}

export type DeleteWorkspaceResponse = {
    type: 'deleteWorkspace'
}

export const isDeleteWorkspaceResponse = (x: any): x is DeleteWorkspaceResponse => {
    return validateObject(x, {
        type: isEqualTo('deleteWorkspace')
    })
}

// getAnalysisFiles

export type GetAnalysisFilesRequest = {
    type: 'getAnalysisFiles'
    timestamp: number
    analysisId: string
}

export const isGetAnalysisFilesRequest = (x: any): x is GetAnalysisFilesRequest => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisFiles'),
        timestamp: isNumber,
        analysisId: isString
    })
}

export type GetAnalysisFilesResponse = {
    type: 'getAnalysisFiles'
    analysisFiles: SPAnalysisFile[]
}

export const isGetAnalysisFilesResponse = (x: any): x is GetAnalysisFilesResponse => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisFiles'),
        analysisFiles: isArrayOf(isSPAnalysisFile)
    })
}

// setAnalysisFile

export type SetAnalysisFileRequest = {
    type: 'setAnalysisFile'
    timestamp: number
    analysisId: string
    workspaceId: string
    fileName: string
    fileContent: string
}

export const isSetAnalysisFileRequest = (x: any): x is SetAnalysisFileRequest => {
    return validateObject(x, {
        type: isEqualTo('setAnalysisFile'),
        timestamp: isNumber,
        analysisId: isString,
        workspaceId: isString,
        fileName: isString,
        fileContent: isString
    })
}

export type SetAnalysisFileResponse = {
    type: 'setAnalysisFile'
}

export const isSetAnalysisFileResponse = (x: any): x is SetAnalysisFileResponse => {
    return validateObject(x, {
        type: isEqualTo('setAnalysisFile')
    })
}

// getAnalysisFile

export type GetAnalysisFileRequest = {
    type: 'getAnalysisFile'
    timestamp: number
    analysisId: string
    fileName: string
}

export const isGetAnalysisFileRequest = (x: any): x is GetAnalysisFileRequest => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisFile'),
        timestamp: isNumber,
        analysisId: isString,
        fileName: isString
    })
}

export type GetAnalysisFileResponse = {
    type: 'getAnalysisFile'
    analysisFile: SPAnalysisFile
}

export const isGetAnalysisFileResponse = (x: any): x is GetAnalysisFileResponse => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisFile'),
        analysisFile: isSPAnalysisFile
    })
}

// getAnalysisRuns

export type GetAnalysisRunsRequest = {
    type: 'getAnalysisRuns'
    timestamp: number
    analysisId: string
}

export const isGetAnalysisRunsRequest = (x: any): x is GetAnalysisRunsRequest => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisRuns'),
        timestamp: isNumber,
        analysisId: isString
    })
}

export type GetAnalysisRunsResponse = {
    type: 'getAnalysisRuns'
    analysisRuns: SPAnalysisRun[]
}

export const isGetAnalysisRunsResponse = (x: any): x is GetAnalysisRunsResponse => {
    return validateObject(x, {
        type: isEqualTo('getAnalysisRuns'),
        analysisRuns: isArrayOf(isSPAnalysisRun)
    })
}

// getDataBlob

export type GetDataBlobRequest = {
    type: 'getDataBlob'
    timestamp: number
    workspaceId: string
    analysisId: string
    sha1: string
}

export const isGetDataBlobRequest = (x: any): x is GetDataBlobRequest => {
    return validateObject(x, {
        type: isEqualTo('getDataBlob'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        sha1: isString
    })
}

export type GetDataBlobResponse = {
    type: 'getDataBlob'
    content: string
}

export const isGetDataBlobResponse = (x: any): x is GetDataBlobResponse => {
    return validateObject(x, {
        type: isEqualTo('getDataBlob'),
        content: isString
    })
}

// createAnalysisRun

export type CreateAnalysisRunRequest = {
    type: 'createAnalysisRun'
    timestamp: number
    analysisId: string
    workspaceId: string
    stanProgramFileName: string
    datasetFileName: string
    optionsFileName: string
}

export const isCreateAnalysisRunRequest = (x: any): x is CreateAnalysisRunRequest => {
    return validateObject(x, {
        type: isEqualTo('createAnalysisRun'),
        timestamp: isNumber,
        analysisId: isString,
        workspaceId: isString,
        stanProgramFileName: isString,
        datasetFileName: isString,
        optionsFileName: isString
    })
}

export type CreateAnalysisRunResponse = {
    type: 'createAnalysisRun'
    analysisRunId: string
}

export const isCreateAnalysisRunResponse = (x: any): x is CreateAnalysisRunResponse => {
    return validateObject(x, {
        type: isEqualTo('createAnalysisRun'),
        analysisRunId: isString
    })
}

// deleteAnalysisRun

export type DeleteAnalysisRunRequest = {
    type: 'deleteAnalysisRun'
    timestamp: number
    workspaceId: string
    analysisId: string
    analysisRunId: string
}

export const isDeleteAnalysisRunRequest = (x: any): x is DeleteAnalysisRunRequest => {
    return validateObject(x, {
        type: isEqualTo('deleteAnalysisRun'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        analysisRunId: isString
    })
}

export type DeleteAnalysisRunResponse = {
    type: 'deleteAnalysisRun'
}

export const isDeleteAnalysisRunResponse = (x: any): x is DeleteAnalysisRunResponse => {
    return validateObject(x, {
        type: isEqualTo('deleteAnalysisRun')
    })
}

// deletaAnalysis

export type DeleteAnalysisRequest = {
    type: 'deleteAnalysis'
    timestamp: number
    workspaceId: string
    analysisId: string
}

export const isDeleteAnalysisRequest = (x: any): x is DeleteAnalysisRequest => {
    return validateObject(x, {
        type: isEqualTo('deleteAnalysis'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString
    })
}

export type DeleteAnalysisResponse = {
    type: 'deleteAnalysis'
}

export const isDeleteAnalysisResponse = (x: any): x is DeleteAnalysisResponse => {
    return validateObject(x, {
        type: isEqualTo('deleteAnalysis')
    })
}

// PlaygroundRequestPayload

export type PlaygroundRequestPayload =
    GetWorkspacesRequest |
    CreateWorkspaceRequest |
    GetAnalysesRequest |
    GetAnalysisRequest |
    CreateAnalysisRequest |
    DeleteWorkspaceRequest |
    GetAnalysisFilesRequest |
    SetAnalysisFileRequest |
    GetAnalysisFileRequest |
    GetAnalysisRunsRequest |
    GetDataBlobRequest |
    CreateAnalysisRunRequest |
    DeleteAnalysisRunRequest |
    DeleteAnalysisRequest

export const isPlaygroundRequestPayload = (x: any): x is PlaygroundRequestPayload => {
    return isOneOf([
        isGetWorkspacesRequest,
        isCreateWorkspaceRequest,
        isGetAnalysesRequest,
        isGetAnalysisRequest,
        isCreateAnalysisRequest,
        isDeleteWorkspaceRequest,
        isGetAnalysisFilesRequest,
        isSetAnalysisFileRequest,
        isGetAnalysisFileRequest,
        isGetAnalysisRunsRequest,
        isGetDataBlobRequest,
        isCreateAnalysisRunRequest,
        isDeleteAnalysisRunRequest,
        isDeleteAnalysisRequest
    ])(x)
}

// PlaygroundRequest

export type PlaygroundRequest = {
    payload: PlaygroundRequestPayload
    fromClientId?: string
    signature?: string
    userId?: string
    githubAccessToken?: string
}

export const isPlaygroundRequest = (x: any): x is PlaygroundRequest => {
    return validateObject(x, {
        payload: isPlaygroundRequestPayload,
        fromClientId: optional(isString),
        signature: optional(isString),
        userId: optional(isString),
        githubAccessToken: optional(isString)
    })
}

// PlaygroundResponse

export type PlaygroundResponse =
    GetWorkspacesResponse |
    CreateWorkspaceResponse |
    GetAnalysesResponse |
    GetAnalysisResponse |
    CreateAnalysisResponse |
    DeleteWorkspaceResponse |
    GetAnalysisFilesResponse |
    SetAnalysisFileResponse |
    GetAnalysisFileResponse |
    GetAnalysisRunsResponse |
    GetDataBlobResponse |
    CreateAnalysisRunResponse |
    DeleteAnalysisRunResponse |
    DeleteAnalysisResponse

export const isPlaygroundResponse = (x: any): x is PlaygroundResponse => {
    return isOneOf([
        isGetWorkspacesResponse,
        isCreateWorkspaceResponse,
        isGetAnalysesResponse,
        isGetAnalysisResponse,
        isCreateAnalysisResponse,
        isDeleteWorkspaceResponse,
        isGetAnalysisFilesResponse,
        isSetAnalysisFileResponse,
        isGetAnalysisFileResponse,
        isGetAnalysisRunsResponse,
        isGetDataBlobResponse,
        isCreateAnalysisRunResponse,
        isDeleteAnalysisRunResponse,
        isDeleteAnalysisResponse
    ])(x)
}
