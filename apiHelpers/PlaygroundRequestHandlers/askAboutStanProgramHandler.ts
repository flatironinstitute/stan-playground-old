import { AskAboutStanProgramRequest, AskAboutStanProgramResponse } from "../../src/types/PlaygroundRequest";
import { isSPDataBlob, isSPProjectFile } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import getProject from '../getProject';
import getWorkspace from '../getWorkspace';
import { userCanReadWorkspace } from '../permissions';
import removeIdField from '../removeIdField';
import crypto from 'crypto'

const askAboutStanProgramHandler = async (request: AskAboutStanProgramRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<AskAboutStanProgramResponse> => {
    const {verifiedUserId, verifiedClientId} = o

    const client = await getMongoClient()

    const projectId = request.projectId

    const project = await getProject(projectId, {useCache: false})
    if (project.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const workspace = await getWorkspace(project.workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, verifiedUserId, verifiedClientId)) {
        throw new Error('User does not have permission to read this workspace')
    }

    const projectFilesCollection = client.db('stan-playground').collection('projectFiles')
    const projectFile = removeIdField(await projectFilesCollection.findOne({
        projectId,
        fileName: request.stanFileName
    }))
    if (!projectFile) {
        throw Error('Stan file not found')
    }
    if (!isSPProjectFile(projectFile)) {
        console.warn(projectFile)
        throw Error('Invalid project file in database')
    }

    const sha1 = projectFile.contentSha1

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    const dataBlob = removeIdField(await dataBlobsCollection.findOne({
        projectId,
        sha1
    }))
    if (!dataBlob) {
        throw Error('Data blob not found')
    }
    if (!isSPDataBlob(dataBlob)) {
        console.warn(dataBlob)
        throw Error('Invalid data blob in database')
    }

    const stanProgram = dataBlob.content

    const fullPrompt = `
I am going to provide a Stan program followed by a prompt.
Please answer the prompt in a concise way sticking only to the topic of the stan program.
Your response will be included in a help panel in software where the user is editing this viewing this Stan program and wants to know more about it.
Please respond in markdown format with support for latex. Do not respond in plain text format.

Here's the stan program:

\`\`\`
${stanProgram}
\`\`\`

And here's the prompt:

${request.prompt}

PLEASE RESPOND IN MARKDOWN FORMAT, not plain text format.
`

    const askAboutStanProgramCacheCollection = client.db('stan-playground').collection('askAboutStanProgramCache')
    if (request.useCache && !request.force) {
        const cachedResponse = await askAboutStanProgramCacheCollection.findOne({
            stanProgramSha1: sha1,
            fullPromptSha1: stringSha1(fullPrompt)
        })
        if (cachedResponse) {
            return {
                type: 'askAboutStanProgram',
                response: cachedResponse.response,
                cumulativeTokensUsed: 0
            }
        }
    }

    if (request.cacheOnly) {
        return {
            type: 'askAboutStanProgram',
            response: '',
            cumulativeTokensUsed: 0
        }
    }

    if (!verifiedUserId) {
        throw Error('You must be logged in to ask about a stan program using ChatGPT')
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw Error('OPENAI_API_KEY environment variable not set')
    }

    const chatGPTUsageCollection = client.db('stan-playground').collection('chatGPTUsage')
    const chatGPTUsage = await chatGPTUsageCollection.findOne({
        userId: verifiedUserId
    })
    if (chatGPTUsage) {
        console.info(`ChatGPT tokens used for user ${verifiedUserId}: ${chatGPTUsage.tokensUsed}`)
        if (chatGPTUsage.tokensUsed >= 1000 * 200) {
            throw Error('You have used up your ChatGPT tokens')
        }
    }
    else {
        await chatGPTUsageCollection.insertOne({
            userId: verifiedUserId,
            tokensUsed: 0
        })
    }

    if (stanProgram.length > 10000) {
        throw Error('Stan program is too long')
    }

    if (request.prompt.length > 10000) {
        throw Error('Prompt is too long')
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo', // gpt-3.5-turbo or gpt-4 (expensive)
            messages: [
                {
                    role: 'user',
                    content: fullPrompt
                }
            ]
        })
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', options)
    const json = await resp.json()

    const response = json.choices[0].message.content

    const tokensUsed = json.usage.total_tokens

    const chatGPTUsage2 = await chatGPTUsageCollection.findOne({
        userId: verifiedUserId
    })
    if (!chatGPTUsage2) {
        throw Error('ChatGPT usage not found - unexpected')
    }
    const tokensUsed2 = chatGPTUsage2.tokensUsed + tokensUsed
    await chatGPTUsageCollection.updateOne({
        userId: verifiedUserId
    }, {
        $set: {
            tokensUsed: tokensUsed2
        }
    })

    if (request.useCache) {
        await askAboutStanProgramCacheCollection.insertOne({
            stanProgramSha1: sha1,
            fullPromptSha1: stringSha1(fullPrompt),
            prompt: request.prompt,
            response,
            timestamp: Date.now() / 1000,
            userId: o.verifiedUserId
        })
    }

    return {
        type: 'askAboutStanProgram',
        response,
        cumulativeTokensUsed: tokensUsed2
    }   
}

const stringSha1 = (s: string) => {
    const shasum = crypto.createHash('sha1')
    shasum.update(s)
    return shasum.digest('hex')
}

export default askAboutStanProgramHandler