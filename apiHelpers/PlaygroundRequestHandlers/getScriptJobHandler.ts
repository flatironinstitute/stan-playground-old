import { GetScriptJobRequest, GetScriptJobResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getScriptJob = async (request: GetScriptJobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetScriptJobResponse> => {
    const client = await getMongoClient()
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')

    const analysis = await getAnalysis(request.analysisId, {useCache: true})
    
    const workspaceId = analysis.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    if (request.workspaceId !== workspaceId) {
        throw new Error('workspaceId does not match analysis.workspaceId')
    }
    
    const scriptJob = removeIdField(await scriptJobsCollection.findOne({
        workspaceId: request.workspaceId,
        analysisId: request.analysisId,
        scriptJobId: request.scriptJobId
    }))
    if (!scriptJob) {
        throw new Error(`No script job with ID ${request.scriptJobId}`)
    }
    if (!isSPScriptJob(scriptJob)) {
        console.warn(scriptJob)
        throw new Error('Invalid script job in database')
    }
    return {
        type: 'getScriptJob',
        scriptJob
    }
}

export default getScriptJob