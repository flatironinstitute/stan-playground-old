import { GetPendingScriptJobRequest, GetPendingScriptJobResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getPendingScriptJobHandler = async (request: GetPendingScriptJobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetPendingScriptJobResponse> => {
    if (!request.computeResourceId) {
        throw new Error('No computeResourceId provided')
    }
    if (request.computeResourceId !== o.verifiedClientId) {
        throw new Error('computeResourceId does not match verifiedClientId')
    }
    const client = await getMongoClient()
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    const scriptJob = removeIdField(await scriptJobsCollection.findOne({
        computeResourceId: request.computeResourceId,
        status: 'pending'
    }))
    if (scriptJob) {
        if (!isSPScriptJob(scriptJob)) {
            console.warn(scriptJob)
            throw new Error('Invalid script job in database (1)')
        }
    }
    return {
        type: 'getPendingScriptJob',
        scriptJob: scriptJob || undefined
    }
}

export default getPendingScriptJobHandler