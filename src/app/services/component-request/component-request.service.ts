import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class ComponentRequestService {

  private context: any;
  private web: any;
  private list: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private componentRequestList: string = environment.componentRequestList;

  constructor() {
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.list = this.web.get_lists().getByTitle(this.componentRequestList);
  }

  public getAllItemsByTodaysDate(today: Date): Promise<number> {
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();

      // Format today's date to ISO string without time part
      const isoDateString = today.toISOString().split('T')[0];

      // CAML query to filter items created today
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
              <Eq>
                <FieldRef Name="Created" />
                <Value Type="DateTime">${isoDateString}T00:00:00Z</Value>
              </Eq>
            </Where>
          </Query>
        </View>
      `);

      const items = this.list.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCount = items.get_count();
          console.log("itemCount", itemCount);
          resolve(itemCount);
        },
        (error: any) => {
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
      const items = this.list.getItems(camlQuery);
      this.context.load(items);
      this.context.executeQueryAsync(
        () => {
          const itemCollection = items.getEnumerator();
          const result = [];

          while (itemCollection.moveNext()) {
            const listItem = itemCollection.get_current();
            result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
          }

          console.log("result=>",result)

          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public getAllItemsByCurrentUser(): Promise<any[]> {
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
  public addMultipleListItems(items: any[]): Promise<any[]> { // Return type is Promise<any[]>
    return new Promise((resolve, reject) => {
      let promises: Promise<any>[] = [];
      items.forEach(item => {
        // promises.push(this.addListItem(item));
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
  public addListItem(item: any, refNumber: string): Promise<any> {
    console.log(item);
    console.log(refNumber);
    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.list.addItem(listItemCreateInfo);
      listItem.set_item("Title", item?.componentCode?.Code);
      listItem.set_item("ProductName", item?.componentCode?.ProductName);
      listItem.set_item("ImageURL", item?.componentCode?.Image);
      listItem.set_item("RequestedQuantity", item.requestedQuantity);
      listItem.set_item("RequiredDate", item.requiredDate);
      listItem.set_item("Purpose", item.purpose);
      listItem.set_item("MetierAndProjectName", item.metierAndProjectName);
      listItem.set_item("Application", item.application);
      listItem.set_item("IsReqPartOfYearlyForecast", item.isReqPartOfYearlyForecast);
      listItem.set_item("DGReferenceNumber", refNumber);
      listItem.set_item("OriginalQuantity", item.requestedQuantity);
      listItem.set_item("RequestYear", new Date().getFullYear());


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
  // public updateListItem(itemId: number, updatedAvailableQunatity: number): Promise<any> {  // Return type is now Promise<any>
  //   return new Promise((resolve, reject) => {
  //     const listItem = this.library.getItemById(itemId);
  //     listItem.set_item("AvailableQuantity", updatedAvailableQunatity);
  //     listItem.update();

  //     this.context.load(listItem);
  //     this.context.executeQueryAsync(
  //       () => {
  //         resolve(listItem); // Resolves with 'any' type
  //       },
  //       (error: any) => {
  //         reject(error);
  //       }
  //     );
  //   });
  // }
  public updateListItemByAdmin(id: number, status: string, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const listItem = this.list.getItemById(id);
      if (item.updatedQuantity) {
        listItem.set_item("RequestedQuantity", item.updatedQuantity)
      }
      listItem.set_item("Status", status);
      listItem.set_item("Remark", item.approvalRemark);
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
  public getItemsByYearAndStatus(year: number): Promise<any[]> {
    console.log("year", year);
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();

      // Construct the CAML query to filter ONLY by ForecastYear
      camlQuery.set_viewXml(`
        <View>
          <Query>
            <Where>
            <And>
              <Eq>
                <FieldRef Name='RequestYear' />
                <Value Type='Number'>${year}</Value>
              </Eq>
              <Eq>
              <FieldRef Name='Status' />
              <Value Type='Choice'>Received</Value>
            </Eq>
            </And>
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
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

}
