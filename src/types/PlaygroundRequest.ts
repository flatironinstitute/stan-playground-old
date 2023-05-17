import { isSPAnalysis, isSPWorkspace, SPAnalysis, SPWorkspace } from "./stan-playground-types"
import validateObject, { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject"

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

// PlaygroundRequestPayload

export type PlaygroundRequestPayload =
    GetWorkspacesRequest |
    CreateWorkspaceRequest |
    GetAnalysesRequest |
    CreateAnalysisRequest

export const isPlaygroundRequestPayload = (x: any): x is PlaygroundRequestPayload => {
    return isOneOf([
        isGetWorkspacesRequest,
        isCreateWorkspaceRequest,
        isGetAnalysesRequest,
        isCreateAnalysisRequest
    ])(x)
}

// PlaygroundRequest

export type PlaygroundRequest = {
    payload: PlaygroundRequestPayload
    fromClientId?: string
    signature?: string
    githubUserId?: string
    githubAccessToken?: string
}

export const isPlaygroundRequest = (x: any): x is PlaygroundRequest => {
    return validateObject(x, {
        payload: isPlaygroundRequestPayload,
        fromClientId: optional(isString),
        signature: optional(isString),
        githubUserId: optional(isString),
        githubAccessToken: optional(isString)
    })
}

// PlaygroundResponse

export type PlaygroundResponse =
    GetWorkspacesResponse |
    CreateWorkspaceResponse |
    GetAnalysesResponse |
    CreateAnalysisResponse

export const isPlaygroundResponse = (x: any): x is PlaygroundResponse => {
    return isOneOf([
        isGetWorkspacesResponse,
        isCreateWorkspaceResponse,
        isGetAnalysesResponse,
        isCreateAnalysisResponse
    ])(x)
}
