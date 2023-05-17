import validateObject, { isArrayOf, isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject"

export type SPUser = {
    userId: string
}

export type SPWorkspace = {
    workspaceId: string
    ownerId: string
    name: string
    description: string
    timestampCreated: number
    timestampModified: number
}

export const isSPWorkspace = (x: any): x is SPWorkspace => {
    return validateObject(x, {
        workspaceId: isString,
        ownerId: isString,
        name: isString,
        description: isString,
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
    fileContent?: string
    timestampModified: number
}

export const isSPAnalysisFile = (x: any): x is SPAnalysisFile => {
    return validateObject(x, {
        analysisId: isString,
        workspaceId: isString,
        fileName: isString,
        fileContent: optional(isString),
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
    stanProgram: string
    datasetFileName: string
    datasetSha1: string
    optionsFileName: string
    optionsYaml: string
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    computeResourceId?: string
}

export const isSPAnalysisRun = (x: any): x is SPAnalysisRun => {
    return validateObject(x, {
        analysisRunId: isString,
        analysisId: isString,
        workspaceId: isString,
        timestampCreated: isNumber,
        stanProgramFileName: isString,
        stanProgram: isString,
        datasetFileName: isString,
        datasetSha1: isString,
        optionsFileName: isString,
        optionsYaml: isString,
        status: isOneOf([isEqualTo('pending'), isEqualTo('queued'), isEqualTo('running'), isEqualTo('completed'), isEqualTo('failed')]),
        error: optional(isString),
        computeResourceId: optional(isString)
    })
}


export type SPDataBlob = {
    sha1: string
    size: number
    content: string
}

export const isSPDataBlob = (x: any): x is SPDataBlob => {
    return validateObject(x, {
        sha1: isString,
        size: isNumber,
        content: isString
    })
}