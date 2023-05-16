import { SPAnalysis, SPAnalysisFile, SPWorkspace } from "../stan-playground-types";

type DB = {
    workspaces: SPWorkspace[],
    analyses: SPAnalysis[],
    analysisFiles: SPAnalysisFile[]
}

const getDatabase = () => {
    const a = localStorage.getItem('stan-playground-test-db')
    if (a === null) {
        return {
            workspaces: [],
            analyses: []
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
        fileType: 'stan_program',
        fileName: 'main.stan',
        fileContent: defaultStanProgram,
        timestampModified: Date.now() / 1000
    })
    db.analysisFiles.push({
        analysisId,
        workspaceId,
        fileType: 'dataset',
        fileName: 'data.json',
        fileContent: '{}',
        timestampModified: Date.now() / 1000
    })
    db.analysisFiles.push({
        analysisId,
        workspaceId,
        fileType: 'options',
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