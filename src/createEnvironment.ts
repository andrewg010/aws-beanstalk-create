import { ElasticBeanstalk } from 'aws-sdk'
import { appName, envName, initialVersion } from '../config/beanstalk-config.json'
import { uuid } from 'uuidv4'
import { isDNSAvailable } from './checkDNS'

const beanstalk = new ElasticBeanstalk()

export const createEnvironment = async () => {
  console.log('Setting up app environment...')

  const cname = `${appName}-${uuid()}`
  if (!await isDNSAvailable(cname)) throw new Error('Oops, looks like the url for the environment was not available 🤔')

  const params = {
    ApplicationName: appName, 
    CNAMEPrefix: cname, 
    EnvironmentName: envName, 
    SolutionStackName: "64bit Amazon Linux 2 v5.0.1 running Node.js 12", 
    VersionLabel: initialVersion,
    OptionSettings: [
      {
        Namespace: 'aws:autoscaling:launchconfiguration',
        OptionName: 'IamInstanceProfile',
        Value: 'aws-elasticbeanstalk-ec2-role'
      }
    ]
  }

  try {
    await beanstalk.createEnvironment(params).promise()
  } catch (err) {
    throw new Error(err)
  }

  console.log('All done!')
}
