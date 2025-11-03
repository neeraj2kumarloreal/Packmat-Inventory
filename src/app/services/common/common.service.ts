import { Injectable } from '@angular/core';
import { ForecastService } from '../forecast.service';
import { environment } from 'src/environments/environment';
import { first } from 'rxjs';
import { HttpClient } from '@angular/common/http';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private context: any;
  private web: any;
  private list: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private userList: string = environment.userList;
  private packmatValidationListName: string = environment.packmatValidationList;
  private packmatValidationList: any;

  constructor(private http: HttpClient) {
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.list = this.web.get_lists().getByTitle(this.userList);
    this.packmatValidationList = this.web.get_lists().getByTitle(this.packmatValidationListName);
  }


  public setCurrentUserData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const web = this.context.get_web();
      const currentUser = web.get_currentUser();
      console.log("currentUser", currentUser);

      // Explicitly load the Id property of the current user
      this.context.load(currentUser, 'Id');

      this.context.executeQueryAsync(
        () => { // Success callback
          const currentUserId = currentUser.get_id(); // Now you can safely access the ID
          console.log("currentUserId", currentUserId);
          const camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(`
            <View>
              <Query>
                <Where>
                  <Eq>
                    <FieldRef Name='User' LookupId='TRUE' />
                    <Value Type='Integer'>${currentUserId}</Value>
                  </Eq>
                </Where>
              </Query>
            </View>
          `);

          const items = this.list.getItems(camlQuery);
          this.context.load(items);
          this.context.executeQueryAsync(
            () => {
              const itemCollection = items.getEnumerator();
              const result = [];
              while (itemCollection.moveNext()) {
                const listItem = itemCollection.get_current();
                result.push(listItem.get_fieldValues());
              }
              console.log("result", result);
              for (let item of result) {
                const userValues = Object.values(item.User);
                localStorage.setItem("currentUserName", String(userValues[1]));
                localStorage.setItem("currentUserEmail", String(userValues[2]));
                localStorage.setItem("role", item.Role);
              }
              if (result?.length === 0) {
                this.context.load(currentUser);
                console.log("result?.length currentUser", currentUser);
                this.context.executeQueryAsync(
                  () => {
                    localStorage.setItem("currentUserName", currentUser.get_title());
                    localStorage.setItem("currentUserEmail", currentUser.get_email());
                    resolve(currentUser);
                  },
                  (error: any) => {
                    console.log(error);
                    reject(error);
                  }
                );
              }
              resolve(result);
            },
            (error: any) => {
              reject(error.get_message());
            }
          );


        },
        (error: any) => { // Error callback for loading the current user
          reject(error.get_message());
        }
      );
    });
  }


  // hasAccess(item: string) {
  //   const currentUserRole = localStorage.getItem("role");
  //   if (currentUserRole) {
  //     if (currentUserRole === 'R&I Admin' || currentUserRole === 'Pune DG Admin' || currentUserRole === 'Transport Admin') {
  //       return true;
  //     }
  //     switch (item) {
  //       case 'Forecast':
  //       case 'Forecast Overview':
  //         return currentUserRole === 'Lab User'
  //       case 'Component Request':
  //         return currentUserRole === 'Formulator' || currentUserRole === 'Lab User'
  //       default:
  //         return false;
  //     }
  //   }
  //   return false;
  // }

  hasAccess(item: string) {
    const currentUserRole = localStorage.getItem("role");
    if (currentUserRole) {
      if (currentUserRole === 'Pune DG Admin') {
        return true;
      }
      switch (item) {
        case 'Forecast':
        case 'Forecast Overview':
          return currentUserRole === 'Lab User' || currentUserRole === 'R&I Admin'
        case 'Component Request':
          return currentUserRole === 'Formulator' || currentUserRole === 'Lab User' || currentUserRole === 'R&I Admin' || currentUserRole === 'Transport Admin'
        case 'Report':
          return currentUserRole === 'R&I Admin'
        case 'Gatepass':
          return currentUserRole === 'Gatepass Admin' || currentUserRole === 'Gatepass User' || currentUserRole === 'Transport Admin'
        // case 'Catalog':
        //   return currentUserRole !== 'Gatepass Admin' && currentUserRole !== 'Gatepass User' 
        default:
          return false;
      }
    }
    return false;
  }


  calculateTotalForecastQuantity(code: string, forecastQuantityData: any): number {
    return forecastQuantityData.reduce((sum: number, item: any) => {
      return item.code === code ? sum + item.forecastQuantity : sum;
    }, 0);
  }

  calculateTotalRequestedQuantity(code: string, requestData: any): number {
    return requestData.reduce((sum: number, item: any) => {
      return item.code === code ? sum + item.requestedQuantity : sum;
    }, 0);
  }


  public getItemByTitle(title: string): Promise<any[]> {
    return new Promise((resolve, reject) => {

      this.context.executeQueryAsync(
        () => { // Success callback
          console.log("title", title);
          const camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(`
            <View>
              <Query>
                <Where>
                  <Eq>
                    <FieldRef Name='Title'/>
                    <Value Type='Text'>${title}</Value>
                  </Eq>
                </Where>
              </Query>
            </View>
          `);

          const items = this.packmatValidationList.getItems(camlQuery);
          this.context.load(items);
          this.context.executeQueryAsync(
            () => {
              const itemCollection = items.getEnumerator();
              const result = [];
              while (itemCollection.moveNext()) {
                const listItem = itemCollection.get_current();
                result.push(listItem.get_fieldValues());
              }
              resolve(result);
            },
            (error: any) => {
              reject(error.get_message());
            }
          );
        },
        (error: any) => { // Error callback for loading the current user
          reject(error.get_message());
        }
      );
    });
  }

  public updateForecastPageStatus(id: number, status: string): Promise<any> {
    console.log("id-status", id, status)
    return new Promise((resolve, reject) => {
      const listItem = this.packmatValidationList.getItemById(id);

      listItem.set_item("Status", status);
      // Set other field values as needed

      listItem.update();
      this.context.load(listItem);
      this.context.executeQueryAsync(
        () => {
          resolve(listItem);
        },
        (error: any) => {
          // this.routeToHome();
          console.log(error);
          reject(error.get_message());
        }
      );
    });
  }


  downloadTemplate(requestType: string) {
    const downloadUrl = `${this.sharepointSiteUrl}/GatePassDocuments/Templates/${requestType}Gatepass.xlsx`
    window.open(downloadUrl, '_blank');
  }
  downloadGatepassPDF(filePath: string) {
    const downloadUrl = `${this.sharepointSiteUrl}/GatePassDocuments/${filePath}.pdf`;
    this.http.get(downloadUrl, { responseType: 'blob' }).subscribe(blob => {
      this.saveFile(blob, `${filePath}.pdf`);
    }, error => {
      console.error('Download error:', error);
    });
  }

  private saveFile(blob: Blob, fileName: string) {
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  // downloadGatepassPDF(filePath: string) {
  //   const downloadUrl = `${this.sharepointSiteUrl}/GatePassDocuments/${filePath}.pdf`
  //   window.open(downloadUrl, '_blank');
  // }

  getGatepassRequestStructureData(item: any) {
    return {
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
      createdByEmail: String(Object.values(item?.Author).at(2)),
      createdDate: item?.Created,
      secondaryApprovalRemark: item?.SecondaryApprovalRemark,
      finalApprovalRemark: item?.FinalApprovalRemark
    }
  }

  getGatepassMaterialStructureData(item: any, requestType: string) {
    let materialObject = null;
    switch (requestType) {
      case 'Raw Material':
        materialObject = {
          id: item?.ID,
          srNo: item?.Title,
          metier: item?.Metier,
          rmCode: item?.RMCode,
          quantity: item?.QuantityInKg,
          rate: item?.Rate,
          noOfPacks: item?.NoOfPacks,
          amount: Number(item?.AmountInINR),
          createdDate: item?.Created,
          createdBy: String(Object.values(item?.Author).at(1)),
        };
        break;
      case 'Packaging Material':
        materialObject = {
          id: item?.ID,
          srNo: item?.Title,
          description: item?.Description,
          code: item?.Code,
          quantity: item?.QuantityInNos,
          name: item?.ContactName,
          rate: item?.Rate,
          noOfPacks: item?.NoOfPacksBox,
          amount: Number(item?.Amount),
          createdDate: item?.Created,
          createdBy: String(Object.values(item?.Author).at(1)),
        };
        break;
      case 'Packmat':
        materialObject = {
          id: item?.ID,
          srNo: item?.Title,
          description: item?.Description,
          code: item?.Name_x0028_Code_x0029_,
          name: item?.ReceiverName,
          quantity: item?.QuantityInNos,
          rate: item?.Rate,
          noOfPacks: item?.NoOfPacks,
          amount: Number(item?.Amount),
          createdDate: item?.Created,
          createdBy: String(Object.values(item?.Author).at(1)),
        };
        break;
      case 'Finished Goods':
        materialObject = {
          id: item?.ID,
          srNo: item?.Title,
          description: item?.Description,
          code: item?.Name_x0028_Code_x0029_,
          formulatorName: item?.FormulatorName,
          quantity: item?.QuantityInNos,
          rate: item?.Rate,
          noOfPacks: item?.NoOfPacks,
          amount: Number(item?.Amount),
          createdDate: item?.Created,
          createdBy: String(Object.values(item?.Author).at(1)),
        };
        break;
      case 'Bulk':
        materialObject = {
          id: item?.ID,
          srNo: item?.Title,
          description: item?.Description,
          code: item?.Name_x0028_Code_x0029_,
          formulatorName: item?.FormulatorName,
          quantity: item?.QuantityInKg,
          rate: item?.Rate,
          noOfBuckets: item?.NoOfBuckets,
          amount: Number(item?.Amount),
          createdDate: item?.Created,
          createdBy: String(Object.values(item?.Author).at(1)),
        };
        break;
    }
    return materialObject;
  }
}
