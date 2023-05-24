import click
import stan_playground
from .start import start as start_function


@click.group(help="stan-playground command line interface")
def cli():
    pass

@click.command(help='Register a compute resource in the current directory')
def register_compute_resource():
    print(stan_playground.register_compute_resource(dir='.'))

@click.command()
@click.option('--dir', required=True, help='The directory to share.')
def start(dir: str):
    start_function(dir)

cli.add_command(register_compute_resource)
cli.add_command(start)