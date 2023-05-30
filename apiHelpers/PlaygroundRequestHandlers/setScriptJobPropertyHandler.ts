import { SetScriptJobPropertyRequest, SetScriptJobPropertyResponse } from "../../src/types/PlaygroundRequest";
import { isSPScriptJob } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import getPubnubClient from "../getPubnubClient";
import removeIdField from "../removeIdField";

const setScriptJobPropertyHandler = async (request: SetScriptJobPropertyRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<SetScriptJobPropertyResponse> => {
    const {verifiedClientId} = o

    if (!verifiedClientId) {
        throw new Error('Only compute resources can set script job properties')
    }

    const client = await getMongoClient()

    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    const scriptJob = removeIdField(await scriptJobsCollection.findOne({
        scriptJobId: request.scriptJobId
    }))
    if (!scriptJob) {
        throw new Error(`No script job with ID ${request.scriptJobId}`)
    }
    if (!isSPScriptJob(scriptJob)) {
        console.warn(scriptJob)
        throw new Error('Invalid script job in database (4)')
    }
    if ((scriptJob.projectId !== request.projectId) || (scriptJob.workspaceId !== request.workspaceId)) {
        throw new Error(`Script job ID ${request.scriptJobId} does not match projectId ${request.projectId} and workspaceId ${request.workspaceId}`)
    }
    if (scriptJob.computeResourceId !== verifiedClientId) {
        throw new Error(`Script job ID ${request.scriptJobId} does not match verifiedClientId ${verifiedClientId}`)
    }

    const update: {[k: string]: any} = {}

    if (request.property === 'status') {
        update.status = request.value
    }
    else if (request.property === 'error') {
        update.error = request.value
    }
    else if (request.property === 'consoleOutput') {
        update.consoleOutput = request.value
    }
    else {
        throw new Error('Invalid property')
    }
    update.timestampModified = Date.now() / 1000

    scriptJobsCollection.updateOne({scriptJobId: request.scriptJobId}, {$set: update})

    if (request.property === 'status') {
        const pnClient = await getPubnubClient()
        if (pnClient) {
            await pnClient.publish({
                channel: scriptJob.computeResourceId,
                message: {
                    type: 'scriptJobStatusChanged',
                    workspaceId: request.workspaceId,
                    projectId: request.projectId,
                    scriptFileName: scriptJob.scriptFileName,
                    scriptJobId: scriptJob.scriptJobId,
                    status: request.value
                }
            })
        }
    }

    return {
        type: 'setScriptJobProperty'
    }
}

export default setScriptJobPropertyHandler