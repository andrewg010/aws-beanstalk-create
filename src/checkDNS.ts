import { ElasticBeanstalk } from 'aws-sdk'
const beanstalk = new ElasticBeanstalk()

export const isDNSAvailable = async (cname: string) => {
  const params = {
    CNAMEPrefix: cname
  } 
  const result = await beanstalk.checkDNSAvailability(params).promise()
  return result.Available
}
