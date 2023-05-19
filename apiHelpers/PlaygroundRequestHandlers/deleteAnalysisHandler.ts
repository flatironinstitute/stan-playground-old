import { DeleteAnalysisRequest, DeleteAnalysisResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const deleteAnalysisHandler = async (request: DeleteAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to delete an analysis')
    }

    const client = await getMongoClient()

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: request.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }

    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can delete an analysis in the workspace')
    }

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId: request.analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    analysisFilesCollection.deleteMany({analysisId: request.analysisId})

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    analysisRunsCollection.deleteMany({analysisId: request.analysisId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({analysisId: request.analysisId})

    analysesCollection.deleteOne({analysisId: request.analysisId})

    return {
        type: 'deleteAnalysis'
    }
}

export default deleteAnalysisHandler