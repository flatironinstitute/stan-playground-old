import { GetAnalysisFilesRequest, GetAnalysisFilesResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis, isSPAnalysisFile, isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysisFilesHandler = async (request: GetAnalysisFilesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisFilesResponse> => {
    const client = await getMongoClient()
    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId: request.analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (!isSPAnalysis(analysis)) {
        console.warn(analysis)
        throw new Error('Invalid analysis in database')
    }
    
    const workspaceId = analysis.workspaceId
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database')
    }
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