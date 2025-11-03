import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import { RequestType, RequestItem } from 'src/app/types/request.types';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {


  // downloadTemplate(requestType: RequestType): void {
  //   const headers = this.getTemplateHeaders(requestType);
  //   const sampleData = this.getSampleData(requestType);

  //   const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  //   const fileName = `${requestType.replace(/\s+/g, '_')}_Template.xlsx`;
  //   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  //   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //   saveAs(blob, fileName);
  // }
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;

  constructor(private http: HttpClient) { }


  fetchRawMaterialExcelFile(): Promise<{ codes: string[], priceMap: Map<string, number> }> {
    return this.http.get(this.sharepointSiteUrl + "/GatePassDocuments/Templates/RawMaterialGatepass.xlsx", { responseType: 'arraybuffer' }).toPromise().then(data => {
      console.log("data", data);
      const workbook = XLSX.read(data, { type: 'array' });
      // Get the second sheet
      const sheetNames = workbook.SheetNames;
      console.log("sheetNames", sheetNames);
      const sheet = workbook.Sheets[sheetNames[1]]; // Index 1 for second sheet
      console.log("sheet", sheet);
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log("json", json);

      // Assuming first row is headers: [Item Code, Price in INR]
      const codes: string[] = [];
      const priceMap = new Map<string, number>();

      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (Array.isArray(row) && row[0] && row[1]) {
          const code = String(row[0]).trim();
          const price = parseFloat(String(row[1]).replace(/,/g, ''));
          if (!priceMap.has(code)) {         // Only add if code not already present
            codes.push(code);                // Add to codes array
            priceMap.set(code, price);       // Add to price map
          }
          // If you want to keep the last occurrence instead, remove the if condition
        }
      }
      console.log("codes", codes);
      console.log("priceMap", priceMap);
      return { codes, priceMap };
    });
  }

  parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Remove header row and empty rows
          const dataRows = jsonData.slice(1).filter((row: any) =>
            row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
          );

          resolve(dataRows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  convertExcelDataToItems(data: any[], requestType: RequestType): RequestItem[] {
    return data.map((row, index) => {
      const srNo = index + 1;

      switch (requestType) {
        case 'Raw Material':
          return {
            srNo,
            metier: row[1] || '',
            rmCode: row[2] || '',
            quantity: parseFloat(row[3]) || 0,
            quantityUnit: 'kg' as const,
            rate: parseFloat(row[4]) || 0,
            rateUnit: 'INR/kg' as const,
            noOfPacks: parseInt(row[5]) || 0,
            amount: (parseFloat(row[3]) || 0) * (parseFloat(row[4]) || 0)
          };
        case 'Packaging Material':
        case 'Packmat':
          return {
            srNo,
            description: row[1] || '',
            code: row[2] || '',
            name: row[3] || '',
            // contact: row[4] || '',
            quantity: parseInt(row[4]) || 0,
            quantityUnit: 'nos' as const,
            noOfPacks: parseInt(row[5]) || 0,
            rate: parseFloat(row[6]) || 0,
            rateUnit: 'INR' as const,
            amount: (parseInt(row[4]) || 0) * (parseFloat(row[6]) || 0)
          };
        case 'Finished Goods':
          return {
            srNo,
            description: row[1] || '',
            code: row[2] || '',
            name: row[3] || '',
            // formulator: row[4] || '',
            quantity: parseInt(row[4]) || 0,
            quantityUnit: 'nos' as const,
            noOfPacks: parseInt(row[5]) || 0,
            rate: parseFloat(row[6]) || 0,
            rateUnit: 'INR' as const,
            amount: (parseInt(row[4]) || 0) * (parseFloat(row[6]) || 0)
          };
        case 'Bulk':
          return {
            srNo,
            description: row[1] || '',
            code: row[2] || '',
            name: row[3] || '',
            //formulator: row[4] || '',
            quantity: parseFloat(row[4]) || 0,
            quantityUnit: 'kg' as const,
            noOfBuckets: parseInt(row[5]) || 0,
            rate: parseFloat(row[6]) || 0,
            rateUnit: 'INR' as const,
            amount: (parseFloat(row[4]) || 0) * (parseFloat(row[6]) || 0)
          };
        default:
          return {
            srNo,
            quantity: 0,
            rate: 0,
            amount: 0,
            quantityUnit: 'nos' as const,
            rateUnit: 'INR' as const
          } as RequestItem;
      }
    });
  }

  private getTemplateHeaders(requestType: RequestType): string[] {
    switch (requestType) {
      case 'Raw Material':
        return ['Sr. No', 'Métier', 'RM Code', 'Quantity (kg)', 'Rate (INR/kg)', 'No. of Packs', 'Amount (INR)'];
      case 'Packaging Material':
      case 'Packmat':
        return ['Sr. No', 'Description', 'Code', 'Name', 'Contact', 'Quantity (Nos)', 'No. of Packs', 'Rate per Unit (INR)', 'Amount (INR)'];
      case 'Finished Goods':
        return ['Sr. No', 'Description', 'Code', 'Name', 'Formulator', 'Quantity (Nos)', 'No. of Packs', 'Rate per Unit (INR)', 'Amount (INR)'];
      case 'Bulk':
        return ['Sr. No', 'Description', 'Code', 'Name', 'Formulator', 'Quantity (kg)', 'No. of Buckets', 'Rate per Unit (INR)', 'Amount (INR)'];
      default:
        return [];
    }
  }

  private getSampleData(requestType: RequestType): any[][] {
    switch (requestType) {
      case 'Raw Material':
        return [
          [1, 'Sample Métier', 'RM001', 100, 50, 5, '=D2*E2'],
          [2, 'Sample Métier 2', 'RM002', 200, 75, 10, '=D3*E3']
        ];
      case 'Packaging Material':
      case 'Packmat':
        return [
          [1, 'Sample Package', 'PKG001', 'Sample Name', '+91-9876543210', 100, 5, 10, '=F2*H2'],
          [2, 'Sample Package 2', 'PKG002', 'Sample Name 2', '+91-9876543211', 200, 10, 15, '=F3*H3']
        ];
      case 'Finished Goods':
        return [
          [1, 'Sample Product', 'FG001', 'Product Name', 'Formulator A', 50, 2, 100, '=F2*H2'],
          [2, 'Sample Product 2', 'FG002', 'Product Name 2', 'Formulator B', 75, 3, 150, '=F3*H3']
        ];
      case 'Bulk':
        return [
          [1, 'Bulk Item', 'BLK001', 'Bulk Name', 'Formulator X', 500, 10, 25, '=F2*H2'],
          [2, 'Bulk Item 2', 'BLK002', 'Bulk Name 2', 'Formulator Y', 750, 15, 30, '=F3*H3']
        ];
      default:
        return [];
    }
  }


}
