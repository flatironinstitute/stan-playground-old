import { DeleteAnalysisRunRequest, DeleteAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteAnalysisRun } from "../permissions";

const deleteAnalysisRunHandler = async (request: DeleteAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisRunResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteAnalysisRun(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete an analysis run in this workspace')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    // important to check this
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    await analysisRunsCollection.deleteOne({analysisRunId: request.analysisRunId})

    const analysesCollection = client.db('stan-playground').collection('analyses')
    await analysesCollection.updateOne({analysisId: request.analysisId}, {$set: {timestampModified: Date.now() / 1000}})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'deleteAnalysisRun'
    }
}

export default deleteAnalysisRunHandler