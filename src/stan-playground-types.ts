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

export type SPAnalysis = {
    analysisId: string
    workspaceId: string
    name: string
    description: string
    timestampCreated: number
    timestampModified: number
}

export type SPAnalysisFile = {
    analysisId: string
    workspaceId: string
    fileName: string
    fileContent?: string
    timestampModified: number
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
    optionsYaml: unknown
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    computeResourceId: string
}

export type SPDataBlob = {
    sha1: string
    size: number
    data: string
}