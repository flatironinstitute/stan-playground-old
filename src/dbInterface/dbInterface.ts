import { CreateAnalysisRequest, CreateAnalysisRunRequest, CreateScriptJobRequest, CreateWorkspaceRequest, DeleteAnalysisRequest, DeleteAnalysisRunRequest, DeleteCompletedScriptJobsRequest, DeleteComputeResourceRequest, DeleteScriptJobRequest, DeleteWorkspaceRequest, GetAnalysesRequest, GetAnalysisFileRequest, GetAnalysisFilesRequest, GetAnalysisRequest, GetAnalysisRunsRequest, GetComputeResourcesRequest, GetDataBlobRequest, GetScriptJobRequest, GetScriptJobsRequest, GetWorkspaceRequest, GetWorkspacesRequest, RegisterComputeResourceRequest, SetAnalysisFileRequest, SetAnalysisPropertyRequest, SetWorkspacePropertyRequest, SetWorkspaceUsersRequest } from "../types/PlaygroundRequest";
import { SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPComputeResource, SPScriptJob, SPWorkspace } from "../types/stan-playground-types";
import postPlaygroundRequest from "./postPlaygroundRequest";

export const fetchWorkspaces = async (auth: Auth): Promise<SPWorkspace[]> => {
    const req: GetWorkspacesRequest = {
        type: 'getWorkspaces',
        timestamp: Date.now() / 1000
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getWorkspaces') {
        throw Error(`Unexpected response type ${resp.type}. Expected getWorkspaces.`)
    }
    return resp.workspaces
}

export const fetchWorkspace = async (workspaceId: string, auth: Auth): Promise<SPWorkspace | undefined> => {
    const req: GetWorkspaceRequest = {
        type: 'getWorkspace',
        timestamp: Date.now() / 1000,
        workspaceId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getWorkspace') {
        throw Error(`Unexpected response type ${resp.type}. Expected getWorkspace.`)
    }
    return resp.workspace
}

type Auth = {
    githubAccessToken?: string
}

export const createWorkspace = async (workspaceName: string, auth: Auth): Promise<string> => {
    const req: CreateWorkspaceRequest = {
        type: 'createWorkspace',
        timestamp: Date.now() / 1000,
        name: workspaceName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'createWorkspace') {
        throw Error(`Unexpected response type ${resp.type}. Expected createWorkspace.`)
    }
    return resp.workspaceId
}

export const fetchAnalyses = async (workspaceId: string, auth: Auth): Promise<SPAnalysis[]> => {
    const req: GetAnalysesRequest = {
        type: 'getAnalyses',
        timestamp: Date.now() / 1000,
        workspaceId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getAnalyses') {
        throw Error(`Unexpected response type ${resp.type}. Expected getAnalyses.`)
    }
    return resp.analyses}

export const createAnalysis = async (workspaceId: string, analysisName: string, auth: Auth): Promise<string> => {
    const req: CreateAnalysisRequest = {
        type: 'createAnalysis',
        timestamp: Date.now() / 1000,
        workspaceId,
        name: analysisName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'createAnalysis') {
        throw Error(`Unexpected response type ${resp.type}. Expected createAnalysis.`)
    }
    return resp.analysisId
}

export const setWorkspaceUsers = async (workspaceId: string, users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[], auth: Auth): Promise<void> => {
    const req: SetWorkspaceUsersRequest = {
        type: 'setWorkspaceUsers',
        timestamp: Date.now() / 1000,
        workspaceId,
        users
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'setWorkspaceUsers') {
        throw Error(`Unexpected response type ${resp.type}. Expected setWorkspaceUsers.`)
    }
}

export const setWorkspaceProperty = async (workspaceId: string, property: 'anonymousUserRole' | 'loggedInUserRole' | 'computeResourceId', value: any, auth: Auth): Promise<void> => {
    const req: SetWorkspacePropertyRequest = {
        type: 'setWorkspaceProperty',
        timestamp: Date.now() / 1000,
        workspaceId,
        property,
        value
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'setWorkspaceProperty') {
        throw Error(`Unexpected response type ${resp.type}. Expected setWorkspaceProperty.`)
    }
}


