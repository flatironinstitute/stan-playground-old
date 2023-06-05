import fs from 'fs'
import path from 'path'
import postPlaygroundRequestFromComputeResource from "./postPlaygroundRequestFromComputeResource"
import PubsubClient from './PubsubClient'
import ScriptJobManager from "./ScriptJobManager"
import { GetPendingScriptJobsRequest, GetPubsubSubscriptionRequest } from "./types/PlaygroundRequest"
import yaml from 'js-yaml'

export type ComputeResourceConfig = {
    compute_resource_id: string
    compute_resource_private_key: string
    node_id: string
    node_name: string
    container_method: 'none' | 'docker' | 'singularity'
    max_num_concurrent_python_jobs: number
    max_num_concurrent_spa_jobs: number
    max_ram_per_python_job_gb: number
    max_ram_per_spa_job_gb: number
}

class ScriptJobExecutor {
    #stopped = false
    #scriptJobManager: ScriptJobManager
    #pubsubClient: PubsubClient | undefined
    #computeResourceConfig: ComputeResourceConfig
    constructor(private a: { dir: string }) {
        // read computeResourceId from .stan-playground-compute-resource-node.yaml in dir directory
        const configYaml = fs.readFileSync(path.join(a.dir, '.stan-playground-compute-resource-node.yaml'), 'utf8')
        this.#computeResourceConfig = yaml.load(configYaml) as ComputeResourceConfig
        const {container_method} = this.#computeResourceConfig
        if (!['none', 'docker', 'singularity'].includes(container_method)) {
            throw Error(`Invalid containerMethod: ${container_method}`)
        }
        if (container_method === 'none') {
            console.info('Container method is set to none. Script jobs will be executed on the host.')
            if (process.env.STAN_PLAYGROUND_DANGEROUS_CONTAINER_METHOD_NONE !== 'true') {
                throw Error('Container method is set to none. Set environment variable STAN_PLAYGROUND_DANGEROUS_CONTAINER_METHOD_NONE to true to allow this.')
            }
        }
        this.#scriptJobManager = new ScriptJobManager({
            dir: a.dir,
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
    }maxNumConcurrentSpaJobs
    async start() {
        console.info('Starting script job executor.')

        const reqPubsub: GetPubsubSubscriptionRequest = {
            type: 'getPubsubSubscription',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceConfig.compute_resource_id
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

        // periodically clean up old script jobs
        const doCleanup = async () => {
            if (this.#stopped) {
                return
            }
            await this.#scriptJobManager.cleanupOldJobs()
            setTimeout(doCleanup, 1000 * 60 * 10)
        }
        doCleanup()

        // periodically check for new script jobs (and report that this node is active)
        const doCheckForNewScriptJobs = async () => {
            if (this.#stopped) {
                return
            }
            await this._processPendingScriptJobs()
            setTimeout(doCheckForNewScriptJobs, 1000 * 60 * 5)
        }
        doCheckForNewScriptJobs()
    }
    private async _processPendingScriptJobs() {
        if (this.#stopped) {
            return
        }
        const req: GetPendingScriptJobsRequest = {
            type: 'getPendingScriptJobs',
            timestamp: Date.now() / 1000,
            computeResourceId: this.#computeResourceConfig.compute_resource_id,
            nodeId: this.#computeResourceConfig.node_id,
            nodeName: this.#computeResourceConfig.node_name
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
            computeResourceId: this.#computeResourceConfig.compute_resource_id,
            computeResourcePrivateKey: this.#computeResourceConfig.compute_resource_private_key
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