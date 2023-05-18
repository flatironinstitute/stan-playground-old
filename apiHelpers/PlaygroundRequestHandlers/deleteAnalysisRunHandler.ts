import { DeleteAnalysisRunRequest, DeleteAnalysisRunResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const deleteAnalysisRunHandler = async (request: DeleteAnalysisRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisRunResponse> => {
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
        throw new Error('Only the owner of a workspace can delete an analysis run')
    }

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    await analysisRunsCollection.deleteOne({analysisRunId: request.analysisRunId})

    return {
        type: 'deleteAnalysisRun'
    }
}

export default deleteAnalysisRunHandler