export const deleteWorkspace = async (workspaceId: string, auth: Auth): Promise<void> => {
    const req: DeleteWorkspaceRequest = {
        type: 'deleteWorkspace',
        timestamp: Date.now() / 1000,
        workspaceId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteWorkspace') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteWorkspace.`)
    }
}

export const fetchAnalysis = async (analysisId: string, auth: Auth): Promise<SPAnalysis | undefined> => {
    const req: GetAnalysisRequest = {
        type: 'getAnalysis',
        timestamp: Date.now() / 1000,
        analysisId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getAnalysis') {
        throw Error(`Unexpected response type ${resp.type}. Expected getAnalysis.`)
    }
    return resp.analysis
}

export const fetchAnalysisFiles = async (analysisId: string, auth: Auth): Promise<SPAnalysisFile[]> => {
    const req: GetAnalysisFilesRequest = {
        type: 'getAnalysisFiles',
        timestamp: Date.now() / 1000,
        analysisId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getAnalysisFiles') {
        throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisFiles.`)
    }
    return resp.analysisFiles
}

export const fetchAnalysisFile = async (analysisId: string, fileName: string, auth: Auth): Promise<SPAnalysisFile | undefined> => {
    const req: GetAnalysisFileRequest = {
        type: 'getAnalysisFile',
        timestamp: Date.now() / 1000,
        analysisId,
        fileName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getAnalysisFile') {
        throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisFile.`)
    }
    return resp.analysisFile
}

export const fetchDataBlob = async (workspaceId: string, analysisId: string, sha1: string, auth: Auth): Promise<string | undefined> => {
    const req: GetDataBlobRequest = {
        type: 'getDataBlob',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        sha1
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getDataBlob') {
        throw Error(`Unexpected response type ${resp.type}. Expected getDataBlob.`)
    }
    return resp.content
}

export const setAnalysisFileContent = async (workspaceId: string, analysisId: string, fileName: string, fileContent: string, auth: Auth): Promise<void> => {
    const req: SetAnalysisFileRequest = {
        type: 'setAnalysisFile',
        timestamp: Date.now() / 1000,
        analysisId,
        workspaceId,
        fileName,
        fileContent
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'setAnalysisFile') {
        throw Error(`Unexpected response type ${resp.type}. Expected setAnalysisFile.`)
    }
}

export const fetchAnalysisRuns = async (analysisId: string, auth: Auth): Promise<SPAnalysisRun[]> => {
    const req: GetAnalysisRunsRequest = {
        type: 'getAnalysisRuns',
        timestamp: Date.now() / 1000,
        analysisId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getAnalysisRuns') {
        throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisRuns.`)
    }
    return resp.analysisRuns
}

export const createAnalysisRun = async (workspaceId: string, analysisId: string, o: {stanFileName: string, datasetFileName: string, optionsFileName: string}, auth: Auth): Promise<string> => {
    const req: CreateAnalysisRunRequest = {
        type: 'createAnalysisRun',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        stanProgramFileName: o.stanFileName,
        datasetFileName: o.datasetFileName,
        optionsFileName: o.optionsFileName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'createAnalysisRun') {
        throw Error(`Unexpected response type ${resp.type}. Expected createAnalysisRun.`)
    }
    return resp.analysisRunId
}

export const deleteAnalysisRun = async (workspaceId: string, analysisId: string, analysisRunId: string, auth: Auth): Promise<void> => {
    const req: DeleteAnalysisRunRequest = {
        type: 'deleteAnalysisRun',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        analysisRunId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteAnalysisRun') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteAnalysisRun.`)
    }
}

