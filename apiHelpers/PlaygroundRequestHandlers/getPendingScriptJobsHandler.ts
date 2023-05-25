import { GetPendingScriptJobsRequest, GetPendingScriptJobsResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getPendingScriptJobsHandler = async (request: GetPendingScriptJobsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetPendingScriptJobsResponse> => {
    if (!request.computeResourceId) {
        throw new Error('No computeResourceId provided')
    }
    if (request.computeResourceId !== o.verifiedClientId) {
        throw new Error('computeResourceId does not match verifiedClientId')
    }
    const client = await getMongoClient()
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    const scriptJobs = removeIdField(await scriptJobsCollection.find({
        computeResourceId: request.computeResourceId,
        status: 'pending'
    }).toArray())
    for (const scriptJob of scriptJobs) {
        if (!isSPScriptJob(scriptJob)) {
            console.warn(scriptJob)
            throw new Error('Invalid script job in database (0)')
        }
    }
    return {
        type: 'getPendingScriptJobs',
        scriptJobs
    }
}

export default getPendingScriptJobsHandler