import os
import json
import time
import yaml
from .crypto_keys import sign_message, generate_keypair


default_config = {
    'containerMethod': 'docker',
    'maxNumConcurrentPythonJobs': 5,
    'maxNumConcurrentSpaJobs': 2,
    'maxRAMPerPythonJobGB': 4,
    'maxRAMPerSpaJobGB': 1
}

def register_compute_resource(*, dir: str):
    """Register a compute resource with the Stan Playground.

    Args:
        dir: The directory containing the compute resource.
    """
    config_fname = os.path.join(dir, '.stan-playground-compute-resource.yaml')

    if not os.path.exists(config_fname):
        public_key_hex, private_key_hex = generate_keypair()
        x = {
            'computeResourceId': public_key_hex,
            'privateKey': private_key_hex
        }
        for k in default_config:
            x[k] = default_config[k]
        with open(config_fname, 'w') as f:
            yaml.dump(x, f)
    
    with open(config_fname, 'r') as f:
        config = yaml.safe_load(f)
    something_changed = False
    for k in default_config:
        if k not in config:
            config[k] = default_config[k]
            something_changed = True
    if something_changed:
        with open(config_fname, 'w') as f:
            yaml.dump(config, f)
    compute_resource_id = config['computeResourceId']
    private_key = config['privateKey']

    timestamp = int(time.time())
    msg = {
        'timestamp': timestamp
    }
    signature = sign_message(msg, compute_resource_id, private_key)
    resource_code = f'{timestamp}-{signature}'

    url = f'https://stan-playground.vercel.app/register-compute-resource/{compute_resource_id}/{resource_code}'
    print('')
    print('Please visit the following URL in your browser to register your compute resource:')
    print('')
    print(url)
    print('')
