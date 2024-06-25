import VerifyENotification from '#mails/verify_e_notification'
import mail from '@adonisjs/mail/services/main'
// import { Queue, Worker } from 'bullmq'

// const emailQueue = new Queue('email')

class Email {
  // queueEmail() {
  //   mail.setMessenger((mailer) => {
  //     return {
  //       async queue(mailMessage, config) {
  //         await emailQueue.add('send-email', {
  //           mailMessage,
  //           config,
  //           mailerName: mailer.name,
  //         })
  //       },
  //     }
  //   })
  // }

  // sendEmailFromQueue() {
  //   new Worker('email', async (job) => {
  //     if (job.name !== 'send-email') return

  //     const { mailMessage, config, mailerName } = job.data

  //     console.log('mailMessage', job)
  //     return

  //     await mail.use(mailerName).send(mailMessage, config)
  //   })
  // }

  async sendEmail(email: string, userId: string, tokenId: string) {
    return await mail.sendLater(new VerifyENotification(email, userId, tokenId))
  }
}

export default new Email()
