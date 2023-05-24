import { isSPAnalysis, isSPAnalysisFile, isSPAnalysisRun, isSPComputeResource, isSPScriptJob, isSPWorkspace, SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPComputeResource, SPScriptJob, SPWorkspace } from "./stan-playground-types"
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

// getWorkspace

export type GetWorkspaceRequest = {
    type: 'getWorkspace'
    timestamp: number
    workspaceId: string
}

export const isGetWorkspaceRequest = (x: any): x is GetWorkspaceRequest => {
    return validateObject(x, {
        type: isEqualTo('getWorkspace'),
        timestamp: isNumber,
        workspaceId: isString
    })
}

export type GetWorkspaceResponse = {
    type: 'getWorkspace'
    workspace: SPWorkspace
}

export const isGetWorkspaceResponse = (x: any): x is GetWorkspaceResponse => {
    return validateObject(x, {
        type: isEqualTo('getWorkspace'),
        workspace: isSPWorkspace
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
    name: string
}

export const isCreateAnalysisRequest = (x: any): x is CreateAnalysisRequest => {
    return validateObject(x, {
        type: isEqualTo('createAnalysis'),
        timestamp: isNumber,
        workspaceId: isString,
        name: isString
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

// setWorkspaceUsers

export type SetWorkspaceUsersRequest = {
    type: 'setWorkspaceUsers'
    timestamp: number
    workspaceId: string
    users: {
        userId: string
        role: 'admin' | 'editor' | 'viewer'
    }[]
}

export const isSetWorkspaceUsersRequest = (x: any): x is SetWorkspaceUsersRequest => {
    return validateObject(x, {
        type: isEqualTo('setWorkspaceUsers'),
        timestamp: isNumber,
        workspaceId: isString,
        users: isArrayOf(y => (validateObject(y, {
            userId: isString,
            role: isOneOf([isEqualTo('admin'), isEqualTo('editor'), isEqualTo('viewer')])
        })))
    })
}

export type SetWorkspaceUsersResponse = {
    type: 'setWorkspaceUsers'
}

export const isSetWorkspaceUsersResponse = (x: any): x is SetWorkspaceUsersResponse => {
    return validateObject(x, {
        type: isEqualTo('setWorkspaceUsers')
    })
}

// setWorkspaceProperty

export type SetWorkspacePropertyRequest = {
    type: 'setWorkspaceProperty'
    timestamp: number
    workspaceId: string
    property: 'anonymousUserRole' | 'loggedInUserRole' | 'computeResourceId'
    value: any
}

export const isSetWorkspacePropertyRequest = (x: any): x is SetWorkspacePropertyRequest => {
    return validateObject(x, {
        type: isEqualTo('setWorkspaceProperty'),
        timestamp: isNumber,
        workspaceId: isString,
        property: isOneOf([isEqualTo('anonymousUserRole'), isEqualTo('loggedInUserRole'), isEqualTo('computeResourceId')]),
        value: () => (true)
    })
}

export type SetWorkspacePropertyResponse = {
    type: 'setWorkspaceProperty'
}

export const isSetWorkspacePropertyResponse = (x: any): x is SetWorkspacePropertyResponse => {
    return validateObject(x, {
        type: isEqualTo('setWorkspaceProperty')
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

// setAnalysisProperty

export type SetAnalysisPropertyRequest = {
    type: 'setAnalysisProperty'
    timestamp: number
    analysisId: string
    property: 'name'
    value: any
}

export const isSetAnalysisPropertyRequest = (x: any): x is SetAnalysisPropertyRequest => {
    return validateObject(x, {
        type: isEqualTo('setAnalysisProperty'),
        timestamp: isNumber,
        analysisId: isString,
        property: isEqualTo('name'),
        value: () => (true)
    })
}

export type SetAnalysisPropertyResponse = {
    type: 'setAnalysisProperty'
}

export const isSetAnalysisPropertyResponse = (x: any): x is SetAnalysisPropertyResponse => {
    return validateObject(x, {
        type: isEqualTo('setAnalysisProperty')
    })
}

// getComputeResources

export type GetComputeResourcesRequest = {
    type: 'getComputeResources'
    timestamp: number
}

export const isGetComputeResourcesRequest = (x: any): x is GetComputeResourcesRequest => {
    return validateObject(x, {
        type: isEqualTo('getComputeResources'),
        timestamp: isNumber
    })
}

export type GetComputeResourcesResponse = {
    type: 'getComputeResources'
    computeResources: SPComputeResource[]
}

export const isGetComputeResourcesResponse = (x: any): x is GetComputeResourcesResponse => {
    return validateObject(x, {
        type: isEqualTo('getComputeResources'),
        computeResources: isArrayOf(isSPComputeResource)
    })
}

// registerComputeResource

export type RegisterComputeResourceRequest = {
    type: 'registerComputeResource'
    timestamp: number
    computeResourceId: string
    resourceCode: string
    name: string
}

export const isRegisterComputeResourceRequest = (x: any): x is RegisterComputeResourceRequest => {
    return validateObject(x, {
        type: isEqualTo('registerComputeResource'),
        timestamp: isNumber,
        computeResourceId: isString,
        resourceCode: isString,
        name: isString
    })
}

export type RegisterComputeResourceResponse = {
    type: 'registerComputeResource'
}

export const isRegisterComputeResourceResponse = (x: any): x is RegisterComputeResourceResponse => {
    return validateObject(x, {
        type: isEqualTo('registerComputeResource')
    })
}

// deleteComputeResource

export type DeleteComputeResourceRequest = {
    type: 'deleteComputeResource'
    timestamp: number
    computeResourceId: string
}

export const isDeleteComputeResourceRequest = (x: any): x is DeleteComputeResourceRequest => {
    return validateObject(x, {
        type: isEqualTo('deleteComputeResource'),
        timestamp: isNumber,
        computeResourceId: isString
    })
}

export type DeleteComputeResourceResponse = {
    type: 'deleteComputeResource'
}

export const isDeleteComputeResourceResponse = (x: any): x is DeleteComputeResourceResponse => {
    return validateObject(x, {
        type: isEqualTo('deleteComputeResource')
    })
}

// createScriptJob

export type CreateScriptJobRequest = {
    type: 'createScriptJob'
    timestamp: number
    workspaceId: string
    analysisId: string
    scriptFileName: string
}

export const isCreateScriptJobRequest = (x: any): x is CreateScriptJobRequest => {
    return validateObject(x, {
        type: isEqualTo('createScriptJob'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        scriptFileName: isString
    })
}

export type CreateScriptJobResponse = {
    type: 'createScriptJob'
    scriptJobId: string
}

export const isCreateScriptJobResponse = (x: any): x is CreateScriptJobResponse => {
    return validateObject(x, {
        type: isEqualTo('createScriptJob'),
        scriptJobId: isString
    })
}

// getScriptJobs

export type GetScriptJobsRequest = {
    type: 'getScriptJobs'
    timestamp: number
    analysisId: string
}

export const isGetScriptJobsRequest = (x: any): x is GetScriptJobsRequest => {
    return validateObject(x, {
        type: isEqualTo('getScriptJobs'),
        timestamp: isNumber,
        analysisId: isString
    })
}

export type GetScriptJobsResponse = {
    type: 'getScriptJobs'
    scriptJobs: SPScriptJob[]
}

export const isGetScriptJobsResponse = (x: any): x is GetScriptJobsResponse => {
    return validateObject(x, {
        type: isEqualTo('getScriptJobs'),
        scriptJobs: isArrayOf(isSPScriptJob)
    })
}

// deleteScriptJob

export type DeleteScriptJobRequest = {
    type: 'deleteScriptJob'
    timestamp: number
    workspaceId: string
    analysisId: string
    scriptJobId: string
}

export const isDeleteScriptJobRequest = (x: any): x is DeleteScriptJobRequest => {
    return validateObject(x, {
        type: isEqualTo('deleteScriptJob'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        scriptJobId: isString
    })
}

export type DeleteScriptJobResponse = {
    type: 'deleteScriptJob'
}

export const isDeleteScriptJobResponse = (x: any): x is DeleteScriptJobResponse => {
    return validateObject(x, {
        type: isEqualTo('deleteScriptJob')
    })
}

// getScriptJob

export type GetScriptJobRequest = {
    type: 'getScriptJob'
    timestamp: number
    workspaceId: string
    analysisId: string
    scriptJobId: string
}

export const isGetScriptJobRequest = (x: any): x is GetScriptJobRequest => {
    return validateObject(x, {
        type: isEqualTo('getScriptJob'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        scriptJobId: isString
    })
}

export type GetScriptJobResponse = {
    type: 'getScriptJob'
    scriptJob: SPScriptJob
}

export const isGetScriptJobResponse = (x: any): x is GetScriptJobResponse => {
    return validateObject(x, {
        type: isEqualTo('getScriptJob'),
        scriptJob: isSPScriptJob
    })
}

// getPendingScriptJob

export type GetPendingScriptJobRequest = {
    type: 'getPendingScriptJob'
    timestamp: number
    computeResourceId: string
}

export const isGetPendingScriptJobRequest = (x: any): x is GetPendingScriptJobRequest => {
    return validateObject(x, {
        type: isEqualTo('getPendingScriptJob'),
        timestamp: isNumber,
        computeResourceId: isString
    })
}

export type GetPendingScriptJobResponse = {
    type: 'getPendingScriptJob'
    scriptJob?: SPScriptJob
}

export const isGetPendingScriptJobResponse = (x: any): x is GetPendingScriptJobResponse => {
    return validateObject(x, {
        type: isEqualTo('getPendingScriptJob'),
        scriptJob: optional(isSPScriptJob)
    })
}

// setScriptJobProperty

export type SetScriptJobPropertyRequest = {
    type: 'setScriptJobProperty'
    timestamp: number
    workspaceId: string
    analysisId: string
    scriptJobId: string
    property: string
    value: any
}

export const isSetScriptJobPropertyRequest = (x: any): x is SetScriptJobPropertyRequest => {
    return validateObject(x, {
        type: isEqualTo('setScriptJobProperty'),
        timestamp: isNumber,
        workspaceId: isString,
        analysisId: isString,
        scriptJobId: isString,
        property: isString,
        value: () => (true)
    })
}

export type SetScriptJobPropertyResponse = {
    type: 'setScriptJobProperty'
}

export const isSetScriptJobPropertyResponse = (x: any): x is SetScriptJobPropertyResponse => {
    return validateObject(x, {
        type: isEqualTo('setScriptJobProperty')
    })
}

// PlaygroundRequestPayload

export type PlaygroundRequestPayload =
    GetWorkspacesRequest |
    GetWorkspaceRequest |
    CreateWorkspaceRequest |
    GetAnalysesRequest |
    GetAnalysisRequest |
    CreateAnalysisRequest |
    SetWorkspaceUsersRequest |
    SetWorkspacePropertyRequest |
    DeleteWorkspaceRequest |
    GetAnalysisFilesRequest |
    SetAnalysisFileRequest |
    GetAnalysisFileRequest |
    GetAnalysisRunsRequest |
    GetDataBlobRequest |
    CreateAnalysisRunRequest |
    DeleteAnalysisRunRequest |
    DeleteAnalysisRequest |
    SetAnalysisPropertyRequest |
    GetComputeResourcesRequest |
    RegisterComputeResourceRequest |
    DeleteComputeResourceRequest |
    CreateScriptJobRequest |
    GetScriptJobsRequest |
    DeleteScriptJobRequest |
    GetScriptJobRequest |
    GetPendingScriptJobRequest |
    SetScriptJobPropertyRequest

export const isPlaygroundRequestPayload = (x: any): x is PlaygroundRequestPayload => {
    return isOneOf([
        isGetWorkspacesRequest,
        isGetWorkspaceRequest,
        isCreateWorkspaceRequest,
        isGetAnalysesRequest,
        isGetAnalysisRequest,
        isCreateAnalysisRequest,
        isSetWorkspaceUsersRequest,
        isSetWorkspacePropertyRequest,
        isDeleteWorkspaceRequest,
        isGetAnalysisFilesRequest,
        isSetAnalysisFileRequest,
        isGetAnalysisFileRequest,
        isGetAnalysisRunsRequest,
        isGetDataBlobRequest,
        isCreateAnalysisRunRequest,
        isDeleteAnalysisRunRequest,
        isDeleteAnalysisRequest,
        isSetAnalysisPropertyRequest,
        isGetComputeResourcesRequest,
        isRegisterComputeResourceRequest,
        isDeleteComputeResourceRequest,
        isCreateScriptJobRequest,
        isGetScriptJobsRequest,
        isDeleteScriptJobRequest,
        isGetScriptJobRequest,
        isGetPendingScriptJobRequest,
        isSetScriptJobPropertyRequest
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
    GetWorkspaceResponse |
    CreateWorkspaceResponse |
    GetAnalysesResponse |
    GetAnalysisResponse |
    CreateAnalysisResponse |
    SetWorkspaceUsersResponse |
    SetWorkspacePropertyResponse |
    DeleteWorkspaceResponse |
    GetAnalysisFilesResponse |
    SetAnalysisFileResponse |
    GetAnalysisFileResponse |
    GetAnalysisRunsResponse |
    GetDataBlobResponse |
    CreateAnalysisRunResponse |
    DeleteAnalysisRunResponse |
    DeleteAnalysisResponse |
    SetAnalysisPropertyResponse |
    GetComputeResourcesResponse |
    RegisterComputeResourceResponse |
    DeleteComputeResourceResponse |
    CreateScriptJobResponse |
    GetScriptJobsResponse |
    DeleteScriptJobResponse |
    GetScriptJobResponse |
    GetPendingScriptJobResponse |
    SetScriptJobPropertyResponse

export const isPlaygroundResponse = (x: any): x is PlaygroundResponse => {
    return isOneOf([
        isGetWorkspacesResponse,
        isGetWorkspaceResponse,
        isCreateWorkspaceResponse,
        isGetAnalysesResponse,
        isGetAnalysisResponse,
        isCreateAnalysisResponse,
        isSetWorkspaceUsersResponse,
        isSetWorkspacePropertyResponse,
        isDeleteWorkspaceResponse,
        isGetAnalysisFilesResponse,
        isSetAnalysisFileResponse,
        isGetAnalysisFileResponse,
        isGetAnalysisRunsResponse,
        isGetDataBlobResponse,
        isCreateAnalysisRunResponse,
        isDeleteAnalysisRunResponse,
        isDeleteAnalysisResponse,
        isSetAnalysisPropertyResponse,
        isGetComputeResourcesResponse,
        isRegisterComputeResourceResponse,
        isDeleteComputeResourceResponse,
        isCreateScriptJobResponse,
        isGetScriptJobsResponse,
        isDeleteScriptJobResponse,
        isGetScriptJobResponse,
        isGetPendingScriptJobResponse,
        isSetScriptJobPropertyResponse
    ])(x)
}
