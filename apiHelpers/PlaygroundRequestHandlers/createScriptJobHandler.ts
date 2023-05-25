import { CreateScriptJobRequest, CreateScriptJobResponse } from "../../src/types/PlaygroundRequest";
import { isSPProjectFile, SPScriptJob } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import getProject from "../getProject";
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

    const project = await getProject(request.projectId, {useCache: false})
    // important to check this
    if (project.workspaceId !== workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const client = await getMongoClient()

    const projectFilesCollection = client.db('stan-playground').collection('projectFiles')
    const projectFile = removeIdField(await projectFilesCollection.findOne({
        workspaceId,
        projectId: request.projectId,
        fileName: request.scriptFileName
    }))
    if (!projectFile) {
        throw new Error('Project file not found')
    }
    if (!isSPProjectFile(projectFile)) {
        console.warn(projectFile)
        throw new Error('Invalid projects file in database (1)')
    }

    const scriptJobId = createRandomId(8)

    const job: SPScriptJob = {
        scriptJobId,
        workspaceId,
        projectId: request.projectId,
        scriptFileName: request.scriptFileName,
        scriptContentSha1: projectFile.contentSha1,
        scriptContentSize: projectFile.contentSize,
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