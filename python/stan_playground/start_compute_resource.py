import sys
from pathlib import Path
import subprocess
from threading import Thread
import signal
from .register_compute_resource import default_config


this_directory = Path(__file__).parent

class Daemon:
    def __init__(self, *, dir: str):
        self.dir = dir
        self.process = None
        self.output_thread = None

    def _forward_output(self):
        while True:
            line = self.process.stdout.readline()
            sys.stdout.write(line)
            sys.stdout.flush()
            return_code = self.process.poll()
            if return_code is not None:
                print(f'Process exited with return code {return_code}')
                break

    def _handle_exit(self, signum, frame):
        print('Exiting')
        self.stop()
        sys.exit(0)

    def start(self):
        cmd = ["node", f'{this_directory}/js/dist/index.js', "start", "--dir", self.dir]
        self.process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1,
            universal_newlines=True,
        )

        self.output_thread = Thread(target=self._forward_output, daemon=True) # daemon=True means that the thread will not block the program from exiting
        self.output_thread.start()

        signal.signal(signal.SIGINT, self._handle_exit)
        signal.signal(signal.SIGTERM, self._handle_exit)

    def stop(self):
        if self.process:
            self.process.terminate()
            self.process.wait()


def start_compute_resource(dir: str):

    # migrate from .json to .yaml
    import os
    import yaml
    import json
    config_fname = os.path.join(dir, '.stan-playground-compute-resource.yaml')
    config_fname_old = os.path.join(dir, '.stan-playground-compute-resource.json')
    if not os.path.exists(config_fname) and os.path.exists(config_fname_old):
        print('Migrating from .json to .yaml')
        with open(config_fname_old, 'r') as f:
            config_old = json.load(f)
            with open(config_fname, 'w') as f:
                yaml.dump(config_old, f)
        os.rename(config_fname_old, config_fname_old + '.to-delete')
    
    # set default config fields
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

    daemon = Daemon(dir=dir)
    daemon.start()

    # Don't exit until the output thread exits
    daemon.output_thread.join()