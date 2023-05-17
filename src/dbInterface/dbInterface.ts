import { SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPDataBlob, SPWorkspace } from "../stan-playground-types";
import sha1 from 'crypto-js/sha1'

type DB = {
    workspaces: SPWorkspace[],
    analyses: SPAnalysis[],
    analysisFiles: SPAnalysisFile[]
    analysisRuns: SPAnalysisRun[]
    dataBlobs: SPDataBlob[]
}

const getDatabase = (): DB => {
    const a = localStorage.getItem('stan-playground-test-db')
    if (a === null) {
        return {
            workspaces: [],
            analyses: [],
            analysisFiles: [],
            analysisRuns: [],
            dataBlobs: []
        }
    }
    else {
        const x = JSON.parse(a)
        if (!x.workspaces) {
            x.workspaces = []
        }
        if (!x.analyses) {
            x.analyses = []
        }
        if (!x.analysisFiles) {
            x.analysisFiles = []
        }
        if (!x.analysisRuns) {
            x.analysisRuns = []
        }
        if (!x.dataBlobs) {
            x.dataBlobs = []
        }
        return x
    }
}

const setDatabase = (db: DB) => {
    localStorage.setItem('stan-playground-test-db', JSON.stringify(db))
}


export const fetchWorkspaces = async (): Promise<SPWorkspace[]> => {
    await sleepMsec(100)
    const db = getDatabase()
    return db.workspaces
}

export const createWorkspace = async (workspaceName: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const workspaceId = randomWorkspaceId()
    db.workspaces.push({
        workspaceId,
        ownerId: 'test-user',
        name: workspaceName,
        description: '',
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    })
    setDatabase(db)
}

export const fetchAnalyses = async (workspaceId: string): Promise<SPAnalysis[]> => {
    await sleepMsec(100)
    const db = getDatabase()
    return db.analyses.filter((a: SPAnalysis) => a.workspaceId === workspaceId)
}

const defaultStanProgram = ``

const defaultOptionsYaml = ``

export const createAnalysis = async (workspaceId: string): Promise<string> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisId = randomAnalysisId()
    db.analyses.push({
        analysisId,
        workspaceId,
        name: 'Untitled',
        description: '',
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    })
    db.analysisFiles.push({
        analysisId,
        workspaceId,
        fileName: 'main.stan',
        fileContent: defaultStanProgram,
        timestampModified: Date.now() / 1000
    })
    db.analysisFiles.push({
        analysisId,
        workspaceId,
        fileName: 'data.json',
        fileContent: '{}',
        timestampModified: Date.now() / 1000
    })
    db.analysisFiles.push({
        analysisId,
        workspaceId,
        fileName: 'options.yaml',
        fileContent: defaultOptionsYaml,
        timestampModified: Date.now() / 1000
    })
    setDatabase(db)
    return analysisId
}

export const fetchAnalysis = async (analysisId: string): Promise<SPAnalysis | undefined> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysis = db.analyses.find((a: SPAnalysis) => a.analysisId === analysisId)
    return analysis
}

export const fetchAnalysisFiles = async (analysisId: string): Promise<SPAnalysisFile[]> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.analysisId === analysisId).map((a: SPAnalysisFile) => (
        {
            ...a,
            fileContent: undefined
        }
    ))
    return analysisFiles
}

export const createAnalysisFile = async (analysisId: string, fileName: string, fileContent: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysis = db.analyses.find((a: SPAnalysis) => a.analysisId === analysisId)
    if (!analysis) return
    const analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.analysisId === analysisId)
    const existingFile = analysisFiles.find((a: SPAnalysisFile) => a.fileName === fileName)
    if (existingFile) return
    db.analysisFiles.push({
        analysisId,
        workspaceId: analysis.workspaceId,
        fileName,
        fileContent,
        timestampModified: Date.now() / 1000
    })
    setDatabase(db)
}

export const fetchAnalysisFile = async (analysisId: string, fileName: string): Promise<SPAnalysisFile | undefined> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
    if (!analysisFile) return undefined
    return analysisFile
}

export const setAnalysisFileContent = async (analysisId: string, fileName: string, fileContent: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
    if (!analysisFile) return
    analysisFile.fileContent = fileContent
    analysisFile.timestampModified = Date.now() / 1000
    setDatabase(db)
}

export const fetchAnalysisRuns = async (analysisId: string): Promise<SPAnalysisRun[]> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisId === analysisId)
    return analysisRuns
}

export const setDataBlob = async (sha1: string, data: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const existingBlob = db.dataBlobs.find((b: SPDataBlob) => b.sha1 === sha1)
    if (existingBlob) return
    db.dataBlobs.push({
        sha1,
        size: data.length,
        data
    })
    setDatabase(db)
}

export const createAnalysisRun = async (analysisId: string, o: {stanFileName: string, datasetFileName: string, optionsFileName: string, computeResourceId: string}): Promise<string> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysis = db.analyses.find((a: SPAnalysis) => a.analysisId === analysisId)
    if (!analysis) return ''
    const workspaceId = analysis.workspaceId
    const analysisRunId = randomAnalysisRunId()
    const stanProgramFile = await fetchAnalysisFile(analysisId, o.stanFileName)
    const datasetFile = await fetchAnalysisFile(analysisId, o.datasetFileName)
    const datasetSha1 = sha1OfString(datasetFile ? datasetFile.fileContent || '' : '')
    await setDataBlob(datasetSha1, datasetFile ? datasetFile.fileContent || '' : '')
    const optionsFile = await fetchAnalysisFile(analysisId, o.optionsFileName)
    const optionsYaml = optionsFile ? optionsFile.fileContent || '' : ''
    db.analysisRuns.push({
        analysisRunId,
        analysisId,
        workspaceId,
        timestampCreated: Date.now() / 1000,
        stanProgramFileName: o.stanFileName,
        stanProgram: stanProgramFile ? stanProgramFile.fileContent || '' : '',
        datasetFileName: o.datasetFileName,
        datasetSha1,
        optionsFileName: o.optionsFileName,
        optionsYaml,
        status: 'pending',
        error: undefined,
        computeResourceId: o.computeResourceId
    })
    setDatabase(db)
    return analysisRunId
}

export const deleteAnalysisRun = async (analysisRunId: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisRun = db.analysisRuns.find((a: SPAnalysisRun) => a.analysisRunId === analysisRunId)
    if (!analysisRun) return
    db.analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisRunId !== analysisRunId)
    setDatabase(db)
}

const sha1OfString = (s: string) => {
    return sha1(s).toString()
}

const sleepMsec = (msec: number) => {
    return new Promise(resolve => setTimeout(resolve, msec))
}

const randomWorkspaceId = () => {
    // lowercase alpha ID of length 8
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    let id = ''
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}

const randomAnalysisId = () => {
    // lowercase alpha ID of length 8
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    let id = ''
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}

const randomAnalysisRunId = () => {
    // lowercase alpha ID of length 8
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    let id = ''
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}