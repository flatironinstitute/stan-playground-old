import subprocess


def init_singularity_container():
    """Initialize the singularity container"""
    cmd = 'singularity exec docker://jstoropoli/cmdstanpy python3 -c "import cmdstanpy; print(cmdstanpy.__version__)"'
    version = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
    print(f'cmdstanpy version: {version}')