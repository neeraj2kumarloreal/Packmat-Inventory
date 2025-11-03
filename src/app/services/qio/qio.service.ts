import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Location, QIO, QualityRepresentative, Site } from '../../types/qio.types'

declare var SP: any;


@Injectable({
  providedIn: 'root'
})
export class QioService {
  private context: any;
  private web: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private siteRelativeUrl: string = ''
  private qioCaseList: any;
  private qioSiteList: any;
  private qioCategoryList: any;
  private qioObservationLocationList: any;
  private qioRepresentativeList: any;
  private qioCaseIDList: any;
  private qioCaseImageLibrary: any;

  constructor() {
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.siteRelativeUrl = this.sharepointSiteUrl.replace('https://loreal.sharepoint.com', '');
    this.qioCaseList = this.web.get_lists().getByTitle("QIOCases");
    this.qioSiteList = this.web.get_lists().getByTitle("QIOSites");
    this.qioCategoryList = this.web.get_lists().getByTitle("QIOCategory");
    this.qioObservationLocationList = this.web.get_lists().getByTitle("QIOObservationLocation");
    this.qioRepresentativeList = this.web.get_lists().getByTitle("QIORepresentative");
    this.qioCaseIDList = this.web.get_lists().getByTitle("QIOCaseID");
    this.qioCaseImageLibrary = this.web.get_lists().getByTitle("QIOCaseImages");
  }

