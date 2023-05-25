import { GetDataBlobRequest, GetPendingScriptJobRequest, GetProjectFileRequest, PlaygroundRequestPayload, PlaygroundResponse, SetProjectFileRequest, SetScriptJobPropertyRequest } from "./types/PlaygroundRequest"
import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import { SPScriptJob } from "./types/stan-playground-types"
import {spawn} from 'child_process'

class ScriptJobExecutor {
    #stopped = false
    #computeResourceId: string
    #privateKey: string
    constructor(private a: { dir: string }) {
        // read computeResourceId from .stan-playground-compute-resource.json in dir directory
        const configJson = fs.readFileSync(path.join(a.dir, '.stan-playground-compute-resource.json'), 'utf8')
        const config = JSON.parse(configJson)
        this.#computeResourceId = config.computeResourceId
        this.#privateKey = config.privateKey
    }
    async start() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.#stopped) {
                break
            }
            const req: GetPendingScriptJobRequest = {
                type: 'getPendingScriptJob',
                timestamp: Date.now() / 1000,
                computeResourceId: this.#computeResourceId
            }
            const resp = await this.postPlaygroundRequest(req)
            let handledAJob = false
            if (resp) {
                if (resp.type !== 'getPendingScriptJob') {
                    console.warn(resp)
                    throw Error('Unexpected response type. Expected getPendingScriptJob')
                }
                const {scriptJob} = resp
                if (scriptJob) {
                    try {
                        await this.handleScriptJob(scriptJob)
                        handledAJob = true
                    }
                    catch (err) {
                        console.warn(err)
                        console.info(`Unable to handle script job: ${err.message}`)
                    }
                }
            }

            if (!handledAJob) {
                await sleepSec(30)
            }
            else {
                await sleepSec(1)
            }
        }
    }
    async postPlaygroundRequest(req: PlaygroundRequestPayload): Promise<PlaygroundResponse | undefined> {
        return await postPlaygroundRequestFromComputeResource(req, {
            computeResourceId: this.#computeResourceId,
            privateKey: this.#privateKey
        })
    }
    async handleScriptJob(scriptJob: SPScriptJob) {
        console.info(`Handling script job: ${scriptJob.scriptJobId} - ${scriptJob.scriptFileName}`)
        await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'status', 'running')
        const scriptFileName = scriptJob.scriptFileName
        const scriptFileContent = await this.loadFileContent(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptFileName)
        const scriptJobDir = path.join(this.a.dir, 'scriptJobs', scriptJob.scriptJobId)
        fs.mkdirSync(scriptJobDir, {recursive: true})
        fs.writeFileSync(path.join(scriptJobDir, scriptFileName), scriptFileContent)
        let consoleOutput = ''
        let lastUpdateConsoleOutputTimestamp = Date.now()
        const updateConsoleOutput = async () => {
            lastUpdateConsoleOutputTimestamp = Date.now()
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'consoleOutput', consoleOutput)
        }
        try {
            await new Promise<void>((resolve, reject) => {
                let returned = false

                // const cmd = 'python'
                // const args = [scriptFileName]

                const cmd = 'singularity'
                const args = [
                    'exec',
                    '-C', // do not mount home directory, tmp directory, etc
                    '--pwd', '/working',
                    '--bind', `.:/working`,
                    // '--cpus', '1', // limit to 1 CPU - having trouble with this - cgroups issue
                    '--memory', '1G', // limit to 1 GB memory
                    'docker://jjuanda/numpy-pandas',
                    'python3', scriptFileName
                ]
                const timeoutSec = 10

                const child = spawn(cmd, args, {
                    cwd: scriptJobDir
                })

                const timeoutId = setTimeout(() => {
                    if (returned) return
                    console.info(`Killing script job: ${scriptJob.scriptJobId} - ${scriptJob.scriptFileName} due to timeout`)
                    returned = true
                    child.kill()
                    reject(Error('Timeout'))
                }, timeoutSec * 1000)

                child.stdout.on('data', (data: any) => {
                    console.log(`stdout: ${data}`)
                    consoleOutput += data
                    if (Date.now() - lastUpdateConsoleOutputTimestamp > 10000) {
                        updateConsoleOutput()
                    }
                })
                child.stderr.on('data', (data: any) => {
                    console.error(`stderr: ${data}`)
                    consoleOutput += data
                    if (Date.now() - lastUpdateConsoleOutputTimestamp > 10000) {
                        updateConsoleOutput()
                    }
                })
                child.on('error', (error: any) => {
                    if (returned) return
                    returned = true
                    clearTimeout(timeoutId)
                    reject(error)
                })
                child.on('close', (code: any) => {
                    if (returned) return
                    returned = true
                    clearTimeout(timeoutId)
                    if (code !== 0) {
                        reject(Error(`Process exited with code ${code}`))
                    }
                    else {
                        resolve()
                    }
                })
            })
        }
        catch (err) {
            await updateConsoleOutput()
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'error', err.message)
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'status', 'failed')
            return
        }
        await updateConsoleOutput()

        const outputFileNames: string[] = []
        const files = fs.readdirSync(scriptJobDir)
        for (const file of files) {
            if (file !== scriptFileName) {
                // check whether it is a file
                const stat = fs.statSync(path.join(scriptJobDir, file))
                if (stat.isFile()) {
                    outputFileNames.push(file)
                }
            }
        }
        const maxOutputFiles = 5
        if (outputFileNames.length > maxOutputFiles) {
            console.info('Too many output files.')
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'error', 'Too many output files.')
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'status', 'failed')
            return
        }
        for (const outputFileName of outputFileNames) {
            console.info('Uploading output file: ' + outputFileName)
            const content = fs.readFileSync(path.join(scriptJobDir, outputFileName), 'utf8')
            await this.setProjectFile(scriptJob.workspaceId, scriptJob.projectId, outputFileName, content)
        }

        await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.projectId, scriptJob.scriptJobId, 'status', 'completed')
    }
    async loadFileContent(workspaceId: string, projectId: string, fileName: string): Promise<string> {
        const req: GetProjectFileRequest = {
            type: 'getProjectFile',
            timestamp: Date.now() / 1000,
            projectId,
            fileName
        }
        const resp = await this.postPlaygroundRequest(req)
        if (!resp) {
            throw Error('Unable to get project file')
        }
        if (resp.type !== 'getProjectFile') {
            console.warn(resp)
            throw Error('Unexpected response type. Expected getProjectFile')
        }
        return await this.loadDataBlob(workspaceId, projectId, resp.projectFile.contentSha1)
    }
    async loadDataBlob(workspaceId: string, projectId: string, sha1: string): Promise<string> {
        const req: GetDataBlobRequest = {
            type: 'getDataBlob',
            timestamp: Date.now() / 1000,
            workspaceId,
            projectId,
            sha1
        }
        const resp = await this.postPlaygroundRequest(req)
        if (!resp) {
            throw Error('Unable to get data blob')
        }
        if (resp.type !== 'getDataBlob') {
            console.warn(resp)
            throw Error('Unexpected response type. Expected getDataBlob')
        }
        return resp.content
    }
    async setScriptJobProperty(workspaceId: string, projectId: string, scriptJobId: string, property: string, value: any) {
        const req: SetScriptJobPropertyRequest = {
            type: 'setScriptJobProperty',
            timestamp: Date.now() / 1000,
            workspaceId,
            projectId,
            scriptJobId,
            property,
            value
        }
        const resp = await this.postPlaygroundRequest(req)
        if (!resp) {
            throw Error('Unable to set script job property')
        }
        if (resp.type !== 'setScriptJobProperty') {
            console.warn(resp)
            throw Error('Unexpected response type. Expected setScriptJobProperty')
        }
    }
    async setProjectFile(workspaceId: string, projectId: string, fileName: string, fileContent: string) {
        const req: SetProjectFileRequest = {
            type: 'setProjectFile',
            timestamp: Date.now() / 1000,
            workspaceId,
            projectId,
            fileName,
            fileContent
        }
        const resp = await this.postPlaygroundRequest(req)
        if (!resp) {
            throw Error('Unable to set project file')
        }
        if (resp.type !== 'setProjectFile') {
            console.warn(resp)
            throw Error('Unexpected response type. Expected setProjectFile')
        }
    }
    async stop() {
        this.#stopped = true
    }
}

const sleepSec = async (sec: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

export default ScriptJobExecutor