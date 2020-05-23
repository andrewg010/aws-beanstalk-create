import { ElasticBeanstalk } from 'aws-sdk'
import { appName, appDescription, initialVersion } from '../config/beanstalk-config.json'

const beanstalk = new ElasticBeanstalk()

export const createApplication = async (S3Bucket: string, S3Key: string) => {
  console.log('Creating application from config supplied...')

  await beanstalk.createApplication({
    ApplicationName: appName,
    Description: appDescription,
  }).promise()

  const params = {
    ApplicationName: appName, 
    AutoCreateApplication: true, 
    Description: appDescription, 
    Process: true, 
    SourceBundle: {
      S3Bucket, 
      S3Key
    }, 
    VersionLabel: initialVersion
  }

  try {
    beanstalk.createApplicationVersion(params).promise()
  } catch (err) {
    throw new Error('err')
  }

  console.log(`Elastic Beanstalk application ${appName} created!`)
}
