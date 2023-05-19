import { CreateAnalysisRequest, CreateAnalysisResponse, SetAnalysisFileRequest } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace, SPAnalysis } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";
import setAnalysisFileHandler from "./setAnalysisFileHandler";

const createAnalysisHandler = async (request: CreateAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateAnalysisResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis')
    }

    const analysisId = createRandomId(8)

    const workspaceId = request.workspaceId

    const client = await getMongoClient()

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database (**)')
    }
    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can create an analysis in the workspace')
    }

    const analysis: SPAnalysis = {
        analysisId,
        workspaceId,
        name: 'Untitled',
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

    return {
        type: 'createAnalysis',
        analysisId
    }
}

const defaultStanProgram = ``

const defaultOptionsYaml = ``

export default createAnalysisHandler