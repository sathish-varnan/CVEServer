import { Request, Response } from 'express';
import axios from 'axios';

export default async function (request: Request, response: Response): Promise<void> {
    try {
        const invoiceNumber = request.query.invoiceNumber as string || '';
        const pdfUrl = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/InvoiceAdobeSet(Belnr='${invoiceNumber}')/$value`;

        // Make a GET request to fetch the PDF
        const axiosResponse = await axios.get(pdfUrl, {
            responseType: 'stream',
            auth: {
                username: process.env.SAP_USERNAME!,
                password: process.env.SAP_PASSWORD!
            }
        });

        // Set the appropriate headers for PDF response
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename="invoice_${invoiceNumber}.pdf"`);

        // Pipe the PDF data to the response
        axiosResponse.data.pipe(response);

    } catch (error) {
        console.error('Error fetching PDF:', error);
        response.status(500).send('Error fetching PDF');
    }
}