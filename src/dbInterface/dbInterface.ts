import { SPAnalysis, SPAnalysisFile, SPAnalysisRun, SPDataBlob, SPWorkspace } from "../types/stan-playground-types";
import sha1 from 'crypto-js/sha1'
import { CreateAnalysisRequest, CreateAnalysisRunRequest, CreateWorkspaceRequest, DeleteAnalysisRequest, DeleteAnalysisRunRequest, DeleteWorkspaceRequest, GetAnalysesRequest, GetAnalysisFileRequest, GetAnalysisFilesRequest, GetAnalysisRequest, GetAnalysisRunsRequest, GetDataBlobRequest, GetWorkspaceRequest, GetWorkspacesRequest, SetAnalysisFileRequest, SetWorkspaceUsersRequest } from "../types/PlaygroundRequest";
import postPlaygroundRequest from "./postPlaygroundRequest";

const vercelMode = import.meta.env.VITE_GITHUB_CLIENT_ID !== undefined

type DevelopmentDatabase = {
    workspaces: SPWorkspace[],
    analyses: SPAnalysis[],
    analysisFiles: SPAnalysisFile[]
    analysisRuns: SPAnalysisRun[]
    dataBlobs: SPDataBlob[]
}

const getDevelopmentDatabase = (): DevelopmentDatabase => {
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

const setDevelopmentDatabase = (db: DevelopmentDatabase) => {
    localStorage.setItem('stan-playground-test-db', JSON.stringify(db))
}


export const fetchWorkspaces = async (): Promise<SPWorkspace[]> => {
    if (vercelMode) {
        const req: GetWorkspacesRequest = {
            type: 'getWorkspaces',
            timestamp: Date.now() / 1000
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getWorkspaces') {
            throw Error(`Unexpected response type ${resp.type}. Expected getWorkspaces.`)
        }
        return resp.workspaces
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        return db.workspaces
    }
}

export const fetchWorkspace = async (workspaceId: string): Promise<SPWorkspace | undefined> => {
    if (vercelMode) {
        const req: GetWorkspaceRequest = {
            type: 'getWorkspace',
            timestamp: Date.now() / 1000,
            workspaceId
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getWorkspace') {
            throw Error(`Unexpected response type ${resp.type}. Expected getWorkspace.`)
        }
        return resp.workspace
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const workspace = db.workspaces.find((w: SPWorkspace) => w.workspaceId === workspaceId)
        if (!workspace) {
            throw new Error('Workspace not found')
        }
        return workspace
    }
}

type Auth = {
    githubAccessToken?: string
}

export const createWorkspace = async (workspaceName: string, auth: Auth): Promise<string> => {
    if (vercelMode) {
        const req: CreateWorkspaceRequest = {
            type: 'createWorkspace',
            timestamp: Date.now() / 1000,
            name: workspaceName
        }
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to createWorkspace in production mode')
        }
        const resp = await postPlaygroundRequest(req, {...auth})
        if (resp.type !== 'createWorkspace') {
            throw Error(`Unexpected response type ${resp.type}. Expected createWorkspace.`)
        }
        return resp.workspaceId
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const workspaceId = randomWorkspaceId()
        db.workspaces.push({
            workspaceId,
            ownerId: 'test-user',
            name: workspaceName,
            description: '',
            publiclyViewable: true,
            publiclyEditable: false,
            users: [],
            timestampCreated: Date.now() / 1000,
            timestampModified: Date.now() / 1000
        })
        setDevelopmentDatabase(db)
        return workspaceId
    }
}

export const fetchAnalyses = async (workspaceId: string): Promise<SPAnalysis[]> => {
    if (vercelMode) {
        const req: GetAnalysesRequest = {
            type: 'getAnalyses',
            timestamp: Date.now() / 1000,
            workspaceId
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getAnalyses') {
            throw Error(`Unexpected response type ${resp.type}. Expected getAnalyses.`)
        }
        return resp.analyses
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        return db.analyses.filter((a: SPAnalysis) => a.workspaceId === workspaceId)
    }
}

const defaultStanProgram = ``

const defaultOptionsYaml = ``

