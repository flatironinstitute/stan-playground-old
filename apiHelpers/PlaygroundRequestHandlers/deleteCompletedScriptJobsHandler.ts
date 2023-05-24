import { DeleteCompletedScriptJobsRequest, DeleteCompletedScriptJobsResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import getWorkspaceRole from "../getWorkspaceRole";

const deleteCompletedScriptJobsHandler = async (request: DeleteCompletedScriptJobsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteCompletedScriptJobsResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    const workspaceRole = getWorkspaceRole(workspace, verifiedUserId)
    const okay = workspaceRole === 'admin' || workspaceRole === 'editor'
    if (!okay) {
        throw new Error('User does not have permission to delete script jobs in this workspace')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    // important to check this
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')

    await scriptJobsCollection.deleteMany({analysisId: request.analysisId, scriptFileName: request.scriptFileName, status: 'completed'})
    await scriptJobsCollection.deleteMany({analysisId: request.analysisId, scriptFileName: request.scriptFileName, status: 'failed'})

    return {
        type: 'deleteCompletedScriptJobs'
    }
}

export default deleteCompletedScriptJobsHandler