import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { GatepassService } from '../gatepass/gatepass.service';
import { environment } from 'src/environments/environment';
import { RequestType } from 'src/app/types/request.types';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  requestDetails: any;
  requestType: any;
  materialDetails: any;
  signatureBase64: string | undefined;
  sharepointSiteURL: string = environment.sharePointSiteUrl;

  columnsConfig: Record<RequestType, { header: string; key: string }[]> = {
    'Raw Material': [
      { header: 'SR. No', key: 'srNo' },
      { header: 'Métier', key: 'metier' },
      { header: 'RM Code', key: 'rmCode' },
      { header: 'Quantity in kg', key: 'quantity' },
      { header: 'Rate (INR /kg)', key: 'rate' },
      { header: 'No. of Packs', key: 'noOfPacks' },
      { header: 'Amount IN INR', key: 'amount' }
    ],
    'Packaging Material': [
      { header: 'SR. No', key: 'srNo' },
      { header: 'Description', key: 'description' },
      { header: 'Code', key: 'code' },
      { header: 'Quantity (Nos)', key: 'quantity' },
      { header: 'Contact Name', key: 'name' },
      { header: 'Rate', key: 'rate' },
      { header: 'No. of Packs', key: 'noOfPacks' },
      { header: 'Amount', key: 'amount' }
    ],
    'Packmat': [
      { header: 'SR. No', key: 'srNo' },
      { header: 'Description', key: 'description' },
      { header: 'Code', key: 'code' },
      { header: 'Receiver Name', key: 'name' },
      { header: 'Quantity (Nos)', key: 'quantity' },
      { header: 'Rate', key: 'rate' },
      { header: 'No. of Packs', key: 'noOfPacks' },
      { header: 'Amount', key: 'amount' }
    ],
    'Finished Goods': [
      { header: 'SR. No', key: 'srNo' },
      { header: 'Description', key: 'description' },
      { header: 'Code', key: 'code' },
      { header: 'Formulator Name', key: 'formulatorName' },
      { header: 'Quantity (Nos)', key: 'quantity' },
      { header: 'Rate', key: 'rate' },
      { header: 'No. of Packs', key: 'noOfPacks' },
      { header: 'Amount', key: 'amount' }
    ],
    'Bulk': [
      { header: 'SR. No', key: 'srNo' },
      { header: 'Description', key: 'description' },
      { header: 'Code', key: 'code' },
      { header: 'Formulator Name', key: 'formulatorName' },
      { header: 'Quantity (Kg)', key: 'quantity' },
      { header: 'Rate', key: 'rate' },
      { header: 'No. of Buckets', key: 'noOfBuckets' },
      { header: 'Amount', key: 'amount' }
    ]
  };

  constructor(private datePipe: DatePipe, private gatepassService: GatepassService) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }



  generatePDF(gatepassRequestID: number, materialDetails: any, requestType: any) {
    const signatureImageUrl = `${this.sharepointSiteURL}/GatePassDocuments/SupportingDocument/SignatureofDeepak.jpg`;
    this.getSignatureImageAsBase64(signatureImageUrl)
      .then(base64 => {
        this.signatureBase64 = base64;

        // Continue with your existing logic
        this.gatepassService.getGatepassRequestById(gatepassRequestID)
          .then(item => {
            this.requestDetails = {
              id: item.ID,
              customerName: item?.Title,
              baseAddress: item?.BaseAddress,
              requestType: item?.RequestType,
              customerAddress: item?.CustomerAddress,
              customerEmail: item?.CustomerEmail,
              poNo: item?.PONo,
              poDate: item?.PODate,
              invoiceNumber: item?.InvoiceNo,
              invoiceDate: item?.InvoiceDate,
              noOfPackages: item?.NoOfPackages,
              weight: item?.Weight,
              vatTin: item?.VatTin,
              cstTin: item?.CstTin,
              eccNo: item?.EccNo,
              gstin: item?.GSTIN_x002f_UniqueID,
              transporterName: item?.TransporterName,
              vehicalNo: item?.VehicalNo,
              lrNo: item?.LRNo,
              sealNo: item?.SealNo,
              note: item?.Note,
              valueOfProduct: item?.ValueOfProduct,
              taxes: item?.Taxes,
              subTotal: item?.SubTotal,
              otherCharges: item?.OtherCharges,
              netAmount: item?.NetAmount,
              requestStatus: item?.RequestStatus,
              createdBy: String(Object.values(item?.Author).at(1)),
              createdDate: item?.Created,
            }
            this.materialDetails = materialDetails;
            this.materialDetails?.sort((a: any, b: any) => a.srNo - b.srNo);
            console.log(" this.materialDetails", this.materialDetails);
            this.requestType = requestType;

            const res = pdfMake.createPdf(this.getDocumentDefinition());
            res?.getBuffer((buffer: any) => {
              this.gatepassService.uploadFileToDocumentLibrary(buffer, this.requestDetails?.invoiceNumber + "_" + this.formatDate(new Date()) + ".pdf", this.requestDetails?.id, '/GatePassDocuments/PDFFiles').then((res) => {
              })
                .catch((err) => {
                  console.error('Error:', err);
                })
            })
            // res?.download();
          })
          .catch(error => {
            console.error('Error:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching signature image:', error);
        // Optionally continue without signature
      });
  }

  generateGatepassPDF(request: any) {
    const res = pdfMake.createPdf(this.getGatepassPDFDocumentDefinition(request));
    res?.getBuffer((buffer: any) => {
      this.gatepassService.uploadFileToDocumentLibrary(buffer, request?.invoiceNumber + "_" + this.formatDate(new Date()) + "_gatepass.pdf", request?.id, '/GatePassDocuments/GatePassPDFFiles').then((res) => {
      })
        .catch((err) => {
          console.error('Error:', err);
        })
    })
  }
  getDocumentDefinition() {
    const itemsTable = this.buildTable(this.requestType, this.materialDetails);

    return {
      content: [
        // HEADER BOXED
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'INVOICE / DELIVERY CHALLAN',
                  style: 'header',
                  alignment: 'center',
                  margin: [0, 4, 0, 4],
                  border: [true, true, true, true],
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // ADDRESS TABLE
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'From:-',
                      bold: true,
                      fontSize: 12,
                    },
                    {
                      text: 'LOREAL INDIA PVT. LTD.',
                      fontSize: 10,
                    },
                    {
                      text: 'Gut no 426, Mahalunge Ingale, Chakan-Talegaon Road,',
                      fontSize: 10,
                    },
                    {
                      text: 'Chakan, Pune - 410 501, INDIA , Contact No: +91 213569197190',
                      fontSize: 10,
                    },
                  ],
                  border: [true, true, false, false],
                },
                {
                  stack: [
                    {
                      text: 'To:-',
                      bold: true,
                      fontSize: 12,
                    },
                    ...(
                      this.requestDetails?.customerAddress
                        ?.split(',')
                        ?.map((address: string) => ({
                          text: address.trim(), // optional: trim whitespace
                          fontSize: 10
                        })) || []
                    )
                  ],
                  border: [false, true, true, false],
                },
              ],
              [{ text: '', colSpan: 2, border: [true, false, true, true] }, ''],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // CUSTOMER INFO TABLE
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: "CUSTOMER'S NAME: " + this.requestDetails?.customerName,
                  fontSize: 10,
                  border: [true, true, false, true],
                },
                {
                  text: 'Kind Attn: ' + this.requestDetails?.customerName,
                  fontSize: 10,
                  border: [false, true, false, true],
                },
                {
                  text: 'Customer email: ' + (this.requestDetails?.customerEmail === null ? 'N/A' : this.requestDetails?.customerEmail),
                  fontSize: 10,
                  border: [false, true, true, true],
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // REQUEST TYPE/DETAILS TABLE
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                {
                  text: 'Request Type',
                  bold: true,
                  fontSize: 10,
                  //alignment: 'center',
                  border: [true, true, false, false],
                },
                {
                  text: this.requestDetails.requestType,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: 'INVOICE DATE',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: this.formatDate(this.requestDetails?.invoiceDate),
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, true, false],
                },

              ],
              [
                {
                  text: 'INVOICE No.',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [true, true, false, false],
                },
                {
                  text: this.requestDetails?.invoiceNumber,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: 'No. of Packages:',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: this.requestDetails?.noOfPackages,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, true, false],
                },

              ],
              [
                {
                  text: 'P.O. Date',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [true, true, false, false],
                },
                {
                  text: this.formatDate(this.requestDetails?.poDate) || 'N/A',
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: 'Weight',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: this.requestDetails?.weight,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, true, false],
                },
              ],
              [
                {
                  text: 'P.O. No.',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [true, true, false, false],
                },
                {
                  text: this.requestDetails?.poNo || 'N/A',
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: 'Total Amount',
                  bold: true,
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, false, false],
                },
                {
                  text: this.requestDetails?.netAmount?.toFixed(2) + ' (INR)',
                  fontSize: 10,
                  // alignment: 'center',
                  border: [false, true, true, false],
                },

              ],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // INVOICE NO.
        // {
        //   table: {
        //     widths: ['*'],
        //     body: [
        //       [
        //         {
        //           text: 'INVOICE No.' + this.requestDetails?.invoiceNumber,
        //           bold: true,
        //           fontSize: 10,
        //           alignment: 'center',
        //           margin: [0, 4, 0, 4],
        //           border: [true, true, true, true],
        //         },
        //       ],
        //     ],
        //   },
        //   layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        // },
        // OTHER DETAILS & TRANSPORTATION DETAILS
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Other details', bold: true, fontSize: 10 },
                    { text: 'VAT TIN - ' + this.requestDetails?.vatTin, fontSize: 10 },
                    { text: 'CST TIN - ' + this.requestDetails?.cstTin, fontSize: 10 },
                    { text: 'ECC No. - ' + this.requestDetails?.eccNo, fontSize: 10 },
                    { text: 'GSTIN - ' + this.requestDetails?.gstin, fontSize: 10 },
                  ],
                  border: [true, true, false, true],
                },
                {
                  stack: [
                    {
                      text: 'Transportation Details',
                      bold: true,
                      fontSize: 10,
                    },
                    { text: 'Name :- ' + this.requestDetails?.transporterName, fontSize: 10 },
                    { text: 'Vehicle No :- ' + (this.requestDetails?.vehicalNo || 'N/A'), fontSize: 10 },
                    { text: 'LR No :- ' + (this.requestDetails?.lrNo || 'N/A'), fontSize: 10 },
                    { text: 'Seal No :- ' + (this.requestDetails?.sealNo || 'N/A'), fontSize: 10 },
                  ],
                  border: [false, true, true, true],
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // NOTE
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: "Note:- " + this.requestDetails?.note,
                  margin: [0, 5, 0, 5],
                  fontSize: 9,
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
        },
        // ITEMS TABLE
        itemsTable
        ,
        // FOOTER (full width, boxed as marked)
        {
          table: {
            widths: [110, 190, 188], // <-- These 3 should sum to your items table width
            body: [
              [
                // Inside getDocumentDefinition()
                {
                  rowSpan: 1,
                  stack: [
                    {
                      text: this.requestDetails?.createdBy,
                      fontSize: 10,
                      margin: [0, 6, 0, 6],
                    },
                    { text: "For L'oreal India Pvt. Ltd.", fontSize: 10 },
                    { text: 'Authorised Signatory', bold: true, fontSize: 10 },
                    // Insert the signature image here
                    this.signatureBase64 ? {
                      image: this.signatureBase64,
                      width: 80,
                      margin: [0, 0, 0, 0],
                    } : {}
                  ],
                  border: [true, true, true, false],
                  alignment: 'left',
                  valign: 'top',
                },
                // {
                //   rowSpan: 1,
                //   stack: [
                //     {
                //       text: this.requestDetails?.createdBy,
                //       fontSize: 10,
                //       margin: [0, 10, 0, 10],
                //     },
                //     { text: "For L'oreal India Pvt. Ltd.", fontSize: 10 },
                //     { text: 'Authorised Signatory', bold: true, fontSize: 10 },
                //   ],
                //   border: [true, true, true, false],
                //   alignment: 'left',
                //   valign: 'top',
                // },
                {
                  stack: [
                    { text: 'Value of Product', fontSize: 10, margin: [0, 5, 0, 0] },
                    { text: 'Taxes', fontSize: 10, margin: [0, 5, 0, 0] },
                    { text: 'SUB TOTAL', fontSize: 10, margin: [0, 5, 0, 0] },
                    { text: 'Other Charges', fontSize: 10, margin: [0, 5, 0, 0] },
                    { text: 'Net Amount', bold: true, fontSize: 10, margin: [0, 5, 0, 0] },
                  ],
                  // border: [true, true, true, false],
                  border: [true, true, true, true],
                },
                {
                  stack: [
                    {
                      text: this.requestDetails?.valueOfProduct || 'N/A',
                      alignment: 'right',
                      fontSize: 10,
                      margin: [0, 5, 0, 0]
                    },
                    { text: this.requestDetails?.taxes || 'N/A', alignment: 'right', fontSize: 10, margin: [0, 5, 0, 0] },
                    { text: this.requestDetails?.subTotal?.toFixed(2), alignment: 'right', fontSize: 10, margin: [0, 5, 0, 0] },
                    {
                      text: this.requestDetails?.otherCharges || 'N/A',
                      alignment: 'right',
                      fontSize: 10,
                      margin: [0, 5, 0, 0]
                    },
                    {
                      text: this.requestDetails?.netAmount?.toFixed(2),
                      bold: true,
                      alignment: 'right',
                      fontSize: 10,
                      margin: [0, 5, 0, 0]
                    },
                  ],
                  // border: [true, true, true, false],
                  border: [true, true, true, true],
                },
              ],
              [
                {
                  text: '',
                  border: [true, false, true, true],
                },
                {
                  colSpan: 2,
                  text: 'Amount In Words (INR): ' + this.numberToWords(this.requestDetails?.netAmount),
                  bold: true,
                  alignment: 'center',
                  margin: [0, 10, 0, 10],
                  fontSize: 12,
                  border: [true, true, true, true],
                },
                '',
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          },
        },
      ],
      styles: {
        header: { fontSize: 14, bold: true, alignment: 'center' },
        tableHeader: {
          bold: true,
          fillColor: '#D4D9F0',
          color: 'black',
          fontSize: 10,
          alignment: 'center',
        },
      },
    };
  }

  getGatepassPDFDocumentDefinition(request: any) {
    return {
      content: [
        {
          text: 'L’OREAL India Pvt. Ltd. Pune DG',
          style: 'header',
          alignment: 'center',
        },
        {
          text: 'Gat No. 426, Mahalunge Ingale,\nChakan-Talegaon Road, Pune 410 501, India\nPh No - 02135666450 / 02135615580 / 583',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },

        // --- GATE PASS Section ---
        {
          text: 'GATE PASS',
          style: 'title',
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            {
              width: '*',
              text: 'Returnable & Non Returnable',
              style: 'normal',
              bold: true,
            },
            {
              width: 'auto',
              stack: [
                {
                  text: 'Gate Pass No.: ' + request?.invoiceNumber,
                  bold: true,
                  style: 'normal',
                  alignment: 'right',
                  margin: [0, 0, 0, 3],
                },
              ],
            },
          ],
          columnGap: 5,
          margin: [0, 0, 0, 2],
        },
        {
          columns: [
            {
              width: '90%',
              text: 'From Mr./Ms.: ' + request?.createdBy,
              style: 'normal',
              margin: [0, 0, 0, 3],
            },
            {
              width: 'auto',
              text: 'Dept.: DG',
              style: 'normal',
              alignment: 'right',
              margin: [0, 0, 0, 3],
            },
          ],
          columnGap: 5,
          margin: [0, 0, 0, 2],
        },
        {
          columns: [
            {
              width: '90%',
              text: 'To: ' + request?.customerAddress,
              style: 'normal',
              margin: [0, 0, 0, 3],
            },
            {
              width: 'auto',
              text: 'Dept.: R&I',
              style: 'normal',
              alignment: 'right',
              margin: [0, 0, 0, 3],
            },
          ],
          columnGap: 5,
          margin: [0, 0, 0, 2],
        },
        {
          text: 'Date of Return:',
          bold: true,
          margin: [0, 10, 0, 5],
          style: 'normal',
        },

        // --- Table Section ---
        {
          table: {
            headerRows: 1,
            widths: [40, '*', 120, '*'],
            body: [
              [
                { text: 'Sr. No.', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Qty.', style: 'tableHeader' },
                { text: 'Remarks', style: 'tableHeader' },
              ],
              [
                { text: '01', style: 'tableCell' },
                { text: request?.requestType, style: 'tableCell' },
                { text: request?.noOfPackages, style: 'tableCell' },
                { text: '', style: 'tableCell' },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i: any, node: any) {
              return 1;
            },
            vLineWidth: function (i: any, node: any) {
              return 1;
            },
            hLineColor: function (i: any, node: any) {
              return '#000000';
            },
            vLineColor: function (i: any, node: any) {
              return '#000000';
            },
            paddingLeft: function (i: any, node: any) {
              return 5;
            },
            paddingRight: function (i: any, node: any) {
              return 5;
            },
            paddingTop: function (i: any, node: any) {
              return 3;
            },
            paddingBottom: function (i: any, node: any) {
              return 3;
            },
          },
          margin: [0, 5, 0, 20],
        },

        {
          columns: [
            {
              text: 'Sender: ______________',
              width: '*',
              margin: [0, 10, 0, 0],
              style: 'normal',
            },
            {
              text: 'Security: ______________',
              width: '*',
              margin: [0, 10, 0, 0],
              style: 'normal',
            },
            {
              text: 'Bearer’s signature: ______________',
              width: '*',
              margin: [0, 10, 0, 0],
              style: 'normal',
            },
          ],
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true },
        subheader: { fontSize: 10 },
        title: { fontSize: 12, bold: true, decoration: 'underline' },
        tableHeader: {
          bold: true,
          fontSize: 10,
          fillColor: '#D4D9F0',
          alignment: 'center',
          color: '#000000',
        },
        tableCell: { fontSize: 10, alignment: 'center', color: '#000000' },
        normal: { fontSize: 11, color: '#000000' },
      },
    }
  }

  // private formatDate(date: Date): string {
  //   return this.datePipe.transform(date, "dd/MM/yyyy") || "";
  // }
  private formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd-MM-yyyy") || "";
  }

  numberToWords(num: number) {
    // Use only the integer part
    num = Math.floor(num);

    if (num === 0) return 'zero';

    const ones = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const tens = [
      '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    function convert_hundreds(n: number) {
      let str = '';
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + ' hundred';
        n = n % 100;
        if (n > 0) str += ' ';
      }
      if (n > 0 && n < 20) {
        str += ones[n];
      } else if (n >= 20) {
        str += tens[Math.floor(n / 10)];
        if (n % 10 > 0) str += ' ' + ones[n % 10];
      }
      return str;
    }

    let result = '';
    if (num >= 1000) {
      result += convert_hundreds(Math.floor(num / 1000)) + ' thousand';
      num = num % 1000;
      if (num > 0) result += ' ';
    }
    if (num > 0) {
      result += convert_hundreds(num);
    }
    return result.trim();
  }

  getSignatureImageAsBase64(imageUrl: string): Promise<string> {
    return fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

  buildTable(requestType: RequestType, materialDetails: any[]) {
    const columns = this.columnsConfig[requestType];
    if (!columns) throw new Error('Invalid request type');

    const widthsMap: Record<string, number[]> = {
      'Raw Material': [33, 70, 70, 70, 70, 69, 69],
      'Packaging Material': [24, 60, 60, 60, 60, 60, 60, 59],
      'Packmat': [24, 60, 60, 60, 60, 60, 60, 59],
      'Finished Goods': [24, 60, 60, 60, 60, 60, 60, 59],
      'Bulk': [24, 60, 60, 60, 60, 60, 60, 59]
    };

    const widths = widthsMap[requestType] || Array(columns.length).fill('*');

    const headerRow = columns.map(col => ({ text: col.header, style: 'tableHeader' }));

    const dataRows = materialDetails.map(item =>
      columns.map(col => {
        let value = item[col.key] ?? '';
        // Format 'amount' column to 2 decimals
        if (col.key === 'amount' && typeof value === 'number') {
          value = value.toFixed(2);
        }
        return { text: value, style: 'tableCell' };
      })
    );

    return {
      table: {
        widths: widths,
        body: [headerRow, ...dataRows]
      },
      layout: { hLineWidth: () => 1, vLineWidth: () => 1 }
    };
  }

  // buildTable(requestType: RequestType, materialDetails: any[]) {
  //   const columns = this.columnsConfig[requestType];
  //   if (!columns) throw new Error('Invalid request type');

  //   // Define custom widths for each request type
  //   // Example: Raw Material (7 columns)
  //   const widthsMap: Record<string, number[]> = {
  //     'Raw Material': [33, 70, 70, 70, 70, 69, 69], // adjust as needed
  //     'Packaging Material': [24, 60, 60, 60, 60, 60, 61, 61],// Sums to 488 // 8 columns, example
  //     'Packmat': [24, 60, 60, 60, 60, 60, 61, 61], // Sums to 488, // 8 columns, example
  //     'Finished Goods': [24, 60, 60, 60, 60, 60, 61, 61], // Sums to 488, // 8 columns, example
  //     'Bulk': [24, 60, 60, 60, 60, 60, 61, 61] // Sums to 488, // 8 columns, example
  //     // ...add for other types
  //   };

  //   const widths = widthsMap[requestType] || Array(columns.length).fill('*');

  //   const headerRow = columns.map(col => ({ text: col.header, style: 'tableHeader' }));
  //   const dataRows = materialDetails.map(item =>
  //     columns.map(col => ({ text: item[col.key] ?? '', style: 'tableCell' }))
  //   );

  //   return {
  //     table: {
  //       widths: widths,
  //       body: [headerRow, ...dataRows]
  //     },
  //     layout: { hLineWidth: () => 1, vLineWidth: () => 1 }
  //   };
  // }
}
