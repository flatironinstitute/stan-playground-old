import validateObject, { isArrayOf, isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject"

export type SPUser = {
    userId: string
}

export type SPWorkspace = {
    workspaceId: string
    ownerId: string
    name: string
    description: string
    users: {
        userId: string
        role: 'admin' | 'editor' | 'viewer'
    }[]
    anonymousUserRole: 'viewer' | 'editor' | 'none'
    loggedInUserRole: 'viewer' | 'editor' | 'none'
    timestampCreated: number
    timestampModified: number
    computeResourceId?: string
}

export const isSPWorkspace = (x: any): x is SPWorkspace => {
    return validateObject(x, {
        workspaceId: isString,
        ownerId: isString,
        name: isString,
        description: isString,
        users: isArrayOf(y => (validateObject(y, {
            userId: isString,
            role: isOneOf([isEqualTo('admin'), isEqualTo('editor'), isEqualTo('viewer')])
        }))),
        anonymousUserRole: isOneOf([isEqualTo('viewer'), isEqualTo('editor'), isEqualTo('none')]),
        loggedInUserRole: isOneOf([isEqualTo('viewer'), isEqualTo('editor'), isEqualTo('none')]),
        timestampCreated: isNumber,
        timestampModified: isNumber,
        computeResourceId: optional(isString)
    })
}

export type SPAnalysis = {
    analysisId: string
    workspaceId: string
    name: string
    description: string
    timestampCreated: number
    timestampModified: number
}

export const isSPAnalysis = (x: any): x is SPAnalysis => {
    return validateObject(x, {
        analysisId: isString,
        workspaceId: isString,
        name: isString,
        description: isString,
        timestampCreated: isNumber,
        timestampModified: isNumber
    })
}

export type SPAnalysisFile = {
    analysisId: string
    workspaceId: string
    fileName: string
    contentSha1: string
    contentSize: number
    timestampModified: number
}

export const isSPAnalysisFile = (x: any): x is SPAnalysisFile => {
    return validateObject(x, {
        analysisId: isString,
        workspaceId: isString,
        fileName: isString,
        contentSha1: isString,
        contentSize: isNumber,
        timestampModified: isNumber
    })
}

export type SPCollection = {
    collectionId: string
    workspaceId: string
    name: string
    description: string
    timestampCreated: number
    timestampModified: number
    analysisIds: string[]
}

export const isSPCollection = (x: any): x is SPCollection => {
    return validateObject(x, {
        collectionId: isString,
        workspaceId: isString,
        name: isString,
        description: isString,
        timestampCreated: isNumber,
        timestampModified: isNumber,
        analysisIds: isArrayOf(isString)
    })
}

export type SPAnalysisRun = {
    analysisRunId: string
    analysisId: string
    workspaceId: string
    timestampCreated: number
    stanProgramFileName: string
    stanProgramContentSha1: string
    stanProgramContentSize: number
    datasetFileName: string
    datasetContentSha1: string
    datasetContentSize: number
    optionsFileName: string
    optionsContentSha1: string
    optionsContentSize: number
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
}

export const isSPAnalysisRun = (x: any): x is SPAnalysisRun => {
    return validateObject(x, {
        analysisRunId: isString,
        analysisId: isString,
        workspaceId: isString,
        timestampCreated: isNumber,
        stanProgramFileName: isString,
        stanProgramContentSha1: isString,
        stanProgramContentSize: isNumber,
        datasetFileName: isString,
        datasetContentSha1: isString,
        datasetContentSize: isNumber,
        optionsFileName: isString,
        optionsContentSha1: isString,
        optionsContentSize: isNumber,
        status: isOneOf([isEqualTo('pending'), isEqualTo('queued'), isEqualTo('running'), isEqualTo('completed'), isEqualTo('failed')]),
        error: optional(isString)
    })
}


export type SPDataBlob = {
    workspaceId: string
    analysisId: string
    sha1: string
    size: number
    content: string
}

export const isSPDataBlob = (x: any): x is SPDataBlob => {
    return validateObject(x, {
        workspaceId: isString,
        analysisId: isString,
        sha1: isString,
        size: isNumber,
        content: isString
    })
}

export type SPComputeResource = {
    computeResourceId: string
    ownerId: string
    name: string
    timestampCreated: number
}

export const isSPComputeResource = (x: any): x is SPComputeResource => {
    return validateObject(x, {
        computeResourceId: isString,
        ownerId: isString,
        name: isString,
        timestampCreated: isNumber
    })
}

export type SPScriptJob = {
    scriptJobId: string
    workspaceId: string
    analysisId: string
    scriptFileName: string
    scriptContentSha1: string
    scriptContentSize: number
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    consoleOutput?: string
    computeResourceId: string
    timestampCreated: number
    timestampModified: number
}

export const isSPScriptJob = (x: any): x is SPScriptJob => {
    return validateObject(x, {
        scriptJobId: isString,
        workspaceId: isString,
        analysisId: isString,
        scriptFileName: isString,
        scriptContentSha1: isString,
        scriptContentSize: isNumber,
        status: isOneOf([isEqualTo('pending'), isEqualTo('queued'), isEqualTo('running'), isEqualTo('completed'), isEqualTo('failed')]),
        error: optional(isString),
        consoleOutput: optional(isString),
        computeResourceId: isString,
        timestampCreated: isNumber,
        timestampModified: isNumber
    })
}