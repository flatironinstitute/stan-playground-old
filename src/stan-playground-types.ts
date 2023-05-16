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
    stanProgram: string
    datasetSha1: string
    options: unknown
    stanProgramFileName: string
    datasetFileName: string
    optionsFileName: string
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    computeResourceId?: string
}

export type DataBlob = {
    sha1: string
    size: number
    data: string
}