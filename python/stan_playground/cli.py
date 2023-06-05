import click
import stan_playground
from .init_compute_resource_node import init_compute_resource_node as init_compute_resource_node_function
from .start_compute_resource_node import start_compute_resource_node as start_compute_resource_node_function


@click.group(help="stan-playground command line interface")
def main():
    pass

@click.command(help='Initialize a compute resource node in the current directory')
def init_compute_resource_node():
    init_compute_resource_node_function(dir='.')

@click.command(help="Start the compute resource node in the current directory")
def start_compute_resource_node():
    start_compute_resource_node_function(dir='.')

@click.command(help='Initialize the singularity container')
def initialize_singularity_container():
    stan_playground.initialize_singularity_container()

@click.command(help='Initialize the docker container')
def initialize_docker_container():
    stan_playground.initialize_docker_container()

main.add_command(init_compute_resource_node)
main.add_command(start_compute_resource_node)
main.add_command(initialize_singularity_container)
main.add_command(initialize_docker_container)