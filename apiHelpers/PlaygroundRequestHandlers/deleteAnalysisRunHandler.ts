import { DeleteAnalysisRunRequest, DeleteAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteAnalysisRun } from "../permissions";

const deleteAnalysisRunHandler = async (request: DeleteAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisRunResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to delete an analysis run')
    }

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

    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can delete an analysis run')
    }

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    await analysisRunsCollection.deleteOne({analysisRunId: request.analysisRunId})

    return {
        type: 'deleteAnalysisRun'
    }
}

export default deleteAnalysisRunHandler