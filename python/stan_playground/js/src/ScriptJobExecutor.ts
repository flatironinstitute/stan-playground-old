import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import PubsubClient from './PubsubClient'
import ScriptJobManager from "./ScriptJobManager"
import { GetPendingScriptJobsRequest, GetPubsubSubscriptionRequest } from "./types/PlaygroundRequest"

class ScriptJobExecutor {
    #stopped = false
    #computeResourceId: string
    #privateKey: string
    #scriptJobManager: ScriptJobManager
    #pubsubClient: PubsubClient | undefined
    constructor(private a: { dir: string }) {
        // read computeResourceId from .stan-playground-compute-resource.json in dir directory
        const configJson = fs.readFileSync(path.join(a.dir, '.stan-playground-compute-resource.json'), 'utf8')
        const config = JSON.parse(configJson)
        this.#computeResourceId = config.computeResourceId
        this.#privateKey = config.privateKey
        this.#scriptJobManager = new ScriptJobManager({
            dir: a.dir,
            computeResourceId: this.#computeResourceId,
            privateKey: this.#privateKey,
            onScriptJobCompletedOrFailed: () => {
                this._processPendingScriptJobs()
            }
        })
    }
    async start() {
        console.info('Starting script job executor.')

        const reqPubsub: GetPubsubSubscriptionRequest = {
            type: 'getPubsubSubscription',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceId
        }
        const respPubsub = await this._postPlaygroundRequest(reqPubsub)
        if (respPubsub.type !== 'getPubsubSubscription') {
            console.warn(respPubsub)
            throw Error('Unexpected response type. Expected getPubsubSubscription')
        }

        const onPubsubMessage = (message: any) => {
            if (message.type === 'newPendingScriptJob') {
                this._processPendingScriptJobs()
            }
        }
        this.#pubsubClient = new PubsubClient(respPubsub.subscriptionInfo, onPubsubMessage)
        this._processPendingScriptJobs()
    }
    private async _processPendingScriptJobs() {
        if (this.#stopped) {
            return
        }
        const req: GetPendingScriptJobsRequest = {
            type: 'getPendingScriptJobs',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceId
        }
        const resp = await this._postPlaygroundRequest(req)
        if (resp) {
            if (resp.type !== 'getPendingScriptJobs') {
                console.warn(resp)
                throw Error('Unexpected response type. Expected getPendingScriptJobs')
            }
            const {scriptJobs} = resp
            if (scriptJobs.length > 0) {
                const scriptJob = scriptJobs[0]
                try {
                    await this.#scriptJobManager.initiateJob(scriptJob)
                }
                catch (err) {
                    console.warn(err)
                    console.info(`Unable to handle script job: ${err.message}`)
                }
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
        if (this.#pubsubClient) {
            this.#pubsubClient.unsubscribe()
        }
    }
}

export default ScriptJobExecutor