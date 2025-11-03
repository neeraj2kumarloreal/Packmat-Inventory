import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private context: any;
  private web: any;
  // private list: any;
  private library: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private catalogDocumentLibraryName: string = environment.catalogDocumentLibraryName;
  private categoryList: any;
  private categoryListName: string = environment.categoryList;

  constructor() {
    // this.context = new SP.ClientContext("https://loreal.sharepoint.com/sites/RI-IT-India");
    // this.web = this.context.get_web();
    // this.list = this.web.get_lists().getByTitle("Car_Booking_Calendar");
    console.log("this.sharepointSiteUrl", this.sharepointSiteUrl);
    console.log("this.catalogDocumentLibraryName", this.catalogDocumentLibraryName);
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.library = this.web.get_lists().getByTitle(this.catalogDocumentLibraryName);
    this.categoryList = this.web.get_lists().getByTitle(this.categoryListName);
    console.log("context", this.context)
    console.log("web", this.web)
    console.log("library", this.library)
    console.log("categoryList", this.categoryList)
  }

  // public getUserDetails() {
  //   const currentUser = this.context.get_web().get_currentUser();
  //   this.context.load(currentUser);
  //   this.context.executeQueryAsync(
  //     () => {
  //    
  //     },
  //     (error: any) => {
  //       console.log(error);
  //     }
  //   );
  //   return currentUser;
  // }


  public getUserDetails() {
    return new Promise((resolve, reject) => {
      const currentUser = this.context.get_web().get_currentUser();
      this.context.load(currentUser);
      this.context.executeQueryAsync(
        () => {

          resolve(currentUser);
        },
        (error: any) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }


  public getAllItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(`<View><Query><OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy></Query></View>`);
      // You can customize the CAML query as needed
      const items = this.library.getItems(camlQuery);
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
  public getAllCategoryItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml('<View><Query></Query></View>');
      // You can customize the CAML query as needed
      const items = this.categoryList.getItems(camlQuery);
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

  // uploadImageToDocumentLibrary(file: File) {
  //   return new Promise((resolve, reject) => {
  //     const listItemCreateInfo = new SP.ListItemCreationInformation();
  //     listItemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.File);
  //     listItemCreateInfo.set_leafName(file.name); // Set file name

  //     const listItem = this.library.addItem(listItemCreateInfo);

  //     const reader = new FileReader();
  //     reader.readAsArrayBuffer(file);
  //     reader.onload = () => {
  //       const fileData = reader.result as ArrayBuffer;

  //       const fileCreateInfo = {
  //         url: file.name, // File name
  //         overwrite: true
  //       };

  //       const fileItem = this.library.rootFolder.files.add(fileCreateInfo, fileData, true);
  //       this.context.load(fileItem);

  //       this.context.executeQueryAsync(
  //         () => {
  //           console.log("File uploaded successfully!", fileItem);
  //           resolve(fileItem);
  //         },
  //         (error: any) => {
  //           console.log("File upload failed:", error);
  //           reject(error);
  //         }
  //       );
  //     };
  //   });
  // }
  uploadFileToDocumentLibrary(file: File, formData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.log("formData", formData)
      reader.onload = () => {
        const fileData = reader.result as ArrayBuffer;
        const fileName = file.name;
        // const libraryName = this.catalogDocumentLibraryName; // Replace with actual library name
        console.log("fileData", fileData);
        console.log("fileName", fileName);
        // console.log("libraryName",libraryName);

        // Get SharePoint context
        // const ctx = new SP.ClientContext.get_current();
        // const web = ctx.get_web();
        // const list = web.get_lists().getByTitle(libraryName);
        const folder = this.library.get_rootFolder();
        // console.log("ctx",ctx);
        // console.log("web",web);
        // console.log("list",list);
        console.log("folder", folder);

        // Create file information
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

            listItem.set_item("PMCode", formData?.code);
            listItem.set_item("ProductName", formData?.componentName);
            listItem.set_item("Category", formData?.category?.title);
            listItem.set_item("AvailableQuantity", formData?.availableQuantity);
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
      reader.readAsArrayBuffer(file);
    });
  }


  // updateCatalogItem(id:number){
  //   const listItem = this.library.getItemById(id);
  //   console.log("id",id);
  //   console.log("listItem",listItem);
  // }


  // updateCatalogItem(file: File | null, id: number, formData: any, originalData: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     // Get the SharePoint context and the item by ID
  //     const list = this.library; // Assuming `this.library` is the document library object
  //     const item = list.getItemById(id); // Retrieve the item by ID
  //     this.context.load(item);

  //     // Load the item for processing
  //     this.context.executeQueryAsync(
  //       () => {
  //         if (file) {
  //           // If a file is provided, update both the file and metadata
  //           const reader = new FileReader();
  //           reader.onload = () => {
  //             const fileData = reader.result as ArrayBuffer;
  //             const fileName = file.name;

  //             // Create file information for the update
  //             const fileCreateInfo = new SP.FileCreationInformation();
  //             fileCreateInfo.set_url(fileName);
  //             fileCreateInfo.set_overwrite(true);
  //             fileCreateInfo.set_content(new SP.Base64EncodedByteArray());

  //             // Convert ArrayBuffer to Base64 for SharePoint
  //             const byteArray = new Uint8Array(fileData);
  //             for (let i = 0; i < byteArray.length; i++) {
  //               fileCreateInfo.get_content().append(byteArray[i]);
  //             }

  //             // Add or update the file in the document library
  //             const folder = this.library.get_rootFolder();
  //             const uploadedFile = folder.get_files().add(fileCreateInfo);
  //             this.context.load(uploadedFile);

  //             // Execute query to update the file
  //             this.context.executeQueryAsync(
  //               () => {
  //                 console.log("File updated successfully!", uploadedFile);

  //                 // Update metadata for the item
  //                 const listItem = uploadedFile.get_listItemAllFields();
  //                 this.updateMetadata(listItem, formData, resolve, reject, originalData);
  //               },
  //               (sender: any, error: any) => {
  //                 console.error("File update failed:", error, sender);
  //                 reject(error);
  //               }
  //             );
  //           };

  //           reader.onerror = () => reject("Error reading file.");
  //           reader.readAsArrayBuffer(file);
  //         } else {
  //           // If no file is provided, update metadata only
  //           console.log("No file provided. Updating metadata only.");
  //           this.updateMetadata(item, formData, resolve, reject, originalData);
  //         }
  //       },
  //       (sender: any, error: any) => {
  //         console.error("Error loading item for update:", error);
  //         reject(error);
  //       }
  //     );
  //   });
  // }

  // // Helper function to update metadata
  // private updateMetadata(item: any, formData: any, resolve: any, reject: any, originalData: any): void {
  //   try {
  //     item.set_item("ProductName", formData?.componentName);
  //     item.set_item("Category", formData?.category);

  //     item.set_item("PMCode", originalData?.Code);
  //     item.set_item("AvailableQuantity", originalData?.Quantity);
  //     item.update();

  //     // Execute query to save metadata changes
  //     this.context.executeQueryAsync(
  //       () => {
  //         console.log("Metadata updated successfully!");
  //         resolve(item);
  //       },
  //       (sender: any, error: any) => {
  //         console.error("Error updating metadata:", error);
  //         reject(error);
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error in metadata update:", error);
  //     reject(error);
  //   }
  // }

  updateCatalogItem(file: File | null, id: number, formData: any, originalData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get the SharePoint context and the item by ID
      const list = this.library; // Assuming `this.library` is the document library object
      const item = list.getItemById(id); // Retrieve the item by ID
      this.context.load(item);
  
      // Load the item for processing
      this.context.executeQueryAsync(
        () => {
          if (file) {
            // If a file is provided, update both the file and metadata
            const reader = new FileReader();
            reader.onload = () => {
              const fileData = reader.result as ArrayBuffer;
              const fileName = file.name;
  
              // Get the existing file's URL to overwrite it
              const fileUrl = item.get_item("FileRef"); // FileRef contains the file's URL in the library
              console.log("Existing file URL:", fileUrl);
  
              // Use the existing file's URL to overwrite it
              const fileCreateInfo = new SP.FileCreationInformation();
              fileCreateInfo.set_url(fileUrl); // Use the existing file's URL
              fileCreateInfo.set_overwrite(true); // Ensure the file is overwritten
              fileCreateInfo.set_content(new SP.Base64EncodedByteArray());
  
              // Convert ArrayBuffer to Base64 for SharePoint
              const byteArray = new Uint8Array(fileData);
              for (let i = 0; i < byteArray.length; i++) {
                fileCreateInfo.get_content().append(byteArray[i]);
              }
  
              // Add or update the file in the document library
              const folder = this.library.get_rootFolder();
              const uploadedFile = folder.get_files().add(fileCreateInfo);
              this.context.load(uploadedFile);
  
              // Execute query to update the file
              this.context.executeQueryAsync(
                () => {
                  console.log("File updated successfully!", uploadedFile);
  
                  // Update metadata for the item
                  const listItem = uploadedFile.get_listItemAllFields();
                  this.updateMetadata(listItem, formData, resolve, reject, originalData);
                },
                (sender: any, error: any) => {
                  console.error("File update failed:", error, sender);
                  reject(error);
                }
              );
            };
  
            reader.onerror = () => reject("Error reading file.");
            reader.readAsArrayBuffer(file);
          } else {
            // If no file is provided, update metadata only
            console.log("No file provided. Updating metadata only.");
            this.updateMetadata(item, formData, resolve, reject, originalData);
          }
        },
        (sender: any, error: any) => {
          console.error("Error loading item for update:", error);
          reject(error);
        }
      );
    });
  }
  
  // Helper function to update metadata
  private updateMetadata(item: any, formData: any, resolve: any, reject: any, originalData: any): void {
    console.log("formData",formData);
    console.log("originalData",originalData);
    try {
      item.set_item("ProductName", formData?.componentName);
      item.set_item("Category", formData?.category);
  
      item.set_item("PMCode", originalData?.Code);
      item.set_item("AvailableQuantity", formData?.availableQuantity);
      item.update();
  
      // Execute query to save metadata changes
      this.context.executeQueryAsync(
        () => {
          console.log("Metadata updated successfully!");
          resolve(item);
        },
        (sender: any, error: any) => {
          console.error("Error updating metadata:", error);
          reject(error);
        }
      );
    } catch (error) {
      console.error("Error in metadata update:", error);
      reject(error);
    }
  }
}
