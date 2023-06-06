# Overview of Stan Playground

Stan Playground is a browser-based application designed to simplify the creation, execution, and sharing of Stan analyses. It enables users to establish workspaces, create projects within those workspaces, and efficiently manage project files and tasks.

## Supported File Types

Stan Playground accommodates multiple file types within projects:

* **.stan**: Stan programs or models
* **.json**: Datasets for analyses
* **.py**: Python scripts for data generation and post-analysis processing
* **.spa**: Stan Playground Analysis files. These YAML files reference a .stan file and a .json file, along with settings for performing the Stan analysis.
* **.spa.out**: Generated once an analysis job concludes, these files contain the output of the executed Stan analysis.
* **.md**: Markdown files for descriptions.

## Workspace and Project Administration

Stan Playground allows the creation of workspaces, with each workspace owned by a GitHub OAuth-authenticated user. Within these workspaces, users can create projects, and manage the associated files and tasks. Workspace owners and admin users can control access permissions, such as public visibility and read/write permissions for different users. Additionally, workspace admins can assign compute resources to the workspace to run Python scripts and Stan analyses.

## Execution of Stan Analyses

A Stan analysis involves a .stan file, a .json dataset file, and certain execution parameters for the Stan sampler, all specified using a .spa (Stan Playground analysis) file. With the "Run" button, the system launches a job to perform the analysis using the workspace's allocated compute resources. Upon completion, results are stored in a corresponding .spa.out file and can be visualized using [MCMC Monitor](https://github.com/flatironinstitute/mcmc-monitor/blob/main/README.md).

## Compute Resources

Every workspace comes equipped with a dedicated compute resource for executing Python scripts and Stan analyses. The default setting uses a cloud resource with specific limitations on CPU, memory, and number of concurrent jobs, shared among all users. Alternatively, you can [host your own compute resource](https://github.com/scratchrealm/stan-playground/blob/main/doc/host_compute_resource.md) on a local or remote machine and link this to your workspaces.

## Feedback

Please provide feedback during the [beta testing](https://github.com/scratchrealm/stan-playground/blob/main/doc/beta_testing.md) phase. You can submit issues or suggestions to [this GitHub repository](https://github.com/scratchrealm/stan-playground). You can also [reach out to the author](https://www.simonsfoundation.org/people/jeremy-magland/).