import { GetComputeResourcesRequest, GetComputeResourcesResponse } from "../../src/types/PlaygroundRequest";
import { isSPComputeResource } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getComputeResourcesHandler = async (request: GetComputeResourcesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetComputeResourcesResponse> => {
    const userId = o.verifiedUserId
    if (!userId) {
        throw new Error('You must be logged in to get compute resources')
    }
    const client = await getMongoClient()
    const computeResourcesCollection = client.db('stan-playground').collection('computeResources')
    
    const computeResources = removeIdField(await computeResourcesCollection.find({ownerId: userId}).toArray())
    for (const cr of computeResources) {
        if (!isSPComputeResource(cr)) {
            console.warn(cr)
            throw new Error('Invalid compute resource in database (1)')
        }
    }
    return {
        type: 'getComputeResources',
        computeResources
    }
}

export default getComputeResourcesHandler