import { CreateAnalysisRunRequest, CreateAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import { SPAnalysisRun } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const createAnalysisRunHandler = async (request: CreateAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateAnalysisRunResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis')
    }

    const client = await getMongoClient()

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId: request.analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: analysis.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }

    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can create an analysis run')
    }

    const analysisRunId = createRandomId(8)

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    const analysisFiles = removeIdField(await analysisFilesCollection.find({analysisId: request.analysisId}).toArray())

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