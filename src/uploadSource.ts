import { S3 } from 'aws-sdk'
import { appName } from '../config/beanstalk-config.json'
import { uuid } from 'uuidv4'
import { readFileSync } from 'fs'
const s3 = new S3()

export const createBucketWithSource = async () => {
  const bucket = await createNewBucket()
  return putSourceInBucket(bucket)
}

const createNewBucket = async () => {
  console.log('No config detected for source code in an S3 bucket.')
  console.log('Creating one and uploading code. Hope you have the permission!')
  console.log('Creating bucket for source code...')
  const Bucket = `${appName}-source-${uuid()}`
    try {
    await s3.createBucket({
      Bucket
    }).promise()
  } catch (err) {
    throw new Error(err)
  }
  console.log(`Created bucket ${Bucket}`)
  return Bucket
}

const putSourceInBucket = async (Bucket: string) => {
  console.log(`Uploading source code to ${Bucket}`)
  const Body = readFileSync('../test-app.zip')
  const Key = 'test-app.zip'
  try {
    await s3.putObject({
      Bucket,
      Key,
      Body
    }).promise()
  } catch (err) {
    throw new Error(err)
  }
  console.log('Upload done!')
  return { Bucket, Key }
}
