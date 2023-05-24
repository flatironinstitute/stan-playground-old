import { DeleteScriptJobRequest, DeleteScriptJobResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import getWorkspaceRole from "../getWorkspaceRole";

const deleteScriptJobHandler = async (request: DeleteScriptJobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteScriptJobResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    const workspaceRole = getWorkspaceRole(workspace, verifiedUserId)
    const okay = workspaceRole === 'admin' || workspaceRole === 'editor'
    if (!okay) {
        throw new Error('User does not have permission to delete a script job in this workspace')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    // important to check this
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    await scriptJobsCollection.deleteOne({scriptJobId: request.scriptJobId})

    const analysesCollection = client.db('stan-playground').collection('analyses')
    await analysesCollection.updateOne({analysisId: request.analysisId}, {$set: {timestampModified: Date.now() / 1000}})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'deleteScriptJob'
    }
}

export default deleteScriptJobHandler