import { Browser } from 'puppeteer'
import { DateTime } from 'luxon'
import fs from 'node:fs/promises'
import path from 'node:path'
import { formatPrice } from '#helpers/payment'
import User from '#models/user'
import Invoice from '#models/invoice'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

type IGeneratePDF =
  | {
      type: 'transfer-invoice'
      user: User
      data: {
        invoice: Invoice
      }
    }
  | {
      type: 'table'
      payload: Record<string, any>[]
      title?: string
      selectedHeaders?: string[]
      formatHeaders?: Record<string, string>
    }

class PdfService {
  private browser: Browser | null = null
  private isInitializing = false
  private readonly TEMPLATE_DIR = app.makePath('resources/templates')
  private readonly DEFAULT_TEMPLATE = 'transfer-invoice.html'
  private readonly DEFAULT_STYLES = `
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .header h1 { color: #2c3e50; margin: 0; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .detail-group { margin-bottom: 15px; }
    .detail-label { font-weight: bold; color: #7f8c8d; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background-color: #3498db; color: white; padding: 12px; text-align: left; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    .totals { margin-top: 30px; float: right; width: 300px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .total-label { font-weight: bold; }
    .grand-total { font-size: 1.2em; border-top: 2px solid #3498db; padding-top: 10px; }
    .footer { margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 0.9em; }
  `

  public async initialize() {
    if (this.browser) return

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return
    }

    this.isInitializing = true
    try {
      const puppeteer = await import('puppeteer')
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process',
        ],
      })
    } catch (error) {
      logger.error('Failed to initialize Puppeteer', error)
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  public async generatePDF(params: IGeneratePDF){
    await this.initialize()
    if (!this.browser) throw new Error('Browser initialization failed')

    const page = await this.browser?.newPage()
    try {
      const html = await this.getHtmlContent(params)
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        timeout: 30000,
      })

      // return Buffer.from(pdf)
      return pdf
    } catch (error) {
      logger.error('PDF generation failed', { error, params })
      throw error
    } finally {
      await page.close().catch(() => {})
    }
  }

  private async getHtmlContent(params: IGeneratePDF): Promise<string> {
    switch (params.type) {
      case 'transfer-invoice':
        return this.generateTransferInvoiceHtml(params.user, params.data.invoice)
      case 'table':
        return this.generateTableHtml(params)
      default:
        throw new Error(`Unsupported PDF type: ${(params as any).type}`)
    }
  }

  private async generateTransferInvoiceHtml(user: User, invoice: Invoice): Promise<string> {
    const templatePath = path.join(this.TEMPLATE_DIR, this.DEFAULT_TEMPLATE)
    
    try {
      await this.ensureTemplateExists(templatePath)
      let html = await fs.readFile(templatePath, 'utf-8')
      
      const replacements = {
        ...this.getInvoiceReplacements(user, invoice),
        '{{styles}}': this.DEFAULT_STYLES,
      }
      
      return this.applyReplacements(html, replacements)
    } catch (error) {
      logger.error('Invoice HTML generation failed', { error, user, invoice })
      throw error
    }
  }

  private async ensureTemplateExists(templatePath: string): Promise<void> {
    try {
      await fs.access(templatePath)
    } catch {
      await fs.mkdir(this.TEMPLATE_DIR, { recursive: true })
      await fs.writeFile(templatePath, this.getDefaultInvoiceTemplate())
    }
  }

  private getDefaultInvoiceTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice {{invoiceNo}}</title>
  <style>{{styles}}</style>
</head>
<body>
  <div class="header">
    <h1>INVOICE #{{invoiceNo}}</h1>
    <p>Issued: {{invoiceDate}}</p>
  </div>

  <div class="details">
    <div>
      <div class="detail-group">
        <span class="detail-label">BILL TO:</span>
        <div>{{name}}</div>
        <div>{{phone}}</div>
      </div>
    </div>
    <div>
      <div class="detail-group">
        <span class="detail-label">DUE DATE:</span>
        <div>{{dueDate}}</div>
      </div>
      <div class="detail-group">
        <span class="detail-label">PAYMENT ID:</span>
        <div>{{paymentId}}</div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {{tableData}}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">Subtotal:</span>
      <span>{{totalNoVat}}</span>
    </div>
    <div class="total-row">
      <span class="total-label">VAT (7.5%):</span>
      <span>{{vat}}</span>
    </div>
    <div class="total-row grand-total">
      <span class="total-label">TOTAL:</span>
      <span>{{totalAmountDue}}</span>
    </div>
  </div>

  <div class="footer">
    <p>Please make payment to: {{bankName}} - {{accountName}} ({{accountNo}})</p>
    <p>Thank you for your business!</p>
  </div>
