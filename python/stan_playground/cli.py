import click
import stan_playground


@click.group(help="stan-playground command line interface")
def cli():
    pass

@click.command(help='Register a compute resource in the current directory')
def register_compute_resource():
    print(stan_playground.register_compute_resource(dir='.'))

cli.add_command(register_compute_resource)