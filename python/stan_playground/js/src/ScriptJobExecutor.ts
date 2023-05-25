import { GetDataBlobRequest, GetPendingScriptJobRequest, GetProjectFileRequest, PlaygroundRequestPayload, PlaygroundResponse, SetProjectFileRequest, SetScriptJobPropertyRequest } from "./types/PlaygroundRequest"
import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import { SPScriptJob } from "./types/stan-playground-types"
import {spawn} from 'child_process'
import yaml from 'js-yaml'
import ChainFile from "./ChainFile"

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
        console.info('Starting script job executor.')
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

        if (scriptFileName.endsWith('.spa')) {
            const spaFileName = scriptFileName
            const spaFileContent = scriptFileContent
            const spa = yaml.load(spaFileContent)
            const stanProgramFileName = spa['stan']
            const dataFileName = spa['data']
            if ((!stanProgramFileName) || (!dataFileName)) {
                throw new Error('Invalid SPA file')
            }
            const stanProgramFileContent = await this.loadFileContent(scriptJob.workspaceId, scriptJob.projectId, stanProgramFileName)
            const dataFileContent = await this.loadFileContent(scriptJob.workspaceId, scriptJob.projectId, dataFileName)
            fs.writeFileSync(path.join(scriptJobDir, stanProgramFileName), stanProgramFileContent)
            fs.writeFileSync(path.join(scriptJobDir, dataFileName), dataFileContent)
            const runPyContent = createRunPyContent(spaFileName)
            fs.writeFileSync(path.join(scriptJobDir, 'run.py'), runPyContent)
        }

        const uploadSpaOutput = async () => {
            const spaOutput = await loadSpaOutput(`${scriptJobDir}/output`)
            console.info(`Uploading SPA output to ${scriptFileName}.out (${scriptJob.scriptJobId})`)
            await this.setProjectFile(scriptJob.workspaceId, scriptJob.projectId, `${scriptFileName}.out`, JSON.stringify(spaOutput))
        }

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
                let args = [
                    'exec',
                    '-C', // do not mount home directory, tmp directory, etc
                    '--pwd', '/working',
                    '--bind', `.:/working`
                ]
                let timeoutSec = 10
                if (scriptFileName.endsWith('.py')) {
                    args = [...args, ...[
                        // '--cpus', '1', // limit CPU - having trouble with this - cgroups issue
                        '--memory', '1G', // limit memory
                        'docker://jstoropoli/cmdstanpy',
                        'python3', scriptFileName
                    ]]
                }
                else if (scriptFileName.endsWith('.spa')) {
                    args = [...args, ...[
                        // '--cpus', '2', // limit CPU - having trouble with this - cgroups issue
                        '--memory', '4G', // limit memory
                        'docker://jstoropoli/cmdstanpy',
                        'python3', 'run.py'
                    ]]
                    timeoutSec = 60 * 10
                }
                else {
                    throw Error(`Unsupported script file name: ${scriptFileName}`)
                }

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

        if (scriptFileName.endsWith('.spa')) {
            await uploadSpaOutput()
        }
        else {
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

const createRunPyContent = (spaFileName: string): string => {
    return `import yaml
import time
import json
from cmdstanpy import CmdStanModel

with open('${spaFileName}', 'r') as f:
    spa = yaml.safe_load(f)

stan_file_name = spa['stan']
data_file_name = spa['data']
options = spa['options']

model = CmdStanModel(stan_file=stan_file_name)
with open(data_file_name, 'r') as f:
    data = json.load(f)

iter_sampling = options.get('iter_sampling', None)
iter_warmup = options.get('iter_warmup', None)
chains = options.get('chains', 4)
save_warmup = options.get('save_warmup', True)
seed = options.get('seed', None)

if iter_sampling is None:
    raise Exception('iter_sampling not specified in options')
if iter_warmup is None:
    raise Exception('iter_warmup not specified in options')

print('Starting sampling')
print(f'{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())}')
print(f'====================')
timer = time.time()
fit = model.sample(
    data=data,
    output_dir='output',
    iter_sampling=iter_sampling,
    iter_warmup=iter_warmup,
    chains=chains,
    seed=seed,
    save_warmup=save_warmup,
    show_console=True
)
print(f'====================')
elapsed = time.time() - timer
print(f'Elapsed time: {elapsed} seconds')
print('Finished sampling')
`
}

type SpaOutput = {
    chains: {
        chainId: string,
        rawHeader: string,
        rawFooter: string,
        numWarmupDraws?: number,
        sequences: {
            [key: string]: number[]
        }
    }[]
}

const loadSpaOutput = async (outputDir: string): Promise<SpaOutput> => {
    // find the .csv files in the output directory
    const csvFiles: string[] = []
    const files = fs.readdirSync(outputDir)
    for (const file of files) {
        if (file.endsWith('.csv')) {
            csvFiles.push(file)
        }
    }

    const ret: SpaOutput = {
        chains: []
    }

    for (const csvFile of csvFiles) {
        const chainId = csvFile.replace('.csv', '')
        const cf = new ChainFile(path.join(outputDir, csvFile), chainId)
        await cf.update()
        const sequences: {[key: string]: number[]} = {}
        for (const vname of cf.variableNames) {
            sequences[vname] = cf.sequenceData(vname, 0)
        }
        ret.chains.push({
            chainId,
            rawHeader: cf.rawHeader || '',
            rawFooter: cf.rawFooter,
            numWarmupDraws: cf.excludedInitialIterationCount,
            sequences
        })
    }

    return ret
}

const sleepSec = async (sec: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

export default ScriptJobExecutor