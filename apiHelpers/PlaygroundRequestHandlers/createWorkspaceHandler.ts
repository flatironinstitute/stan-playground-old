import { CreateWorkspaceRequest, CreateWorkspaceResponse } from "../../src/types/PlaygroundRequest";
import { SPWorkspace } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";

const createWorkspaceHandler = async (request: CreateWorkspaceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateWorkspaceResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create a workspace')
    }

    const workspaceId = createRandomId(8)

    const workspace: SPWorkspace = {
        workspaceId,
        ownerId: verifiedUserId,
        name: request.name,
        description: '',
        publiclyViewable: true,
        publiclyEditable: false,
        users: [],
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    }

    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')

    await workspacesCollection.insertOne(workspace)

    return {
        type: 'createWorkspace',
        workspaceId
    }
}

export default createWorkspaceHandler