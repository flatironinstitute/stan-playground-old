import subprocess


def initialize_docker_container():
    """Initialize the docker container"""
    cmd = 'docker run --rm jstoropoli/cmdstanpy -c "python3 -c \\"import cmdstanpy; print(cmdstanpy.__version__)\\""'
    version = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
    print(f'cmdstanpy version: {version}')