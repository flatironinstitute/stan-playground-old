import { GetDataBlobRequest, GetPendingScriptJobRequest, PlaygroundRequestPayload, PlaygroundResponse, SetAnalysisFileRequest, SetScriptJobPropertyRequest } from "./types/PlaygroundRequest"
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
            if (resp) {
                if (resp.type !== 'getPendingScriptJob') {
                    console.warn(resp)
                    throw Error('Unexpected response type. Expected getPendingScriptJob')
                }
                const {scriptJob} = resp
                if (scriptJob) {
                    try {
                        await this.handleScriptJob(scriptJob)
                    }
                    catch (err) {
                        console.warn(err)
                        console.info(`Unable to handle script job: ${err.message}`)
                    }
                }
            }

            await sleepSec(30)
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
        await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'status', 'running')
        const scriptFileName = scriptJob.scriptFileName
        const scriptFileContent = await this.loadDataBlob(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptContentSha1)
        const scriptJobDir = path.join(this.a.dir, 'scriptJobs', scriptJob.scriptJobId)
        fs.mkdirSync(scriptJobDir, {recursive: true})
        fs.writeFileSync(path.join(scriptJobDir, scriptFileName), scriptFileContent)
        let consoleOutput = ''
        let lastUpdateConsoleOutputTimestamp = Date.now()
        const updateConsoleOutput = async () => {
            lastUpdateConsoleOutputTimestamp = Date.now()
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'consoleOutput', consoleOutput)
        }
        try {
            await new Promise<void>((resolve, reject) => {
                let returned = false

                // const cmd = 'python'
                // const args = [scriptFileName]

                const cmd = 'singularity'
                const args = ['exec', '-C', '--pwd', '/working', '--bind', `.:/working`, 'docker://jjuanda/numpy-pandas', 'python', scriptFileName]

                const child = spawn(cmd, args, {
                    cwd: scriptJobDir
                })
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
                    reject(error)
                })
                child.on('close', (code: any) => {
                    if (returned) return
                    returned = true
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
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'error', err.message)
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'status', 'failed')
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
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'error', 'Too many output files.')
            await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'status', 'failed')
            return
        }
        for (const outputFileName of outputFileNames) {
            console.info('Uploading output file: ' + outputFileName)
            const content = fs.readFileSync(path.join(scriptJobDir, outputFileName), 'utf8')
            await this.setAnalysisFile(scriptJob.workspaceId, scriptJob.analysisId, outputFileName, content)
        }

        await this.setScriptJobProperty(scriptJob.workspaceId, scriptJob.analysisId, scriptJob.scriptJobId, 'status', 'completed')
    }
    async loadDataBlob(workspaceId: string, analysisId: string, sha1: string): Promise<string> {
        const req: GetDataBlobRequest = {
            type: 'getDataBlob',
            timestamp: Date.now() / 1000,
            workspaceId,
            analysisId,
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
    async setScriptJobProperty(workspaceId: string, analysisId: string, scriptJobId: string, property: string, value: any) {
        const req: SetScriptJobPropertyRequest = {
            type: 'setScriptJobProperty',
            timestamp: Date.now() / 1000,
            workspaceId,
            analysisId,
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
    async setAnalysisFile(workspaceId: string, analysisId: string, fileName: string, fileContent: string) {
        const req: SetAnalysisFileRequest = {
            type: 'setAnalysisFile',
            timestamp: Date.now() / 1000,
            workspaceId,
            analysisId,
            fileName,
            fileContent
        }
        const resp = await this.postPlaygroundRequest(req)
        if (!resp) {
            throw Error('Unable to set analysis file')
        }
        if (resp.type !== 'setAnalysisFile') {
            console.warn(resp)
            throw Error('Unexpected response type. Expected setAnalysisFile')
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