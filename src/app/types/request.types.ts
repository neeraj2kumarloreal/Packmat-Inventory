export interface BaseRequest {
    id: string;
    requestType: 'Raw Material' | 'Packaging Material' | 'Packmat' | 'Finished Goods' | 'Bulk';
    status: 'Draft' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Sent Back for Changes';
    createdBy: string;
    createdDate: Date;
    address?: string;
    customerName?: string;
    customerEmail?: string;
    items: RequestItem[];
    totalAmount: number;
    noOfPackages: string;
    weight: string;
  }
  
  export interface RequestItem {
    srNo: number;
    description?: string;
    metier?: string;
    rmCode?: string;
    code?: string;
    name?: string;
    contact?: string;
    formulator?: string;
    quantity: number;
    quantityUnit: 'kg' | 'nos' | 'buckets';
    noOfPacks?: number;
    noOfBuckets?: number;
    rate: number;
    rateUnit: 'INR/kg' | 'INR';
    amount: number;
  }
  
  export interface RawMaterialItem extends RequestItem {
    metier: string;
    rmCode: string;
    quantity: number;
    quantityUnit: 'kg';
    rate: number;
    rateUnit: 'INR/kg';
    noOfPacks: number;
  }
  
  export interface PackagingMaterialItem extends RequestItem {
    description: string;
    code: string;
    name: string;
    contact: string;
    quantity: number;
    quantityUnit: 'nos';
    noOfPacks: number;
    rate: number;
    rateUnit: 'INR';
  }
  
  export interface FinishedGoodsItem extends RequestItem {
    description: string;
    code: string;
    name: string;
    formulator: string;
    quantity: number;
    quantityUnit: 'nos';
    noOfPacks: number;
    rate: number;
    rateUnit: 'INR';
  }
  
  export interface BulkItem extends RequestItem {
    description: string;
    code: string;
    name: string;
    formulator: string;
    quantity: number;
    quantityUnit: 'kg';
    noOfBuckets: number;
    rate: number;
    rateUnit: 'INR';
  }
  
  export type RequestType = 'Raw Material' | 'Packaging Material' | 'Packmat' | 'Finished Goods' | 'Bulk';
  export type RequestStatus = 'Draft' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Sent Back for Changes';


  