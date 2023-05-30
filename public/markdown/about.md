# Stan Playground

Stan Playground is a web-based application designed for creating, running, and sharing Stan analyses conveniently through a browser interface. You can create workspaces, initiate projects within those workspaces, and then manage files and jobs within those projects.

## Project file types

Stan Playground supports various types of files within projects:

* **.stan**: Stan programs
* **.json**: Datasets used in analyses
* **.py**: Python scripts used for generating datasets and running post-processing
* **.spa**: Stan Playground Analysis files. These YAML files consist of a .stan file name, a .json file name, and options for running the Stan analysis.
* **.spa.out**: These files are generated once a .spa job completes. It contains the output of the Stan sampler for the analysis.

## Workspace and project management

Stan Playground supports the creation of workspaces, projects within those workspaces, and files and jobs within those projects. Each workspace is owned by a user authenticated using GitHub OAuth. Workspace owners and admin users can control whether the workspace is publicly readable, whether it is listed or unlisted, and which users have permission to read and write to the workspace. Workspace admins can also associate compute resources with the workspace, which are used to run Python scripts and Stan analyses.

## Running Stan analyses

A Stan analysis comprises a .stan file, a .json dataset file, and options for running the Stan sampler. These are specified using a .spa file within a workspace. Once a .spa file is created, it can be run using the "Run" button. This will create a job that will run the analysis on the compute resource associated with the workspace. Once the job completes, the results are available in the .spa.out file. Output can then be visualized using MCMC Monitor.

## Compute resources

Each workspace has an associated compute resource which is used to run Python scripts and Stan analyses. By default, our cloud resource is used, although this is limited in terms of CPU and memory, and can only run a limited number of jobs concurrently, which is shared across all users. You can also associate your own compute resource with your workspace. This can be backed by a local or a remote machine Linux machine.



