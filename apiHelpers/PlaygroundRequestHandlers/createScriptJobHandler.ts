import { CreateScriptJobRequest, CreateScriptJobResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisFile, SPScriptJob } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import getWorkspaceRole from "../getWorkspaceRole";
import removeIdField from "../removeIdField";

const createScriptJobHandler = async (request: CreateScriptJobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateScriptJobResponse> => {
    const userId = o.verifiedUserId
    const workspaceId = request.workspaceId

    const workspace = await getWorkspace(workspaceId, {useCache: false})
    const workspaceRole = getWorkspaceRole(workspace, userId)

    const canEdit = workspaceRole === 'admin' || workspaceRole === 'editor'
    if (!canEdit) {
        throw new Error('User does not have permission to create script jobs')
    }

    if (!workspace.computeResourceId) {
        throw new Error('Workspace does not have a compute resource ID')
    }

    const analysis = await getAnalysis(request.analysisId, {useCache: false})
    // important to check this
    if (analysis.workspaceId !== workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const client = await getMongoClient()

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    const analysisFile = removeIdField(await analysisFilesCollection.findOne({
        workspaceId,
        analysisId: request.analysisId,
        fileName: request.scriptFileName
    }))
    if (!analysisFile) {
        throw new Error('Analysis file not found')
    }
    if (!isSPAnalysisFile(analysisFile)) {
        console.warn(analysisFile)
        throw new Error('Invalid analysis file in database (1)')
    }

    const scriptJobId = createRandomId(8)

    const job: SPScriptJob = {
        scriptJobId,
        workspaceId,
        analysisId: request.analysisId,
        scriptFileName: request.scriptFileName,
        scriptContentSha1: analysisFile.contentSha1,
        scriptContentSize: analysisFile.contentSize,
        status: 'pending',
        computeResourceId: workspace.computeResourceId,
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    }
    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    await scriptJobsCollection.insertOne(job)

    return {
        type: 'createScriptJob',
        scriptJobId
    }
}

export default createScriptJobHandler