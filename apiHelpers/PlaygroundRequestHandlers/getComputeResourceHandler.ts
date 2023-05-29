import { GetComputeResourceRequest, GetComputeResourceResponse } from "../../src/types/PlaygroundRequest";
import { isSPComputeResource } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getComputeResourceHandler = async (request: GetComputeResourceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetComputeResourceResponse> => {
    const client = await getMongoClient()
    const computeResourcesCollection = client.db('stan-playground').collection('computeResources')
    
    const computeResource = removeIdField(await computeResourcesCollection.findOne({computeResourceId: request.computeResourceId}))
    if (!isSPComputeResource(computeResource)) {
        console.warn(computeResource)
        throw new Error('Invalid compute resource in database (1)')
    }
    return {
        type: 'getComputeResource',
        computeResource
    }
}

export default getComputeResourceHandler