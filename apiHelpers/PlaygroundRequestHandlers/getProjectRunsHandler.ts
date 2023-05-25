import { GetProjectRunsRequest, GetProjectRunsResponse } from "../../src/types/PlaygroundRequest";
import { isSPProjectRun } from "../../src/types/stan-playground-types";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getProjectRunsHandler = async (request: GetProjectRunsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetProjectRunsResponse> => {
    const client = await getMongoClient()
    const projectRunsCollection = client.db('stan-playground').collection('projectRuns')

    const project = await getProject(request.projectId, {useCache: true})
    
    const workspaceId = project.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    
    const projectRuns = removeIdField(await projectRunsCollection.find({
        projectId: request.projectId
    }).toArray())
    for (const projectRun of projectRuns) {
        if (!isSPProjectRun(projectRun)) {
            console.warn(projectRun)
            throw new Error('Invalid project run in database')
        }
    }
    return {
        type: 'getProjectRuns',
        projectRuns
    }
}

export default getProjectRunsHandler