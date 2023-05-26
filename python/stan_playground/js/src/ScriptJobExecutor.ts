import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import ScriptJobManager from "./ScriptJobManager"
import { GetPendingScriptJobsRequest } from "./types/PlaygroundRequest"

class ScriptJobExecutor {
    #stopped = false
    #computeResourceId: string
    #privateKey: string
    #scriptJobManager: ScriptJobManager
    constructor(private a: { dir: string }) {
        // read computeResourceId from .stan-playground-compute-resource.json in dir directory
        const configJson = fs.readFileSync(path.join(a.dir, '.stan-playground-compute-resource.json'), 'utf8')
        const config = JSON.parse(configJson)
        this.#computeResourceId = config.computeResourceId
        this.#privateKey = config.privateKey
        this.#scriptJobManager = new ScriptJobManager({
            dir: a.dir,
            computeResourceId: this.#computeResourceId,
            privateKey: this.#privateKey
        })
    }
    async start() {
        console.info('Starting script job executor.')
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.#stopped) {
                break
            }
            const req: GetPendingScriptJobsRequest = {
                type: 'getPendingScriptJobs',
                timestamp: Date.now() / 1000,
                computeResourceId: this.#computeResourceId
            }
            const resp = await this._postPlaygroundRequest(req)
            let handledAJob = false
            if (resp) {
                if (resp.type !== 'getPendingScriptJobs') {
                    console.warn(resp)
                    throw Error('Unexpected response type. Expected getPendingScriptJobs')
                }
                const {scriptJobs} = resp
                if (scriptJobs.length > 0) {
                    const scriptJob = scriptJobs[0]
                    try {
                        const initiated = await this.#scriptJobManager.initiateJob(scriptJob)
                        if (initiated) {
                            handledAJob = true
                        }
                    }
                    catch (err) {
                        console.warn(err)
                        console.info(`Unable to handle script job: ${err.message}`)
                    }
                }
            }

            if (handledAJob) {
                await sleepSec(10)
            }
            else {
                await sleepSec(30)
            }
        }
    }
    private async _postPlaygroundRequest(req: any): Promise<any> {
        return await postPlaygroundRequestFromComputeResource(req, {
            computeResourceId: this.#computeResourceId,
            privateKey: this.#privateKey
        })
    }
    
    async stop() {
        this.#stopped = true
        this.#scriptJobManager.stop()
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