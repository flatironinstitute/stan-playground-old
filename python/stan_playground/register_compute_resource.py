import os
import json
import time
from .crypto_keys import sign_message, generate_keypair


def register_compute_resource(*, dir: str):
    """Register a compute resource with the Stan Playground.

    Args:
        dir: The directory containing the compute resource.
    """
    config_fname = os.path.join(dir, '.stan-playground-compute-resource.json')
    if not os.path.exists(config_fname):
        public_key_hex, private_key_hex = generate_keypair()
        x = {
            'computeResourceId': public_key_hex,
            'privateKey': private_key_hex,
            'containerMethod': 'docker'
        }
        with open(config_fname, 'w') as f:
            json.dump(x, f, indent=4)
    
    with open(config_fname, 'r') as f:
        config = json.load(f)
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
