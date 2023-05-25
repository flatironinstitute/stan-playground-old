import { CreateProjectRunRequest, CreateProjectRunResponse } from "../../src/types/PlaygroundRequest";
import { isSPProjectFile, SPProjectFile, SPProjectRun } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanCreateProjectRun } from "../permissions";
import removeIdField from "../removeIdField";

const createProjectRunHandler = async (request: CreateProjectRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateProjectRunResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanCreateProjectRun(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to create an projects run in this workspace')
    }

    const project = await getProject(request.projectId, {useCache: false})
    // important to check this
    if (project.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const projectRunId = createRandomId(8)

    const projectsFilesCollection = client.db('stan-playground').collection('projectsFiles')
    const projectsFiles = removeIdField(await projectsFilesCollection.find({projectId: request.projectId}).toArray()) as SPProjectFile[]
    for (const projectsFile of projectsFiles) {
        if (!isSPProjectFile(projectsFile)) {
            console.warn(projectsFile)
            throw new Error('Invalid projects file in database (1)')
        }
    }

    const stanFile = projectsFiles.find(x => x.fileName === request.stanProgramFileName)
    if (!stanFile) {
        throw new Error('Stan program file not found')
    }
    const datasetFile = projectsFiles.find(x => x.fileName === request.datasetFileName)
    if (!datasetFile) {
        throw new Error('Dataset file not found')
    }
    const optionsFile = projectsFiles.find(x => x.fileName === request.optionsFileName)
    if (!optionsFile) {
        throw new Error('Options file not found')
    }

    const projectRun: SPProjectRun = {
        projectRunId,
        projectId: request.projectId,
        workspaceId: project.workspaceId,
        timestampCreated: Date.now() / 1000,
        stanProgramFileName: request.stanProgramFileName,
        stanProgramContentSha1: stanFile.contentSha1,
        stanProgramContentSize: stanFile.contentSize,
        datasetFileName: request.datasetFileName,
        datasetContentSha1: datasetFile.contentSha1,
        datasetContentSize: datasetFile.contentSize,
        optionsFileName: request.optionsFileName,
        optionsContentSha1: optionsFile.contentSha1,
        optionsContentSize: optionsFile.contentSize,
        status: 'pending'
    }

    const projectRunsCollection = client.db('stan-playground').collection('projectRuns')
    await projectRunsCollection.insertOne(projectRun)

    const projectsCollection = client.db('stan-playground').collection('projects')
    await projectsCollection.updateOne({projectId: request.projectId}, {$set: {timestampModified: project.timestampModified}})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'createProjectRun',
        projectRunId
    }
}

export default createProjectRunHandler