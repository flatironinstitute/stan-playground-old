# Overview of Stan Playground

Stan Playground is a browser-based application designed to simplify the creation, execution, and sharing of Stan analyses. It enables users to establish workspaces, create projects within those workspaces, and efficiently manage project files and tasks.

## Supported File Types

Stan Playground accommodates multiple file types within projects:

* **.stan**: Stan programs or models
* **.json**: Datasets for analyses
* **.py**: Python scripts for data generation and post-analysis processing
* **.spa**: Stan Playground Analysis files. These YAML files reference a .stan file and a .json file, along with settings for performing the Stan analysis.
* **.spa.out**: Generated once an .spa task concludes, these files contain the output of the executed Stan analysis.
* **.mf**: Markdown files for descriptions.

## Workspace and Project Administration

Stan Playground allows the establishment of workspaces, with each workspace owned by a GitHub OAuth-authenticated user. Within these workspaces, users can initiate projects, and handle files and tasks related to them. Workspace owners and admin users can control access permissions, such as public visibility and read/write permissions for different users. Additionally, workspace admins can assign compute resources to the workspace to run Python scripts and Stan analyses.

## Execution of Stan Analyses

A Stan analysis involves a .stan file, a .json dataset file, and certain execution parameters for the Stan sampler, all specified using a .spa file. With the "Run" button, a created .spa file launches a job to perform the analysis using the workspace's allocated compute resources. Upon completion, results are stored in a corresponding .spa.out file and can be visualized using MCMC Monitor.

## Compute Resources

Every workspace comes equipped with a dedicated compute resource for executing Python scripts and Stan analyses. The default setting uses a cloud resource with specific limitations on CPU, memory, and concurrent jobs, shared among all users. Alternatively, users can link their own compute resources, local or remote Linux machines, to their workspace.