export const createAnalysis = async (workspaceId: string, auth: Auth): Promise<string> => {
    if (vercelMode) {
        const req: CreateAnalysisRequest = {
            type: 'createAnalysis',
            timestamp: Date.now() / 1000,
            workspaceId
        }
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to createAnalysis in production mode')
        }
        const resp = await postPlaygroundRequest(req, {...auth})
        if (resp.type !== 'createAnalysis') {
            throw Error(`Unexpected response type ${resp.type}. Expected createAnalysis.`)
        }
        return resp.analysisId
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysisId = randomAnalysisId()
        db.analyses.push({
            analysisId,
            workspaceId,
            name: 'Untitled',
            description: '',
            timestampCreated: Date.now() / 1000,
            timestampModified: Date.now() / 1000
        })
        setDevelopmentDatabase(db)

        await setAnalysisFileContent(workspaceId, analysisId, 'main.stan', defaultStanProgram, auth)
        await setAnalysisFileContent(workspaceId, analysisId, 'data.json', '{}', auth)
        await setAnalysisFileContent(workspaceId, analysisId, 'options.yaml', defaultOptionsYaml, auth)
        return analysisId
    }
}

export const setWorkspaceUsers = async (workspaceId: string, users: {userId: string, role: 'admin' | 'editor' | 'viewer'}[], auth: Auth): Promise<void> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to setWorkspaceUsers in production mode')
        }
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
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const workspace = db.workspaces.find((w: SPWorkspace) => w.workspaceId === workspaceId)
        if (!workspace) {
            throw new Error('Workspace not found')
        }
        if (workspace.ownerId !== 'test-user') {
            throw new Error('Only the owner of a workspace can set the workspace users')
        }
        workspace.users = users
        setDevelopmentDatabase(db)
    }
}

export const deleteWorkspace = async (workspaceId: string, auth: Auth): Promise<void> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to deleteWorkspace in production mode')
        }
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
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        db.workspaces = db.workspaces.filter((w: SPWorkspace) => w.workspaceId !== workspaceId)
        db.analyses = db.analyses.filter((a: SPAnalysis) => a.workspaceId !== workspaceId)
        db.analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.workspaceId !== workspaceId)
        db.analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.workspaceId !== workspaceId)
        db.dataBlobs = db.dataBlobs.filter((b: SPDataBlob) => b.workspaceId !== workspaceId)
        setDevelopmentDatabase(db)
    }
}

export const fetchAnalysis = async (analysisId: string): Promise<SPAnalysis | undefined> => {
    if (vercelMode) {
        const req: GetAnalysisRequest = {
            type: 'getAnalysis',
            timestamp: Date.now() / 1000,
            analysisId
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getAnalysis') {
            throw Error(`Unexpected response type ${resp.type}. Expected getAnalysis.`)
        }
        return resp.analysis
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysis = db.analyses.find((a: SPAnalysis) => a.analysisId === analysisId)
        return analysis
    }
}

export const fetchAnalysisFiles = async (analysisId: string): Promise<SPAnalysisFile[]> => {
    if (vercelMode) {
        const req: GetAnalysisFilesRequest = {
            type: 'getAnalysisFiles',
            timestamp: Date.now() / 1000,
            analysisId
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getAnalysisFiles') {
            throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisFiles.`)
        }
        return resp.analysisFiles
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.analysisId === analysisId)
        return analysisFiles
    }
}

export const fetchAnalysisFile = async (analysisId: string, fileName: string): Promise<SPAnalysisFile | undefined> => {
    if (vercelMode) {
        const req: GetAnalysisFileRequest = {
            type: 'getAnalysisFile',
            timestamp: Date.now() / 1000,
            analysisId,
            fileName
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getAnalysisFile') {
            throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisFile.`)
        }
        return resp.analysisFile
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
        if (!analysisFile) return undefined
        return analysisFile
    }
}

export const fetchDataBlob = async (workspaceId: string, analysisId: string, sha1: string): Promise<string | undefined> => {
    if (vercelMode) {
        const req: GetDataBlobRequest = {
            type: 'getDataBlob',
            timestamp: Date.now() / 1000,
            workspaceId,
            analysisId,
            sha1
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getDataBlob') {
            throw Error(`Unexpected response type ${resp.type}. Expected getDataBlob.`)
        }
        return resp.content
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const dataBlob = db.dataBlobs.find((b: SPDataBlob) => (b.workspaceId === workspaceId && b.analysisId === analysisId && b.sha1 === sha1))
        if (!dataBlob) return undefined
        return dataBlob.content
    }
}

