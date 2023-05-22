import { CreateAnalysisRunRequest, CreateAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisFile, SPAnalysisFile, SPAnalysisRun } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanCreateAnalysisRun } from "../permissions";
import removeIdField from "../removeIdField";

const createAnalysisRunHandler = async (request: CreateAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateAnalysisRunResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanCreateAnalysisRun(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to create an analysis run in this workspace')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    // important to check this
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const analysisRunId = createRandomId(8)

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    const analysisFiles = removeIdField(await analysisFilesCollection.find({analysisId: request.analysisId}).toArray()) as SPAnalysisFile[]
    for (const analysisFile of analysisFiles) {
        if (!isSPAnalysisFile(analysisFile)) {
            console.warn(analysisFile)
            throw new Error('Invalid analysis file in database (1)')
        }
    }

    const stanFile = analysisFiles.find(x => x.fileName === request.stanProgramFileName)
    if (!stanFile) {
        throw new Error('Stan program file not found')
    }
    const datasetFile = analysisFiles.find(x => x.fileName === request.datasetFileName)
    if (!datasetFile) {
        throw new Error('Dataset file not found')
    }
    const optionsFile = analysisFiles.find(x => x.fileName === request.optionsFileName)
    if (!optionsFile) {
        throw new Error('Options file not found')
    }

    const analysisRun: SPAnalysisRun = {
        analysisRunId,
        analysisId: request.analysisId,
        workspaceId: analysis.workspaceId,
        timestampCreated: Date.now() / 1000,
        stanProgramFileName: request.stanProgramFileName,
        stanProgramContentSha1: stanFile.contentSha1,
        stanProgramContentSize: stanFile.contentSize,
        datasetFileName: request.datasetFileName,
        datasetContentSha1: datasetFile.contentSha1,
        datasetContentSize: datasetFile.contentSize,
        optionsFileName: request.optionsFileName,
        optionsContentSha1: optionsFile.contentSha1,
        optionsContentSize: optionsFile.contentSize,
        status: 'pending'
    }

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    await analysisRunsCollection.insertOne(analysisRun)

    return {
        type: 'createAnalysisRun',
        analysisRunId
    }
}

export default createAnalysisRunHandler