import { GetAnalysisFilesRequest, GetAnalysisFilesResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisFile } from "../../src/types/stan-playground-types";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysisFilesHandler = async (request: GetAnalysisFilesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisFilesResponse> => {
    const client = await getMongoClient()
    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')

    const analysis = await getAnalysis(request.analysisId, {useCache: true})
    
    const workspaceId = analysis.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }

    const analysisFiles = removeIdField(await analysisFilesCollection.find({
        analysisId: request.analysisId
    }).toArray())
    for (const analysisFile of analysisFiles) {
        if (!isSPAnalysisFile(analysisFile)) {
            console.warn(analysisFile)

            // // during development only:
            // await analysisFilesCollection.deleteOne({
            //     analysisId: request.analysisId,
            //     fileName: analysisFile.fileName
            // })

            throw new Error('Invalid analysis file in database (3)')
        }
    }
    return {
        type: 'getAnalysisFiles',
        analysisFiles
    }
}

export default getAnalysisFilesHandler