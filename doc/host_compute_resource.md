# Hosting a compute resource

Every workspace comes equipped with a dedicated compute resource for executing Python scripts and Stan analyses. The default setting uses a cloud resource with specific limitations on CPU, memory, and concurrent jobs, shared among all users. Alternatively, users can link their own compute resources, local or remote Linux machines, to their workspace.

Prerequisites

* Python >= 3.9
* NodeJS >= v18
* Docker or (Singularity >= 3.11)

Clone this repo, then

```bash
# install
cd stan-playground/python
pip install -e .
```

```bash
# Register (one time)
export COMPUTE_RESOURCE_DIR=/some/path
cd $COMPUTE_RESOURCE_DIR
stan-playground register-compute-resource
# Open the provided link in a browser and log in using GitHub
```

Edit `$COMPUTE_RESOURCE_DIR/.stan-playground-compute-resource.yaml` and set `containerMethod` to `docker` or `singularity`. By default it is set to `docker`.

```bash
# If using docker, initialize the docker container
stan-playground initialize-docker-container

# --- or ---

# If using singularity, initialize the singularity container
stan-playground initialize-singularity-container
```

```bash
# Start the compute resource
cd $COMPUTE_RESOURCE_DIR
stan-playground start-compute-resource --dir .
# Leave this open in a terminal
```

In the web interface, go to settings for your workspace, and select your compute resource. New analyses within your workspace will now use your compute resource for Python and Stan jobs.