export const setAnalysisFileContent = async (workspaceId: string, analysisId: string, fileName: string, fileContent: string, auth: Auth): Promise<void> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to setAnalysisFileContent in production mode')
        }
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
    else {
        await sleepMsec(100)

        const analysis = await fetchAnalysis(analysisId)
        if (!analysis) throw Error(`Analysis ${analysisId} not found`)

        const db = getDevelopmentDatabase()
        const contentSha1 = sha1OfString(fileContent)
        const contentSize = fileContent.length
        if (!db.dataBlobs.find((b: SPDataBlob) => b.sha1 === contentSha1)) {
            db.dataBlobs.push({
                workspaceId: analysis.workspaceId,
                analysisId,
                sha1: contentSha1,
                size: contentSize,
                content: fileContent
            })
        }

        const existingAnalysisFile = db.analysisFiles.find((a: SPAnalysisFile) => a.analysisId === analysisId && a.fileName === fileName)
        if (!existingAnalysisFile) {
            db.analysisFiles.push({
                analysisId,
                workspaceId: analysis.workspaceId,
                fileName,
                contentSha1,
                contentSize,
                timestampModified: Date.now() / 1000
            })
        }
        else {
            existingAnalysisFile.contentSha1 = contentSha1
            existingAnalysisFile.contentSize = contentSize
            existingAnalysisFile.timestampModified = Date.now() / 1000
        }
        setDevelopmentDatabase(db)
    }
}

export const fetchAnalysisRuns = async (analysisId: string): Promise<SPAnalysisRun[]> => {
    if (vercelMode) {
        const req: GetAnalysisRunsRequest = {
            type: 'getAnalysisRuns',
            timestamp: Date.now() / 1000,
            analysisId
        }
        const resp = await postPlaygroundRequest(req, {})
        if (resp.type !== 'getAnalysisRuns') {
            throw Error(`Unexpected response type ${resp.type}. Expected getAnalysisRuns.`)
        }
        return resp.analysisRuns
    }
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisId === analysisId)
        return analysisRuns
    }
}

export const createAnalysisRun = async (workspaceId: string, analysisId: string, o: {stanFileName: string, datasetFileName: string, optionsFileName: string}, auth: Auth): Promise<string> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to createAnalysisRun in production mode')
        }
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
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysis = db.analyses.find((a: SPAnalysis) => a.analysisId === analysisId)
        if (!analysis) return ''
        const workspaceId = analysis.workspaceId
        const analysisRunId = randomAnalysisRunId()

        const stanProgramFile = await fetchAnalysisFile(analysisId, o.stanFileName)
        if (!stanProgramFile) {
            throw new Error('Stan program file not found')
        }
        const stanProgramContentSha1 = stanProgramFile.contentSha1
        const stanProgramContentSize = stanProgramFile.contentSize

        const datasetFile = await fetchAnalysisFile(analysisId, o.datasetFileName)
        if (!datasetFile) {
            throw new Error('Dataset file not found')
        }
        const datasetContentSha1 = datasetFile.contentSha1
        const datasetContentSize = datasetFile.contentSize

        const optionsFile = await fetchAnalysisFile(analysisId, o.optionsFileName)
        if (!optionsFile) {
            throw new Error('Options file not found')
        }
        const optionsContentSha1 = optionsFile.contentSha1
        const optionsContentSize = optionsFile.contentSize

        db.analysisRuns.push({
            analysisRunId,
            analysisId,
            workspaceId,
            timestampCreated: Date.now() / 1000,
            stanProgramFileName: o.stanFileName,
            stanProgramContentSha1,
            stanProgramContentSize,
            datasetFileName: o.datasetFileName,
            datasetContentSha1,
            datasetContentSize,
            optionsFileName: o.optionsFileName,
            optionsContentSha1,
            optionsContentSize,
            status: 'pending',
            error: undefined
        })
        setDevelopmentDatabase(db)
        return analysisRunId
    }
}

export const deleteAnalysisRun = async (workspaceId: string, analysisId: string, analysisRunId: string, auth: Auth): Promise<void> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to deleteAnalysisRun in production mode')
        }
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
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        const analysisRun = db.analysisRuns.find((a: SPAnalysisRun) => a.analysisRunId === analysisRunId)
        if (!analysisRun) return
        db.analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisRunId !== analysisRunId)
        setDevelopmentDatabase(db)
    }
}

export const deleteAnalysis = async (workspaceId: string, analysisId: string, auth: Auth): Promise<void> => {
    if (vercelMode) {
        if (!auth.githubAccessToken) {
            throw Error('Must provide githubAccessToken to deleteAnalysis in production mode')
        }
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
    else {
        await sleepMsec(100)
        const db = getDevelopmentDatabase()
        db.analyses = db.analyses.filter((a: SPAnalysis) => a.analysisId !== analysisId)
        db.analysisFiles = db.analysisFiles.filter((a: SPAnalysisFile) => a.analysisId !== analysisId)
        db.analysisRuns = db.analysisRuns.filter((a: SPAnalysisRun) => a.analysisId !== analysisId)
        db.dataBlobs = db.dataBlobs.filter((b: SPDataBlob) => b.analysisId !== analysisId)
        setDevelopmentDatabase(db)
    }
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