  public getCaseID(): Promise<{ id: number; title: string; caseID: number } | null> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
              <Eq>
                <FieldRef Name='Title' />
                <Value Type='Text'>CaseID</Value>
              </Eq>
            </Where>
          </Query>
        </View>
      `);

      const items = this.qioCaseIDList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          if (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            const result = {
              id: listItem.get_id(), // SharePoint item ID
              title: listItem.get_item('Title'),
              caseID: listItem.get_item('CaseID')
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


  public updateCaseID(id: number, caseID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.qioCaseIDList.getItemById(id);
      listItem.set_item("CaseID", caseID + 1)

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

  public getAllQIOSites(): Promise<Site[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      // You can customize the CAML query as needed
      const items = this.qioSiteList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result: Site[] = [];

          // while (itemCollection.moveNext()) {
          //   const listItem = itemCollection.get_current();
          //   result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          // }
          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            // Only select the fields you need
            result.push({
              id: listItem.get_item('ID'),
              title: listItem.get_item('Title'),
            });
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
  public getAllQIOCategory(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      // You can customize the CAML query as needed
      const items = this.qioCategoryList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            // Only select the fields you need
            result.push({
              id: listItem.get_item('ID'),
              title: listItem.get_item('Title'),
            });
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
  // public getAllQIOObservationLocations(): Promise<Location[]> {
  //   return new Promise((resolve, reject) => {
  //     const camlQuery = new SP.CamlQuery();
  //     camlQuery.set_viewXml('<View><Query></Query></View>');
  //     // You can customize the CAML query as needed
  //     const items = this.qioObservationLocationList.getItems(camlQuery);
  //     this.context.load(items);
  //     this.context.executeQueryAsync(
  //       () => {
  //         const itemCollection = items.getEnumerator();
  //         const result: Location[] = [];

  //         while (itemCollection.moveNext()) {
  //           const listItem = itemCollection.get_current();
  //           const id = listItem.get_item('ID');
  //           const title = listItem.get_item('Title');
  //           const sites = listItem.get_item('Site'); // This will be an array

  //           if (sites && Array.isArray(sites)) {
  //             sites.forEach((site: string) => {
  //               result.push({
  //                 id: id,
  //                 site: site,
  //                 title: title
  //               });
  //             });
  //           }
  //         }
  //         console.log("Sies,result", result);

  //         resolve(result);
  //       },
  //       (error: any) => {
  //         reject(error.get_message());
  //       }
  //     );
  //   });
  // }
  public getAllQIOObservationLocations(): Promise<Location[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      const items = this.qioObservationLocationList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          // Map to group by site
          const siteMap: { [site: string]: { id: number; site: string; locations: string[] } } = {};

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            const id = listItem.get_item('ID');
            const title = listItem.get_item('Title');
            const sites = listItem.get_item('Site'); // Array of sites

            if (sites && Array.isArray(sites)) {
              sites.forEach((site: string) => {
                if (!siteMap[site]) {
                  siteMap[site] = {
                    id: id, // You can decide which ID to keep if multiple locations share the same site
                    site: site,
                    locations: []
                  };
                }
                siteMap[site].locations.push(title);
              });
            }
          }

          // Convert map to array
          const result: Location[] = Object.values(siteMap);
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
  public getAllQIORepresentative(): Promise<QualityRepresentative[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');

      const items = this.qioRepresentativeList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result: QualityRepresentative[] = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            const representative = listItem.get_item('Representative'); // Person field
            console.log("representative", representative);
            console.log("representative.Title", representative?.Title);
            console.log("representative.Email", representative?.Email);
            console.log("representative.Id", representative?.Id);

            result.push({
              id: listItem.get_item('ID'),
              site: listItem.get_item('Site'),
              representativeId: representative ? representative.Id : null, // <-- Add this line
              representativeName: representative ? representative.Title : '',
              representativeEmail: representative ? representative.Email : '',
              isDefault: listItem.get_item('IsDefault') === true
            });
          }

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public getAllQIOCase(): Promise<QIO[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      // camlQuery.set_viewXml('<View><Query></Query></View>');
      camlQuery.set_viewXml(`<View><Query><OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy></Query></View>`);

      // You can customize the CAML query as needed
      const items = this.qioCategoryList.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result: QIO[] = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            const author = listItem.get_item('Author');
            console.log("getAllQIOCase,author", author);
            const assignedTo = listItem.get_item('AssignedTo');
            console.log("getAllQIOCase,assignedTo", assignedTo);

            result.push({
              id: listItem.get_item('ID'),
              caseID: listItem.get_item('CaseID'),
              observation: listItem.get_item('Observation'),
              observationforSite: listItem.get_item('ObservationforSite'),
              observationLocation: listItem.get_item('ObservationLocation'),
              category: listItem.get_item('Category'),
              criticality: listItem.get_item('Criticality'),
              createdDate: listItem.get_item('Created'),
              raisedbyName: author ? author.Title : '',
              raisedbyEmail: author ? author.Email : '',
              assignedTo: assignedTo ? assignedTo.Title : '',
              assignedToEmail: assignedTo ? assignedTo.Email : '',
              assignedToId: assignedTo ? assignedTo.Id : null,
              status: listItem.get_item('Status'),
              targetDate: listItem.get_item('TargetDate')
            });
          }

          console.log("getAllQIOCase,result", result);
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public async createQIOCase(item: QIO): Promise<any> {
    console.log(item);
    const caseIDData = await this.getCaseID();
    if (!caseIDData) {
      // Handle the case where no invoice number was found
      throw new Error("No case id number found in list.");
    }
    const caseID = caseIDData?.caseID; // Use only InvoiceNumber

    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.qioCaseList.addItem(listItemCreateInfo);

      listItem.set_item("CaseID", caseID);
      listItem.set_item("Observation", item.observation);
      listItem.set_item("ObservationforSite", item.observationforSite);
      listItem.set_item("ObservationLocation", item.observationLocation);
      listItem.set_item("Category", item.category);
      listItem.set_item("Criticality", item?.criticality);
      listItem.set_item("AssignedTo", item?.assignedToId);
      listItem.set_item("TargetDate", item?.targetDate);
      listItem.set_item("Status", item?.status);

      listItem.update();
      this.context.load(listItem, "Id"); // Ensure Id is loaded
      this.context.executeQueryAsync(
        async () => {
          const itemId = listItem.get_id(); // Get the ID of the created item
          console.log("Created item ID:", itemId);
          await this.updateCaseID(caseIDData?.id, caseID);
          // Call the function to add multiple related items
          try {
            await this.uploadFileToQIOCaseImagesDocumentLibrary(item?.evidenceImages, { caseID: caseID, imageType: "Evidence" });
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

  uploadFileToQIOCaseImagesDocumentLibrary(file: File | undefined, formData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.log("formData", formData)
      reader.onload = () => {
        const fileData = reader.result as ArrayBuffer;
        const fileName = file?.name;
        console.log("fileData", fileData);
        console.log("fileName", fileName);

        const folder = this.qioCaseImageLibrary.get_rootFolder();
        console.log("folder", folder);

        const fileCreateInfo = new SP.FileCreationInformation();
        fileCreateInfo.set_url(fileName);
        fileCreateInfo.set_overwrite(true);
        fileCreateInfo.set_content(new SP.Base64EncodedByteArray());
        console.log("fileCreateInfo", fileCreateInfo);
        // Convert ArrayBuffer to Base64 for SharePoint
        const byteArray = new Uint8Array(fileData);
        for (let i = 0; i < byteArray.length; i++) {
          fileCreateInfo.get_content().append(byteArray[i]);
        }
        console.log("byteArray", byteArray);

        // Add file to the document library
        const uploadedFile = folder.get_files().add(fileCreateInfo);
        this.context.load(uploadedFile);
        console.log("uploadedFile", uploadedFile);

        // Execute query
        this.context.executeQueryAsync(
          () => {
            console.log("File uploaded successfully!", uploadedFile);
            const listItem = uploadedFile.get_listItemAllFields();

            listItem.set_item("CaseID", formData?.caseID);
            listItem.set_item("ImageType", formData?.imageType);
            listItem.update();

            this.context.executeQueryAsync(
              () => {
                console.log("Metadata updated successfully!");
                resolve(listItem);
              },
              (sender: any, error: any) => {
                console.error("Error updating metadata:", error);
                reject(error);
              }
            );
            // resolve(uploadedFile);
          },
          (sender: any, error: any) => {
            console.error("File upload failed:", error, sender);
            reject(error);
          }
        );
      };

      reader.onerror = () => reject("Error reading file.");
      if (file) {
        reader.readAsArrayBuffer(file);
      }
    });
  }
}
