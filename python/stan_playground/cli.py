import click
import stan_playground
from .start_compute_resource import start as start_compute_resource_function


@click.group(help="stan-playground command line interface")
def main():
    pass

@click.command(help='Register a compute resource in the current directory')
def register_compute_resource():
    print(stan_playground.register_compute_resource(dir='.'))

@click.command(help="Start the compute resource in the specified directory")
@click.option('--dir', required=True, help='The directory of the compute resource.')
def start_compute_resource(dir: str):
    start_compute_resource_function(dir)

@click.command(help='Initialize the singularity container')
def initialize_singularity_container():
    stan_playground.initialize_singularity_container()

main.add_command(register_compute_resource)
main.add_command(start_compute_resource)
main.add_command(initialize_singularity_container)