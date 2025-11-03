import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var SP: any;

@Injectable({
  providedIn: 'root'
})
export class GatepassService {
  private context: any;
  private web: any;
  // private list: any;
  private gatePassList: any;
  private invoiceList: any;
  private gatepassCustomerAddressList: any;
  private gatepassRawMaterialDetailList: any;
  private sentBackforChangesforEmailList: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private gatepassListName: string = environment.gatepassList;
  private invoiceListName: string = environment.gatepassInvoiceNumberList;
  private gatepassCustomerAddressListName: string = environment.gatepassCustomerAddressList;
  private gatepassMetierList:any;
  // private gatepassRawMaterialDetailListName: string = environment.gatepassRawMaterialDetailList;
  private siteRelativeUrl: string = ''

  constructor(private datePipe: DatePipe) {
    console.log("this.sharepointSiteUrl", this.sharepointSiteUrl);
    console.log("this.catalogDocumentLibraryName", this.gatepassListName);
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.siteRelativeUrl = this.sharepointSiteUrl.replace('https://loreal.sharepoint.com', '');
    console.log("siteRelativeUrl:", this.siteRelativeUrl);
    this.gatePassList = this.web.get_lists().getByTitle(this.gatepassListName);
    this.invoiceList = this.web.get_lists().getByTitle(this.invoiceListName);
    this.gatepassCustomerAddressList = this.web.get_lists().getByTitle(this.gatepassCustomerAddressListName);
    this.gatepassMetierList = this.web.get_lists().getByTitle("GatepassMetierList");
    this.sentBackforChangesforEmailList = this.web.get_lists().getByTitle("SentBackforChangesforEmail");
    // this.gatepassRawMaterialDetailList = this.web.get_lists().getByTitle(this.gatepassRawMaterialDetailListName);
    console.log("context", this.context)
    console.log("web", this.web)
    console.log("list", this.gatePassList)
  }