export const deleteAnalysis = async (workspaceId: string, analysisId: string, auth: Auth): Promise<void> => {
    const req: DeleteAnalysisRequest = {
        type: 'deleteAnalysis',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteAnalysis') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteAnalysis.`)
    }
}

export const setAnalysisProperty = async (analysisId: string, property: 'name', value: any, auth: Auth): Promise<void> => {
    const req: SetAnalysisPropertyRequest = {
        type: 'setAnalysisProperty',
        timestamp: Date.now() / 1000,
        analysisId,
        property,
        value
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'setAnalysisProperty') {
        throw Error(`Unexpected response type ${resp.type}. Expected setAnalysisProperty.`)
    }
}

export const fetchComputeResources = async (auth: Auth): Promise<SPComputeResource[]> => {
    const req: GetComputeResourcesRequest = {
        type: 'getComputeResources',
        timestamp: Date.now() / 1000
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getComputeResources') {
        throw Error(`Unexpected response type ${resp.type}. Expected getComputeResources.`)
    }
    return resp.computeResources
}

export const registerComputeResource = async (computeResourceId: string, resourceCode: string, name: string, auth: Auth): Promise<void> => {
    const req: RegisterComputeResourceRequest = {
        type: 'registerComputeResource',
        timestamp: Date.now() / 1000,
        computeResourceId,
        resourceCode,
        name
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'registerComputeResource') {
        throw Error(`Unexpected response type ${resp.type}. Expected registerComputeResource.`)
    }
}

export const deleteComputeResource = async (computeResourceId: string, auth: Auth): Promise<void> => {
    const req: DeleteComputeResourceRequest = {
        type: 'deleteComputeResource',
        timestamp: Date.now() / 1000,
        computeResourceId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteComputeResource') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteComputeResource.`)
    }
}

export const createScriptJob = async (workspaceId: string, analysisId: string, o: {scriptFileName: string}, auth: Auth): Promise<string> => {
    const req: CreateScriptJobRequest = {
        type: 'createScriptJob',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        scriptFileName: o.scriptFileName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'createScriptJob') {
        throw Error(`Unexpected response type ${resp.type}. Expected createScriptJob.`)
    }
    return resp.scriptJobId
}

export const deleteScriptJob = async (workspaceId: string, analysisId: string, scriptJobId: string, auth: Auth): Promise<void> => {
    const req: DeleteScriptJobRequest = {
        type: 'deleteScriptJob',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        scriptJobId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteScriptJob') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteScriptJob.`)
    }
}

export const deleteCompletedScriptJobs = async (workspaceId: string, analysisId: string, scriptFileName: string, auth: Auth): Promise<void> => {
    const req: DeleteCompletedScriptJobsRequest = {
        type: 'deleteCompletedScriptJobs',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        scriptFileName
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'deleteCompletedScriptJobs') {
        throw Error(`Unexpected response type ${resp.type}. Expected deleteCompletedScriptJobs.`)
    }
}

export const fetchScriptJobs = async (analysisId: string, auth: Auth): Promise<SPScriptJob[]> => {
    const req: GetScriptJobsRequest = {
        type: 'getScriptJobs',
        timestamp: Date.now() / 1000,
        analysisId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getScriptJobs') {
        throw Error(`Unexpected response type ${resp.type}. Expected getScriptJobs.`)
    }
    return resp.scriptJobs
}

export const fetchScriptJob = async (workspaceId: string, analysisId: string, scriptJobId: string, auth: Auth): Promise<SPScriptJob | undefined> => {
    const req: GetScriptJobRequest = {
        type: 'getScriptJob',
        timestamp: Date.now() / 1000,
        workspaceId,
        analysisId,
        scriptJobId
    }
    const resp = await postPlaygroundRequest(req, {...auth})
    if (resp.type !== 'getScriptJob') {
        throw Error(`Unexpected response type ${resp.type}. Expected getScriptJob.`)
    }
    return resp.scriptJob
}