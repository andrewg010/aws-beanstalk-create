import { ElasticBeanstalk } from 'aws-sdk'

const beanstalk = new ElasticBeanstalk()

export const waitForApp = (ApplicationName: string, VersionLabels: string[]) => {
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      if (await appVersionExists(ApplicationName, VersionLabels)) {
        resolve()
        clearInterval(interval)
      }
    }, 500)
  })
}

export const appVersionExists = async (ApplicationName: string, VersionLabels: string[]) => {
  const response = await beanstalk.describeApplicationVersions({
    ApplicationName,
    VersionLabels
  }).promise()
  return response.ApplicationVersions ? response.ApplicationVersions.length > 0 : false 
}
