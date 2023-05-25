import { GetDataBlobRequest, GetDataBlobResponse } from "../../src/types/PlaygroundRequest";
import { isSPDataBlob } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getDataBlobHandler = async (request: GetDataBlobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetDataBlobResponse> => {
    const client = await getMongoClient()
    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')

    const workspace = await getWorkspace(request.workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId, o.verifiedClientId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    
    const dataBlob = removeIdField(await dataBlobsCollection.findOne({
        workspaceId: request.workspaceId,
        projectId: request.projectId,
        sha1: request.sha1
    }))
    if (!dataBlob) {
        throw Error('Data blob not found')
    }
    if (!isSPDataBlob(dataBlob)) {
        console.warn(dataBlob)
        throw new Error('Invalid data blob in database')
    }

    return {
        type: 'getDataBlob',
        content: dataBlob.content
    }
}

export default getDataBlobHandler