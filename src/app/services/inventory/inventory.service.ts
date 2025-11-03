import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private context: any;
  private web: any;
  // private list: any;
  private library: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private catalogDocumentLibraryName: string = environment.catalogDocumentLibraryName;

  constructor() {
    // this.context = new SP.ClientContext("https://loreal.sharepoint.com/sites/RI-IT-India");
    // this.web = this.context.get_web();
    // this.list = this.web.get_lists().getByTitle("Car_Booking_Calendar");
    console.log("this.sharepointSiteUrl", this.sharepointSiteUrl);
    console.log("this.catalogDocumentLibraryName", this.catalogDocumentLibraryName);
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.library = this.web.get_lists().getByTitle(this.catalogDocumentLibraryName);
    console.log("context", this.context)
    console.log("web", this.web)
    console.log("list", this.library)
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

  public updateMultipleListItemsByIds(items: any[]): Promise<any[]> { // Return type is Promise<any[]>
    return new Promise((resolve, reject) => {
      let promises: Promise<any>[] = [];
      items.forEach(item => {
        promises.push(this.updateListItem(item.id, item.forecastQuantity));
      });

      Promise.all(promises)
        .then((updatedItems: any[]) => { // Specify type here as well
          resolve(updatedItems);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public updateListItem(itemId: number, forecastQuantity: number): Promise<any> {  // Return type is now Promise<any>
    return new Promise((resolve, reject) => {
      const listItem = this.library.getItemById(itemId);
      listItem.set_item("ForecastQuantity", forecastQuantity);
      listItem.update();

      this.context.load(listItem);
      this.context.executeQueryAsync(
        () => {
          resolve(listItem); // Resolves with 'any' type
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  public getItemByComponentCode(componentCode: string): Promise<any[]> {
    console.log("componentCode", componentCode);
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();

      // Construct the CAML query to filter ONLY by ForecastYear
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
              <Eq>
                <FieldRef Name='PMCode' />
                <Value Type='Text'>${componentCode}</Value>
              </Eq>
            </Where>
          </Query>
        </View>
      `);

      const items = this.library.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];
          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues());
          }
          console.log("componentCode-result", result)
          console.log("componentCode-result - length ", result.length)
          console.log("componentCode-result - first ", result.at(0))
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
  public decreaseAvailableQuantityAfterDispatched(itemId: number, avilableQuantity: number, requestedQuantity: number): Promise<any> {  // Return type is now Promise<any>
    return new Promise((resolve, reject) => {
      const listItem = this.library.getItemById(itemId);
      listItem.set_item("AvailableQuantity", avilableQuantity - requestedQuantity);
      listItem.update();

      this.context.load(listItem);
      this.context.executeQueryAsync(
        () => {
          resolve(listItem); // Resolves with 'any' type
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }
  // getItemByComponentCode(componentCode: string): Observable<any> {
  //   const apiUrl = `${this.sharepointSiteUrl}/_api/web/lists/getbytitle('${this.catalogDocumentLibraryName}')/items?$filter=PMCode eq '${componentCode}'`;  // Assuming 'ComponentCode' is the internal name of the column.
  //   return this.http.get(apiUrl);
  // }
}
