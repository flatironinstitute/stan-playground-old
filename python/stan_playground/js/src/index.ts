import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ComputeResource from './ComputeResource'

const main = () => {
    yargs(hideBin(process.argv))
        .command('start', 'Start compute resource', (yargs) => {
            return yargs
        }, (argv) => {
            const dir: string = argv.dir as string
            start({ dir })
        })
        .option('dir', {
            type: 'string',
            description: 'Directory of compute resource'
        })
        .strictCommands()
        .demandCommand(1)
        .parse()
}

let computeResource: ComputeResource
function start({ dir }: { dir: string }) {
    computeResource = new ComputeResource({ dir })
    computeResource.start()
}

process.on('SIGINT', function () {
    if (computeResource) {
        console.info('Stopping compute resource.')
        computeResource.stop().then(() => {
            console.info('Exiting.')
            process.exit()
        })
    }
    setTimeout(() => {
        // exit no matter what after a few seconds
        process.exit()
    }, 6000)
})

main()