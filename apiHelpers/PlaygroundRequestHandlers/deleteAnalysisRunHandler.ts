import { DeleteAnalysisRunRequest, DeleteAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import { userCanDeleteAnalysis, userCanDeleteAnalysisRun } from "../permissions";
import removeIdField from "../removeIdField";

const deleteAnalysisRunHandler = async (request: DeleteAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisRunResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to delete an analysis run')
    }

    const client = await getMongoClient()

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: request.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!userCanDeleteAnalysisRun(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete an analysis run in this workspace')
    }

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId: request.analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
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