import 'dotenv/config'
import { sourceBundle, appName, initialVersion, envName } from '../config/beanstalk-config.json'
import { createBucketWithSource } from './uploadSource'
import { createApplication } from './createApplication'
import { createEnvironment } from './createEnvironment'
import { waitForApp } from './checkAppVersionExists'

(async () => {
  if (!sourceBundle || !appName || !initialVersion || !envName ) {
    throw new Error('Config is missing information, please fill in config/beanstalk-config.json')
  }
  const sourceCodeBucketConfigExists = () => sourceBundle.s3Bucket && sourceBundle.s3Key
  const { Bucket, Key } = sourceCodeBucketConfigExists() 
    ? { Bucket: sourceBundle.s3Bucket, Key: sourceBundle.s3Key } 
    : await createBucketWithSource()
  await createApplication(Bucket, Key)
  await waitForApp(appName, [initialVersion])
  await createEnvironment()
})()
