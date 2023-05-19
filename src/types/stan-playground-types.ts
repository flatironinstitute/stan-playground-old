import validateObject, { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject"

export type SPUser = {
    userId: string
}

export type SPWorkspace = {
    workspaceId: string
    ownerId: string
    name: string
    description: string
    publiclyViewable: boolean
    publiclyEditable: boolean
    users: {
        userId: string
        role: 'admin' | 'editor' | 'viewer'
    }[]
    timestampCreated: number
    timestampModified: number
}

export const isSPWorkspace = (x: any): x is SPWorkspace => {
    return validateObject(x, {
        workspaceId: isString,
        ownerId: isString,
        name: isString,
        description: isString,
        publiclyViewable: isBoolean,
        publiclyEditable: isBoolean,
        users: isArrayOf(y => (validateObject(y, {
            userId: isString,
            role: isOneOf([isEqualTo('admin'), isEqualTo('editor'), isEqualTo('viewer')])
        }))),
        timestampCreated: isNumber,
        timestampModified: isNumber
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