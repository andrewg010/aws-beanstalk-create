# AWS CI pipeline

I've divided the docs up into the two parts of the challenge.

First up you'll need to run an `npm install`

## Part 1 - Elastic Beanstalk Environment Creation

### Before running this script

You should make sure that the following IAM roles exist:

aws-elasticbeanstalk-ec2-role
aws-elasticbeanstalk-service-role

These roles are usually created by Elastic Beanstalk when the first environment is created.<br>
If these roles don't exist you can just create an Elastic Beanstalk environment via the AWS console. Use the sample application AWS provide and then remove it afterwards.

### Configuration

#### AWS Config

If you have set up AWS CLI config on your machine with access details and a default region then you should be good to go. If not you will need to create a `.env` file in the root of this project and define the following

`AWS_ACCESS_KEY_ID`<br>
`AWS_SECRET_ACCESS_KEY`<br>
`AWS_SESSION_TOKEN` (optional if using MFA)<br>
`AWS_REGION`<br>

eg 

`AWS_ACCESS_KEY_ID=e09u02diwedewkdowekc0`

You'll need IAM permissions for beanstalk and s3 for this.

#### Script config

To setup the remaining config to generate the beanstalk environment you can edit `config/beanstalk-config.json`

I've populated the config with suggested values

`appName` - The name to give the application in beanstalk<br>
`appDescription` - A brief description of the app<br>
`initialVersion` - The version number for the application<br>
`envName` - The name for the beanstalk environment to be created for this application<br>
`sourceBundle` - An object as follows:<br>
```
 {
    s3Bucket: name of bucket where the source bundle is located
    s3Key: name of source bundle object within bucket
 }
```
N.B - By default the sourceBundle object is not set, this will make the script create a new bucket and upload the source code from this repo (`test-app.zip`)

### Once you're ready and configuration is set

`npm start`

You should see a beanstalk environment created provided the config was all good!

You can check this by looking at the environments and applications in the Elastic Beanstalk console on AWS.

## Part 2 - Create the CodePipeline

### Generating buildspec.yml

#### Creating the buildspec

`npm run generateBuildSpec`

This will create a buildSpec.yml file based on the config set in `config/buildspec-config.json`

The output is `generated/buildspec.yml`

You'll need to add this to the test-app repo at the root and push it up to the BitBucket repo

#### Configuration

`config/buildspec-config.json` can be used to set the s3 bucket where the docs and `swagger.json` will be put after a successful build. You'll need to create this bucket ready for when the code pipeline runs.

### Setting up the pipeline

Here are the steps for setting up the pipeline via the AWS console:

#### Create the Pipeline

In the AWS Console open up CodePipeline from the services drop down.

Choose the orange 'Create Pipeline' button

##### Step 1. Pipeline settings

- Give the pipeline a name. I used `test-app` for mine
- Choose 'New Service Role' and give the new role a name if you want to change the automatic one
- Leave 'Allow AWS CodePipeline to create a service role so it can be used with this new pipeline' checked
- Leave the advanced settings untouched and move to the next step

##### Step 2. Source

- Choose Bitbucket
- Here you will need to choose a connection or establsh a new connection if one isn't already set up
- Once a connection is set up you can choose the repository name and branch name
- Leave the artifact output as default and move on.

##### Step 3. Build

- Skip this stage for now - we can add it after we have verified that the pipeline is working up to this point

##### Step 4. Deploy

- Choose deploy provider as elastic beanstalk 
- You should be able to choose the beanstalk app we created earlier with the beanstalk create script
- You can select the environment that you created with the beanstalk create script
- Move to the next step and review your pipeline
- At this point the code should be sourced and deploy from the repo all okay, you'll be able to watch it.

Now we can add the build stage once we are happy this works fine.

##### Step 5. Add a build stage

Choose CodeBuild from the AWS services menu

- Choose `Getting started`
- Click 'Create project'
- Give the build project a name - I used `test-app-build`
- Give the build project a description if desired
- Don't worry about Build Badge
- Choose bitbucket as the source and then hook up to a repository in your account
- Choose the bit bucket repo we used before
- Skip over Primary source webhook events
- For environment, use a Managed image and select Ubuntu > standard runtime
- Choose the highest image version (4 at the time I write this) and the box will say 'Always use the latest image version"
- Leave the environment as Linux
- For service role, create a new one but **remember the name** as we are going to edit this role shortly
- You should be able to leave everything else as it is and move on by clicking 'Create build project`

After creating the build project we need to make a small change to the IAM service role we just created.

- Open IAM and click on Roles
- Locate the role that was just created for CodeBuild, click on it.
- Click on add an inline policy.
- Use the JSON editor tab and replace the contents of the text fied with the contents of `required-files/build-iam-role.json`
- Click review and give the policy a name then save it.

Back to CodeBuild

- Click on 'Build Projects' and choose the build project we just created
- Use the orange 'Start build' button.
- On the next screen ignore the options and click 'Start build` again.
- Verify that the build has succeeded after a little while.

##### Step 6. Add build process to pipeline

- Select CodePipline > Pipelines and select the pipeline that was created
- Click 'Edit' and then 'Add stage' between the Source and Deploy stages
- Give the new stage a name, I used `Build`
- Click 'Add Action Group` within the build section.
- Give the action a name
- The provider will be AWS CodeBuild
- Select SourceArtifact as Input artifact
- Under Project name you should be able to find the name of the build project we just created
- Complete this section without changing anything else by clicking 'Done' 
- Save the pipeline - You'll be prompted if you are sure you want to do this.
- The pipeline should now have three steps but build will be grey.


##### Step 6. Push!

- Try pushing changes to the repo and watch the pipeline progress and deploy your changes to the beanstalk environment.
