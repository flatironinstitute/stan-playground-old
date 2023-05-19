import { GetDataBlobRequest, GetDataBlobResponse } from "../../src/types/PlaygroundRequest";
import { isSPDataBlob } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getDataBlobHandler = async (request: GetDataBlobRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetDataBlobResponse> => {
    const client = await getMongoClient()
    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    
    const dataBlob = removeIdField(await dataBlobsCollection.findOne({
        workspaceId: request.workspaceId,
        analysisId: request.analysisId,
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