import { DeleteAnalysisRequest, DeleteAnalysisResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteAnalysis } from "../permissions";

const deleteAnalysisHandler = async (request: DeleteAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteAnalysis(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete an analysis in this workspace')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    analysisFilesCollection.deleteMany({analysisId: request.analysisId})

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    analysisRunsCollection.deleteMany({analysisId: request.analysisId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({analysisId: request.analysisId})

    const analysesCollection = client.db('stan-playground').collection('analyses')

    await analysesCollection.deleteOne({analysisId: request.analysisId})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'deleteAnalysis'
    }
}

export default deleteAnalysisHandler