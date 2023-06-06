import { CreateProjectRequest, CreateProjectResponse, SetProjectFileRequest } from "../../src/types/PlaygroundRequest";
import { SPProject } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanCreateProject } from "../permissions";
import setProjectFileHandler from "./setProjectFileHandler";

const createProjectHandler = async (request: CreateProjectRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateProjectResponse> => {
    const {verifiedUserId} = o

    const projectId = createRandomId(8)

    const workspaceId = request.workspaceId

    const client = await getMongoClient()

    const workspace = await getWorkspace(workspaceId, {useCache: false})

    if (!userCanCreateProject(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to create an projects in this workspace')
    }

    const projects: SPProject = {
        projectId,
        workspaceId,
        name: request.name,
        description: '',
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    }

    const projectsCollection = client.db('stan-playground').collection('projects')

    await projectsCollection.insertOne(projects)

    const filesToAdd = [
        {
            fileName: 'main.stan',
            fileContent: defaultStanProgram
        },
        {
            fileName: 'data.json',
            fileContent: defaultDataJson
        },
        {
            fileName: 'main.spa',
            fileContent: defaultMainSpa
        }
    ]

    for (const x of filesToAdd) {
        const rr: SetProjectFileRequest = {
            type: 'setProjectFile',
            timestamp: Date.now() / 1000,
            projectId,
            workspaceId,
            fileName: x.fileName,
            fileContent: x.fileContent
        }
        await setProjectFileHandler(rr, o)
    }

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'createProject',
        projectId
    }
}

const defaultStanProgram = `data {
}

parameters {
}

model {
}`

const defaultDataJson = `{}`

const defaultMainSpa = `stan: main.stan
data: data.json
options:
    iter_sampling: 500
    iter_warmup: 500
    save_warmup: True
    chains: 4
    seed: 0
required_resources:
    num_cpus: 1
    ram_gb: 1
`

export default createProjectHandler