</body>
</html>`
  }

  private getInvoiceReplacements(user: User, invoice: Invoice): Record<string, string> {
    const formatDate = (date: DateTime | Date): string => {
      const dt = date instanceof DateTime ? date : DateTime.fromJSDate(date)
      return dt.setZone('Africa/Lagos').toFormat('dd MMM yyyy, hh:mm a')
    }

    return {
      '{{invoiceNo}}': invoice.id.toString().toUpperCase(),
      '{{name}}': user.fullName,
      '{{invoiceDate}}': formatDate(invoice.createdAt),
      '{{phone}}': user.phoneNumber || 'N/A',
      '{{paymentId}}': invoice.paymentId || 'N/A',
      '{{accountNo}}': invoice.accountNumber || 'N/A',
      '{{dueDate}}': formatDate(
        invoice.createdAt instanceof DateTime
          ? invoice.createdAt.plus({ days: 1 })
          : DateTime.fromJSDate(invoice.createdAt).plus({ days: 1 })
      ),
      '{{bankName}}': invoice.bankName || 'N/A',
      '{{accountName}}': invoice.accountName || 'N/A',
      '{{vat}}': formatPrice(invoice.vat),
      '{{totalAmountDue}}': formatPrice(invoice.amount),
      '{{totalNoVat}}': formatPrice(invoice.amount - invoice.vat),
      '{{tableData}}': this.generateInvoiceTableData(invoice),
    }
  }

  private generateInvoiceTableData(invoice: Invoice): string {
    if (!invoice.invoiceData?.tableData?.length) {
      return '<tr><td colspan="4" style="text-align: center;">No items</td></tr>'
    }

    return invoice.invoiceData.tableData
      .map(
        (row) => `
        <tr>
          <td>${row.description || ''}</td>
          <td>1</td>
          <td>${formatPrice(Number(row.unitPrice) || 0)}</td>
          <td>${formatPrice(Number(row.total) || 0)}</td>
        </tr>
      `
      )
      .join('')
  }

  private generateTableHtml(params: {
    payload: Record<string, any>[]
    title?: string
    selectedHeaders?: string[]
    formatHeaders?: Record<string, string>
  }): string {
    const headers = this.generateTableHeaders(params)
    const rows = this.generateTableRows(params)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h1 { color: #475467; font-size: 15pt; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { color: #5113A1; text-align: left; padding: 12px 16px; background-color: #f8f8f8; }
            td { color: #475467; text-align: left; padding: 12px 16px; border-bottom: 1px solid #F2F4F7; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${params.title ? `EXPORT RECORDS FOR ${params.title}` : 'EXPORT RECORDS'}</h1>
          <table>
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `
  }

  private generateTableHeaders(params: {
    selectedHeaders?: string[]
    formatHeaders?: Record<string, string>
  }): string {
    if (!params.selectedHeaders?.length) return ''

    return params.selectedHeaders
      .map((header) => {
        const displayName = params.formatHeaders?.[header] || header
        return `<th>${displayName}</th>`
      })
      .join('')
  }

  private generateTableRows(params: {
    payload: Record<string, any>[]
    selectedHeaders?: string[]
  }): string {
    if (!params.payload.length || !params.selectedHeaders?.length) {
      return '<tr><td colspan="100%">No data available</td></tr>'
    }

    return params.payload
      .map((data, index) => {
        const cells = params.selectedHeaders!.map((key) => {
          const value = key === 'S/N' ? index + 1 : data[key] ?? ''
          return `<td>${value}</td>`
        }).join('')

        return `<tr>${cells}</tr>`
      })
      .join('')
  }

  private applyReplacements(html: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce(
      (result, [key, value]) => result.replace(new RegExp(key, 'g'), value),
      html
    )
  }

  public async close() {
    if (this.browser) {
      try {
        await this.browser.close()
        this.browser = null
      } catch (error) {
        logger.error('Failed to close browser', error)
      }
    }
  }
}

export default new PdfService()