  public getAllItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(`<View><Query><OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy></Query></View>`);
      // You can customize the CAML query as needed
      const items = this.gatePassList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
  public getInvoiceNumber(): Promise<{ id: number; title: string; invoiceNumber: number } | null> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
              <Eq>
                <FieldRef Name='Title' />
                <Value Type='Text'>Gatepass Invoice Number</Value>
              </Eq>
            </Where>
          </Query>
        </View>
      `);

      const items = this.invoiceList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          if (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            const result = {
              id: listItem.get_id(), // SharePoint item ID
              title: listItem.get_item('Title'),
              invoiceNumber: listItem.get_item('InvoiceNumber')
            };
            resolve(result);
          } else {
            resolve(null); // No item found
          }
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }


  public updateInvoiceNumber(id: number, invoiceNumber: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.invoiceList.getItemById(id);
      listItem.set_item("InvoiceNumber", invoiceNumber + 1)

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
  public getAllCustomerAddress(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      // You can customize the CAML query as needed
      const items = this.gatepassCustomerAddressList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public async createGatepassRequest(item: any): Promise<any> {
    console.log(item);
    // let shortAddress = 'Banglore:- No. A-1, First floor, Tower A, Einstein buildingBearys Global Research Triangle, Sy No. 63/3B, Gorvigere village,Bidarahalli Hobli,W hite field Ashram Road, Banglore 560 067 India';
    // switch (item?.address) {
    //   case 'Mumbai:-, RNI Loreal India Pvt Ltd,7th floor Universal Majestic, Ghatkopar Mankhurd Link Road Chembur Mumbai -71':
    //     shortAddress = 'L’ORÉAL India Pvt. Ltd., Research & Innovation , Chembur, Mumbai';
    //     break;
    //   case "Baddi:-, L'ORÉAL India Pvt. Ltd,  Plot no 147 EPIP phase-1Jharmajri Baddi, Pin-173205 Solan HIMACHAL PRADESH":
    //     shortAddress = "L'ORÉAL India Pvt. Ltd., Baddi"
    // }
    const note = `We, L’ORÉAL India Pvt. Ltd., Research & Innovation(Demi Grand) - Chakan, Pune declares that the box/packets, address to  ${item?.address} are the samples for testing purpose only. These goods have no commercial value, and we are sending the same for trial purpose only.`
    const invoiceData = await this.getInvoiceNumber();
    if (!invoiceData) {
      // Handle the case where no invoice number was found
      throw new Error("No invoice number found in GatepassInvoiceNumberList.");
    }
    const invoiceNumber = invoiceData?.invoiceNumber; // Use only InvoiceNumber

    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.gatePassList.addItem(listItemCreateInfo);
      listItem.set_item("Title", item.customerName);
      listItem.set_item("RequestType", item.requestType);
      listItem.set_item("CustomerAddress", item.address);
      listItem.set_item("CustomerEmail", item.customerEmail);
      listItem.set_item("InvoiceNo", invoiceNumber);
      listItem.set_item("InvoiceDate", new Date());
      listItem.set_item("SubTotal", item?.totalAmount);
      listItem.set_item("RequestStatus", item?.status);
      listItem.set_item("Note", note);
      listItem.set_item("BaseAddress", "L'OREAL INDIA PVT. LTD. ,Gut no 426, Mahalunge Ingale, Chakan-Talegaon Road,Chakan, Pune - 410 501, INDIA , Contact No : +91 2135619917/910");
      listItem.set_item("NoOfPackages", item?.noOfPackages);
      listItem.set_item("Weight", item?.weight);

      listItem.update();
      this.context.load(listItem, "Id"); // Ensure Id is loaded
      this.context.executeQueryAsync(
        async () => {
          const itemId = listItem.get_id(); // Get the ID of the created item
          console.log("Created item ID:", itemId);
          await this.updateInvoiceNumber(invoiceData?.id, invoiceNumber);
          // Call the function to add multiple related items
          try {
            await this.addMultipleItemsToList(item?.items, itemId, item.requestType);
            resolve(listItem);
          } catch (err) {
            reject(err);
          }
          resolve(listItem);
        },
        (error: any) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }

  public getMaterialSharepointListBasedOnRequestType(requestType: string): any {
    let list: any = null;
    switch (requestType) {
      case 'Raw Material':
        list = this.web.get_lists().getByTitle("GatepassRawMaterialDetailList");
        break;
      case 'Packaging Material':
        list = this.web.get_lists().getByTitle("GatepassPackagingMaterialDetailList");
        break;
      case 'Packmat':
        list = this.web.get_lists().getByTitle("GatepassPackmatDetailList");
        break;
      case 'Finished Goods':
        list = this.web.get_lists().getByTitle("GatepassFinishedGoodsDetailList");
        break;
      case 'Bulk':
        list = this.web.get_lists().getByTitle("GatepassBulkDetailList");
        break;
    }
    return list;
  }

  public async addMultipleItemsToList(items: any[], gatepassRequestID: number, requestType: string): Promise<void> {
    const list = this.getMaterialSharepointListBasedOnRequestType(requestType);
    if (!list) {
      throw new Error('Invalid request type or SharePoint list not found');
    }
    return new Promise((resolve, reject) => {
      let processed = 0;
      let hasError = false;

      items.forEach(item => {
        const listItemCreateInfo = new SP.ListItemCreationInformation();
        // const listItem = this.gatepassRawMaterialDetailList.addItem(listItemCreateInfo);
        const listItem = list.addItem(listItemCreateInfo);

        // Set your fields here
        listItem.set_item("Title", item.srNo);
        listItem.set_item("GatepassRequestID", gatepassRequestID);

        switch (requestType) {
          case 'Raw Material':
            listItem.set_item("Metier", item.metier);
            listItem.set_item("RMCode", item.rmCode);
            listItem.set_item("QuantityInKg", item.quantity);
            listItem.set_item("Rate", item.rate);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("AmountInINR", item.amount);
            break;
          case 'Packaging Material':
            listItem.set_item("Description", item.description);
            listItem.set_item("Code", item.code);
            listItem.set_item("ContactName", item.name);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacksBox", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Packmat':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("ReceiverName", item.name);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Finished Goods':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("FormulatorName", item?.name);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Bulk':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("FormulatorName", item?.name);
            listItem.set_item("QuantityInKg", item.quantity);
            listItem.set_item("NoOfBuckets", item.noOfBuckets);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
        }

        listItem.update();
        this.context.load(listItem, "Id");

        this.context.executeQueryAsync(
          () => {
            processed++;
            if (processed === items.length && !hasError) {
              resolve();
            }
          },
          (error: any) => {
            if (!hasError) {
              hasError = true;
              reject(error);
            }
          }
        );
      });
    });
  }

  public getAllGatepassRequestByCurrentUser(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const web = this.context.get_web();
      const currentUser = web.get_currentUser();

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
                    <FieldRef Name='Author' LookupId='TRUE' />
                    <Value Type='Integer'>${currentUserId}</Value>
                  </Eq>
                </Where>
                <OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy>
              </Query>
            </View>
          `);
          const items = this.gatePassList.getItems(camlQuery);
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

  public getMaterialDetailsByGatepassRequestID(gatepassRequestID: number, requestType: string): Promise<any[]> {
    console.log("gatepassRequestID", gatepassRequestID);
    console.log("requestType", requestType);
    const list = this.getMaterialSharepointListBasedOnRequestType(requestType);
    if (!list) {
      throw new Error('Invalid request type or SharePoint list not found');
    }
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      // Construct the CAML query to filter ONLY by ForecastYear
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
              <Eq>
                <FieldRef Name='GatepassRequestID' />
                <Value Type='Number'>${gatepassRequestID}</Value>
              </Eq>
            </Where>
          </Query>
        </View>
      `);

      const items = list?.getItems(camlQuery);

      // const items = this.gatepassRawMaterialDetailList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];
          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues());
          }
          console.log("gatepassRawMaterialDetailList-result", result);
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public getAllGatepassRequest(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(`<View><Query><OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy></Query></View>`);
      // You can customize the CAML query as needed
      const items = this.gatePassList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public getAllPendingGatepassRequest(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const web = this.context.get_web();
      const currentUser = web.get_currentUser();

      this.context.executeQueryAsync(
        () => { // Success callback
          const camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(`
            <View>
              <Query>
                <Where>
                <Eq>
                 <FieldRef Name='RequestStatus' />
                 <Value Type='Choice'>Pending</Value>
                 </Eq>
                </Where>
                <OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy>
              </Query>
            </View>
          `);
          const items = this.gatePassList.getItems(camlQuery);
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

  public updateGatepassRequest(originalData: any, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.gatePassList.getItemById(originalData?.id);
      console.log("listItem-updateGatepassRequest", listItem)
      listItem.set_item("LRNo", data?.lrNo);
      listItem.set_item("OtherCharges", data?.otherCharges);
      if (data?.poDate) {
        listItem.set_item("PODate", data?.poDate);
      }
      listItem.set_item("PONo", data?.poNo);
      listItem.set_item("SealNo", data?.sealNo);
      listItem.set_item("Taxes", data?.taxes);
      listItem.set_item("TransporterName", data?.transporterName);
      listItem.set_item("ValueOfProduct", data?.valueofProduct);
      listItem.set_item("VehicalNo", data?.vehicalNo);
      listItem.set_item("RequestStatus", data?.status);
      listItem.set_item("InvoicePdfUrl", this.sharepointSiteUrl + "/GatePassDocuments/PDFFiles/" + originalData?.invoiceNumber + "_" + this.formatDate(new Date()) + ".pdf");
      listItem.set_item("SecondaryApprovalRemark",data?.remark);

      let subTotal = originalData?.subTotal;
      if (data?.taxes) {
        subTotal = subTotal + data?.taxes
        listItem.set_item("SubTotal", subTotal);
      }

      if (data?.otherCharges) {
        listItem.set_item("NetAmount", subTotal + data?.taxes);
      } else {
        listItem.set_item("NetAmount", subTotal);
      }

      listItem.update();
      this.context.load(listItem);
      this.context.executeQueryAsync(
        () => {
          resolve(listItem);
          if(data?.status === "Sent Back for Changes"){
            this.createEntryInSentBackforChangesforEmailList(originalData,data?.remark);
          }
        },
        (error: any) => {
          // this.routeToHome();
          console.log(error);
          reject(error.get_message());
        }
      );
    });
  }
  public createEntryInSentBackforChangesforEmailList(originalData: any,remark:any): Promise<any> {
    console.log(originalData);
    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.sentBackforChangesforEmailList.addItem(listItemCreateInfo);
      listItem.set_item("Title", originalData?.createdByEmail);
      listItem.set_item("InvoiceNumber", originalData?.invoiceNumber);
      listItem.set_item("RequestType", originalData?.requestType);
      listItem.set_item("Remark", remark);
     
      listItem.update();
      this.context.load(listItem);
      this.context.executeQueryAsync(
        () => {
          console.log(listItem);
          resolve(listItem);
        },
        (error: any) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }
  

  public getGatepassRequestById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {

      this.context.executeQueryAsync(
        () => { // Success callback for loading current user
          const item = this.gatePassList.getItemById(id);
          this.context.load(item);
          this.context.executeQueryAsync(
            () => {
              resolve(item.get_fieldValues());
            },
            (error: any) => {
              reject(error.get_message());
            }
          );
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  uploadFileToDocumentLibrary(buffer: Uint8Array, fileName: string, gatepassRequestID: number, documentLibrary: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        console.log("fileName", fileName);
        console.log("gatepassRequestID", gatepassRequestID);
        // Get the PDFFiles folder inside GatePassDocuments library
        // this.sharepointSiteUrl
        // const folder = this.context.get_web().getFolderByServerRelativeUrl('/sites/RI-IT-India/GatePassDocuments/PDFFiles');
        const folderUrl = `${this.siteRelativeUrl}${documentLibrary}`;
        console.log("folder", folderUrl);

        const folder = this.context.get_web().getFolderByServerRelativeUrl(folderUrl);

        console.log("folder", folder);
        // If your site is root, use: '/GatePassDocuments/PDFFiles'

        const fileCreateInfo = new SP.FileCreationInformation();
        fileCreateInfo.set_url(fileName);
        fileCreateInfo.set_overwrite(true);
        console.log("fileCreateInfo", fileCreateInfo);


        // Build Base64EncodedByteArray from buffer
        const content = new SP.Base64EncodedByteArray();
        for (let i = 0; i < buffer.length; i++) {
          content.append(buffer[i]);
        }
        fileCreateInfo.set_content(content);

        // Add file to the PDFFiles folder
        const uploadedFile = folder.get_files().add(fileCreateInfo);
        this.context.load(uploadedFile);

        this.context.executeQueryAsync(
          () => {
            const listItem = uploadedFile.get_listItemAllFields();
            // Set metadata
            listItem.set_item("GatepassRequestID", gatepassRequestID);
            listItem.update();

            this.context.executeQueryAsync(
              () => resolve(listItem),
              (sender: any, error: any) => reject(error)
            );
          },
          (sender: any, error: any) => reject(error)
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  public getAllUnderReviewGatepassRequest(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const web = this.context.get_web();

      this.context.executeQueryAsync(
        () => { // Success callback
          const camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(`
            <View>
              <Query>
                <Where>
                <Eq>
                 <FieldRef Name='RequestStatus' />
                 <Value Type='Choice'>Under Review</Value>
                 </Eq>
                </Where>
                <OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy>
              </Query>
            </View>
          `);
          const items = this.gatePassList.getItems(camlQuery);
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

  public processGatepassRequest(gatepassRequestID: number, status: string,remark:string): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.gatePassList.getItemById(gatepassRequestID);

      listItem.set_item("RequestStatus", status);
      listItem.set_item("FinalApprovalRemark", remark);

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

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd-MM-yyyy") || "";
  }

  public getMetierList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      // You can customize the CAML query as needed
      const items = this.gatepassMetierList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];
          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          }
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public async editGatepassRequest(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.gatePassList.getItemById(data?.id);
      console.log("listItem-updateGatepassRequest", listItem)
      listItem.set_item("Title", data.customerName);
      listItem.set_item("CustomerAddress", data.customerAddress);
      listItem.set_item("CustomerEmail", data.customerEmail);
      listItem.set_item("NoOfPackages", data?.noOfPackages);
      listItem.set_item("Weight", data?.weight);
      listItem.set_item("RequestStatus", "Pending");
      listItem.set_item("SubTotal", data?.totalAmount);
      listItem.set_item("NetAmount", data?.totalAmount);

      listItem.update();
      this.context.load(listItem);
      this.context.executeQueryAsync(
        async  () => {
          try {
            await this.addorUpdateMultipleItemsToList(data?.items, data?.id, data.requestType);
            resolve(listItem);
          } catch (err) {
            reject(err);
          }
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
  public async addorUpdateMultipleItemsToList(items: any[], gatepassRequestID: number, requestType: string): Promise<void> {
    const list = this.getMaterialSharepointListBasedOnRequestType(requestType);
    if (!list) {
      throw new Error('Invalid request type or SharePoint list not found');
    }
    return new Promise((resolve, reject) => {
      let processed = 0;
      let hasError = false;
  
      items.forEach(item => {
        let listItem: any;
        let isUpdate = !!item.id && !isNaN(item.id);
  
        if (isUpdate) {
          // Update existing item
          listItem = list.getItemById(item.id);
        } else {
          // Create new item
          const listItemCreateInfo = new SP.ListItemCreationInformation();
          listItem = list.addItem(listItemCreateInfo);
        }
  
        // Set common fields
        listItem.set_item("Title", item.srNo);
        listItem.set_item("GatepassRequestID", gatepassRequestID);
  
        // Set fields based on requestType (same as your switch-case)
        switch (requestType) {
          case 'Raw Material':
            listItem.set_item("Metier", item.metier);
            listItem.set_item("RMCode", item.rmCode);
            listItem.set_item("QuantityInKg", item.quantity);
            listItem.set_item("Rate", item.rate);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("AmountInINR", item.amount);
            break;
          case 'Packaging Material':
            listItem.set_item("Description", item.description);
            listItem.set_item("Code", item.code);
            listItem.set_item("ContactName", item.name);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacksBox", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Packmat':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("ReceiverName", item.name);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Finished Goods':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("FormulatorName", item?.formulatorName);
            listItem.set_item("QuantityInNos", item.quantity);
            listItem.set_item("NoOfPacks", item.noOfPacks);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
          case 'Bulk':
            listItem.set_item("Description", item.description);
            listItem.set_item("Name_x0028_Code_x0029_", item.code);
            listItem.set_item("FormulatorName", item?.formulatorName);
            listItem.set_item("QuantityInKg", item.quantity);
            listItem.set_item("NoOfBuckets", item.noOfBuckets);
            listItem.set_item("Amount", item.amount);
            listItem.set_item("Rate", item.rate);
            break;
        }
  
        listItem.update();
        this.context.load(listItem, "Id");
  
        this.context.executeQueryAsync(
          () => {
            processed++;
            if (processed === items.length && !hasError) {
              resolve();
            }
          },
          (error: any) => {
            if (!hasError) {
              hasError = true;
              reject(error);
            }
          }
        );
      });
    });
  }

}
