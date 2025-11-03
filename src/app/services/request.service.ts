import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseRequest, RequestItem, RequestType } from '../types/request.types';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestsSubject = new BehaviorSubject<BaseRequest[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  private mockData: BaseRequest[] = [
    {
      id: '1',
      requestType: 'Raw Material',
      status: 'Pending',
      createdBy: 'John Doe',
      createdDate: new Date('2024-01-15'),
      customerName: 'John Doe',
      noOfPackages:'',
      weight:'',
      address: '123 Industrial Area, Mumbai',
      items: [
        {
          srNo: 1,
          metier: 'Chemical',
          rmCode: 'RM001',
          quantity: 100,
          quantityUnit: 'kg',
          rate: 50,
          rateUnit: 'INR/kg',
          noOfPacks: 5,
          amount: 5000
        }
      ],
      totalAmount: 5000
    },
    {
      id: '2',
      requestType: 'Packaging Material',
      status: 'Under Review',
      createdBy: 'Jane Smith',
      noOfPackages:'',
      weight:'',
      createdDate: new Date('2024-01-16'),
      address: '456 Manufacturing Hub, Delhi',
      items: [
        {
          srNo: 1,
          description: 'Plastic Bottles',
          code: 'PKG001',
          name: 'PET Bottles 500ml',
          contact: '+91-9876543210',
          quantity: 1000,
          quantityUnit: 'nos',
          noOfPacks: 20,
          rate: 5,
          rateUnit: 'INR',
          amount: 5000
        }
      ],
      totalAmount: 5000
    }
  ];

  constructor() {
    this.requestsSubject.next(this.mockData);
  }

  getRequests(): Observable<BaseRequest[]> {
    return this.requests$;
  }

  getMyRequests(userName: string): Observable<BaseRequest[]> {
    return new BehaviorSubject(
      this.mockData.filter(req => req.createdBy === userName)
    ).asObservable();
  }

  getPendingRequests(): Observable<BaseRequest[]> {
    return new BehaviorSubject(
      this.mockData.filter(req => req.status === 'Pending')
    ).asObservable();
  }

  getRequestsForApproval(): Observable<BaseRequest[]> {
    return new BehaviorSubject(
      this.mockData.filter(req => req.status === 'Under Review')
    ).asObservable();
  }

  createRequest(request: Omit<BaseRequest, 'id' | 'createdDate'>): void {
    const newRequest: BaseRequest = {
      ...request,
      id: this.generateId(),
      createdDate: new Date()
    };
    
    this.mockData.push(newRequest);
    this.requestsSubject.next([...this.mockData]);
  }

  updateRequestStatus(id: string, status: BaseRequest['status']): void {
    const index = this.mockData.findIndex(req => req.id === id);
    if (index !== -1) {
      this.mockData[index].status = status;
      this.requestsSubject.next([...this.mockData]);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getTableColumns(requestType: RequestType): string[] {
    switch (requestType) {
      case 'Raw Material':
        return ['Sr. No', 'Métier', 'RM Code', 'Quantity (kg)', 'Rate (INR/kg)', 'No. of Packs', 'Amount (INR)'];
      case 'Packaging Material':
      case 'Packmat':
        return ['Sr. No', 'Description', 'Code', 'Name', 'Quantity (Nos)', 'No. of Packs', 'Rate per Unit (INR)', 'Amount (INR)'];
      case 'Finished Goods':
        return ['Sr. No', 'Description', 'Code', 'Formulator Name',  'Quantity (Nos)', 'No. of Packs', 'Rate per Unit (INR)', 'Amount (INR)'];
      case 'Bulk':
        return ['Sr. No', 'Description', 'Code', 'Formulator Name', 'Quantity (kg)', 'No. of Buckets', 'Rate per Unit (INR)', 'Amount (INR)'];
      default:
        return [];
    }
  }

  createEmptyItem(requestType: RequestType, srNo: number): RequestItem {
    const baseItem = {
      srNo,
      quantity: 0,
      rate: 0,
      amount: 0
    };

    switch (requestType) {
      case 'Raw Material':
        return {
          ...baseItem,
          metier: '',
          rmCode: '',
          quantityUnit: 'kg' as const,
          rateUnit: 'INR/kg' as const,
          noOfPacks: 0
        };
      case 'Packaging Material':
      case 'Packmat':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          contact: '',
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const,
          noOfPacks: 0
        };
      case 'Finished Goods':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          formulator: '',
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const,
          noOfPacks: 0
        };
      case 'Bulk':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          formulator: '',
          quantityUnit: 'kg' as const,
          rateUnit: 'INR' as const,
          noOfBuckets: 0
        };
      default:
        return {
          ...baseItem,
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const
        };
    }
  }
}