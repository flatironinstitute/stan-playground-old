import { GetScriptJobsRequest, GetScriptJobsResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getScriptJobs = async (request: GetScriptJobsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetScriptJobsResponse> => {
    const client = await getMongoClient()
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')

    const project = await getProject(request.projectId, {useCache: true})
    
    const workspaceId = project.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId, o.verifiedClientId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    
    const scriptJobs = removeIdField(await scriptJobsCollection.find({
        projectId: request.projectId
    }).toArray())
    for (const job of scriptJobs) {
        if (!isSPScriptJob(job)) {
            console.warn(job)

            // during development, delete the record
            await scriptJobsCollection.deleteOne({
                projectId: request.projectId,
                scriptJobId: job.scriptJobId
            })

            throw new Error('Invalid script job in database (3)')
        }
    }
    return {
        type: 'getScriptJobs',
        scriptJobs
    }
}

export default getScriptJobs