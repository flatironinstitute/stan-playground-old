import { GetScriptJobsRequest, GetScriptJobsResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getScriptJobs = async (request: GetScriptJobsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetScriptJobsResponse> => {
    const client = await getMongoClient()
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')

    const analysis = await getAnalysis(request.analysisId, {useCache: true})
    
    const workspaceId = analysis.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    
    const scriptJobs = removeIdField(await scriptJobsCollection.find({
        analysisId: request.analysisId
    }).toArray())
    for (const job of scriptJobs) {
        if (!isSPScriptJob(job)) {
            console.warn(job)
            throw new Error('Invalid script job in database')
        }
    }
    return {
        type: 'getScriptJobs',
        scriptJobs
    }
}

export default getScriptJobs