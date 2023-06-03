import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import PubsubClient from './PubsubClient'
import ScriptJobManager from "./ScriptJobManager"
import { GetPendingScriptJobsRequest, GetPubsubSubscriptionRequest } from "./types/PlaygroundRequest"
import yaml from 'js-yaml'

export type ComputeResourceConfig = {
    computeResourceId: string
    privateKey: string
    containerMethod: 'none' | 'docker' | 'singularity'
    maxNumConcurrentPythonJobs: number
    maxNumConcurrentSpaJobs: number
    maxRAMPerPythonJobGB: number
    maxRAMPerSpaJobGB: number
}

class ScriptJobExecutor {
    #stopped = false
    #scriptJobManager: ScriptJobManager
    #pubsubClient: PubsubClient | undefined
    #computeResourceConfig: ComputeResourceConfig
    constructor(private a: { dir: string }) {
        // read computeResourceId from .stan-playground-compute-resource.yaml in dir directory
        const configYaml = fs.readFileSync(path.join(a.dir, '.stan-playground-compute-resource.yaml'), 'utf8')
        this.#computeResourceConfig = yaml.load(configYaml) as ComputeResourceConfig
        const {containerMethod} = this.#computeResourceConfig
        if (!['none', 'docker', 'singularity'].includes(containerMethod)) {
            throw Error(`Invalid containerMethod: ${containerMethod}`)
        }
        if (containerMethod === 'none') {
            console.info('Container method is set to none. Script jobs will be executed on the host.')
            if (process.env.STAN_PLAYGROUND_DANGEROUS_CONTAINER_METHOD_NONE !== 'true') {
                throw Error('Container method is set to none. Set environment variable STAN_PLAYGROUND_DANGEROUS_CONTAINER_METHOD_NONE to true to allow this.')
            }
        }
        this.#scriptJobManager = new ScriptJobManager({
            dir: a.dir,
            computeResourceId: this.#computeResourceConfig.computeResourceId,
            privateKey: this.#computeResourceConfig.privateKey,
            computeResourceConfig: this.#computeResourceConfig,
            onScriptJobCompletedOrFailed: (job) => {
                if (job.status === 'completed') {
                    console.info(`Script job completed`)
                }
                else if (job.status === 'failed') {
                    console.info(`Script job failed`)
                }
                else {
                    console.warn(`Unexpected script job status: ${job.status}`)
                }
                this._processPendingScriptJobs()
            }
        })
    }
    async start() {
        console.info('Starting script job executor.')

        const reqPubsub: GetPubsubSubscriptionRequest = {
            type: 'getPubsubSubscription',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceConfig.computeResourceId
        }
        const respPubsub = await this._postPlaygroundRequest(reqPubsub)
        if (respPubsub.type !== 'getPubsubSubscription') {
            console.warn(respPubsub)
            throw Error('Unexpected response type. Expected getPubsubSubscription')
        }

        const onPubsubMessage = (message: any) => {
            console.info(`Received pubsub message: ${message.type}`)
            if (message.type === 'newPendingScriptJob') {
                this._processPendingScriptJobs()
            }
        }
        this.#pubsubClient = new PubsubClient(respPubsub.subscriptionInfo, onPubsubMessage)
        this._processPendingScriptJobs()

        // periodically clean up old script jobs
        const doCleanup = async () => {
            if (this.#stopped) {
                return
            }
            await this.#scriptJobManager.cleanupOldJobs()
            setTimeout(doCleanup, 1000 * 60 * 10)
        }
        doCleanup()
    }
    private async _processPendingScriptJobs() {
        if (this.#stopped) {
            return
        }
        const req: GetPendingScriptJobsRequest = {
            type: 'getPendingScriptJobs',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceConfig.computeResourceId
        }
        const resp = await this._postPlaygroundRequest(req)
        if (resp) {
            if (resp.type !== 'getPendingScriptJobs') {
                console.warn(resp)
                throw Error('Unexpected response type. Expected getPendingScriptJobs')
            }
            const {scriptJobs} = resp
            if (scriptJobs.length > 0) {
                console.info(`Found ${scriptJobs.length} pending script jobs.`)
                const scriptJob = scriptJobs[0]
                try {
                    const initiated = await this.#scriptJobManager.initiateJob(scriptJob)
                    if (initiated) {
                        console.info(`Initiated script job: ${scriptJob.scriptJobId}`)
                    }
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
            computeResourceId: this.#computeResourceConfig.computeResourceId,
            privateKey: this.#computeResourceConfig.privateKey
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