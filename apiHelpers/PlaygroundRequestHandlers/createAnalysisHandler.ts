import { CreateAnalysisRequest, CreateAnalysisResponse, SetAnalysisFileRequest } from "../../src/types/PlaygroundRequest";
import { SPAnalysis } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanCreateAnalysis } from "../permissions";
import setAnalysisFileHandler from "./setAnalysisFileHandler";

const createAnalysisHandler = async (request: CreateAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateAnalysisResponse> => {
    const {verifiedUserId} = o

    const analysisId = createRandomId(8)

    const workspaceId = request.workspaceId

    const client = await getMongoClient()

    const workspace = await getWorkspace(workspaceId, {useCache: false})

    if (!userCanCreateAnalysis(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to create an analysis in this workspace')
    }

    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can create an analysis in the workspace')
    }

    const analysis: SPAnalysis = {
        analysisId,
        workspaceId,
        name: request.name,
        description: '',
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    }

    const analysesCollection = client.db('stan-playground').collection('analyses')

    await analysesCollection.insertOne(analysis)

    const filesToAdd = [
        {
            fileName: 'main.stan',
            fileContent: defaultStanProgram
        },
        {
            fileName: 'data.json',
            fileContent: '{}'
        },
        {
            fileName: 'options.yaml',
            fileContent: defaultOptionsYaml
        }
    ]

    for (const x of filesToAdd) {
        const rr: SetAnalysisFileRequest = {
            type: 'setAnalysisFile',
            timestamp: Date.now() / 1000,
            analysisId,
            workspaceId,
            fileName: x.fileName,
            fileContent: x.fileContent
        }
        await setAnalysisFileHandler(rr, o)
    }

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'createAnalysis',
        analysisId
    }
}

const defaultStanProgram = `data {
}

parameters {
}

model {
}`

const defaultOptionsYaml = ``

export default createAnalysisHandler