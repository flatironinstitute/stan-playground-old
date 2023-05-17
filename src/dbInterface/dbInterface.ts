import { SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPDataBlob, SPWorkspace } from "../types/stan-playground-types";
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
    setDatabase(db)

    await setAnalysisFileContent(analysisId, 'main.stan', defaultStanProgram)
    await setAnalysisFileContent(analysisId, 'data.json', '{}')
    await setAnalysisFileContent(analysisId, 'options.yaml', defaultOptionsYaml)
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
    const analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.analysisId === analysisId)
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
    const contentSha1 = sha1OfString(fileContent)
    const contentSize = fileContent.length
    db.analysisFiles.push({
        analysisId,
        workspaceId: analysis.workspaceId,
        fileName,
        contentSha1,
        contentSize,
        timestampModified: Date.now() / 1000
    })
    if (!db.dataBlobs.find((b: SPDataBlob) => b.sha1 === contentSha1)) {
        db.dataBlobs.push({
            workspaceId: analysis.workspaceId,
            sha1: contentSha1,
            size: contentSize,
            content: fileContent
        })
    }
    setDatabase(db)
}

export const fetchAnalysisFile = async (analysisId: string, fileName: string): Promise<SPAnalysisFile | undefined> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
    if (!analysisFile) return undefined
    return analysisFile
}

export const fetchDataBlob = async (workspaceId: string, sha1: string): Promise<string | undefined> => {
    await sleepMsec(100)
    const db = getDatabase()
    const dataBlob = db.dataBlobs.find((b: SPDataBlob) => (b.workspaceId === workspaceId && b.sha1 === sha1))
    if (!dataBlob) return undefined
    return dataBlob.content
}

export const setAnalysisFileContent = async (analysisId: string, fileName: string, fileContent: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const existingAnalysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
    if (!existingAnalysisFile) {
        await createAnalysisFile(analysisId, fileName, fileContent)
        return
    }

    const contentSha1 = sha1OfString(fileContent)
    const contentSize = fileContent.length
    if (!db.dataBlobs.find((b: SPDataBlob) => b.sha1 === contentSha1)) {
        db.dataBlobs.push({
            workspaceId: existingAnalysisFile.workspaceId,
            sha1: contentSha1,
            size: contentSize,
            content: fileContent
        })
    }
    existingAnalysisFile.contentSha1 = contentSha1
    existingAnalysisFile.contentSize = contentSize
    existingAnalysisFile.timestampModified = Date.now() / 1000
    setDatabase(db)
}

export const fetchAnalysisRuns = async (analysisId: string): Promise<SPAnalysisRun[]> => {
    await sleepMsec(100)
    const db = getDatabase()
    const analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisId === analysisId)
    return analysisRuns
}

export const setDataBlob = async (workspaceId: string, sha1: string, data: string): Promise<void> => {
    await sleepMsec(100)
    const db = getDatabase()
    const existingBlob = db.dataBlobs.find((b: SPDataBlob) => b.sha1 === sha1)
    if (existingBlob) return
    db.dataBlobs.push({
        workspaceId,
        sha1,
        size: data.length,
        content: data
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
    if (!stanProgramFile) {
        throw new Error('Stan program file not found')
    }
    const stanProgramContentSha1 = stanProgramFile.contentSha1

    const datasetFile = await fetchAnalysisFile(analysisId, o.datasetFileName)
    if (!datasetFile) {
        throw new Error('Dataset file not found')
    }
    const datasetContentSha1 = datasetFile.contentSha1

    const optionsFile = await fetchAnalysisFile(analysisId, o.optionsFileName)
    if (!optionsFile) {
        throw new Error('Options file not found')
    }
    const optionsContentSha1 = optionsFile.contentSha1

    db.analysisRuns.push({
        analysisRunId,
        analysisId,
        workspaceId,
        timestampCreated: Date.now() / 1000,
        stanProgramFileName: o.stanFileName,
        stanProgramContentSha1,
        datasetFileName: o.datasetFileName,
        datasetContentSha1,
        optionsFileName: o.optionsFileName,
        optionsContentSha1,
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