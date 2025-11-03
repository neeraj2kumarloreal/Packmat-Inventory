import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  private context: any;
  private web: any;
  private list: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private forecastList: string = environment.forecastList;

  constructor() {
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.list = this.web.get_lists().getByTitle(this.forecastList);
  }

  // public getAllItems(): Promise<any[]> {
  //   return new Promise((resolve, reject) => {
  //     const camlQuery = new SP.CamlQuery();
  //     camlQuery.set_viewXml('<View><Query></Query></View>');
  //     // You can customize the CAML query as needed
  //     const items = this.list.getItems(camlQuery);
  //     this.context.load(items);
  //     this.context.executeQueryAsync(
  //       () => {
  //         const itemCollection = items.getEnumerator();
  //         const result = [];

  //         while (itemCollection.moveNext()) {
  //           const listItem = itemCollection.get_current();
  //           result.push(listItem.get_fieldValues()); // You can customize the fields to retrieve as needed
  //         }

  //         resolve(result);
  //       },
  //       (error: any) => {
  //         reject(error.get_message());
  //       }
  //     );
  //   });
  // }
  public getAllItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // const web = this.context.get_web();
      const currentUser = this.web.get_currentUser();

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

  public getItemsByCodeAndYear(code: string, year: number): Promise<any[]> {
    console.log("code", code);
  //   console.log("year", year);
    return new Promise((resolve, reject) => {
      const currentUser = this.web.get_currentUser();
      this.context.load(currentUser, 'Id');

      this.context.executeQueryAsync(
        () => {
          const currentUserId = currentUser.get_id();
          const camlQuery = new SP.CamlQuery();
          const currentUserRole = localStorage.getItem("role");

          if (currentUserRole === "Lab User") {
            camlQuery.set_viewXml(`
              <View>
                <Query>
                  <Where>
                  <And>
                  <Eq>
                  <FieldRef Name='Author' LookupId='TRUE' />
                  <Value Type='Integer'>${currentUserId}</Value>
                </Eq>
                    <And>
                      <Eq>
                        <FieldRef Name='Title' />
                        <Value Type='Text'>${code}</Value>
                      </Eq>
                      <Eq>
                      <FieldRef Name='ForecastYear' />
                      <Value Type='Number'>${year}</Value>
                    </Eq>
                    </And>
                    </And>
                  </Where>
                </Query>
              </View>
            `);
          } else {
            camlQuery.set_viewXml(`
              <View>
                <Query>
                  <Where>
                   <And>
                      <Eq>
                        <FieldRef Name='Title' />
                        <Value Type='Text'>${code}</Value>
                      </Eq>
                      <Eq>
                        <FieldRef Name='ForecastYear' />
                        <Value Type='Number'>${year}</Value>
                      </Eq>
                    </And>
                  </Where>
                </Query>
              </View>
            `);
          }

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
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public getItemsByYear(year: number): Promise<any[]> {
    console.log("year", year);
    return new Promise((resolve, reject) => {
      const currentUser = this.web.get_currentUser();
      this.context.load(currentUser, 'Id');

      this.context.executeQueryAsync(
        () => {
          const currentUserId = currentUser.get_id();
          const camlQuery = new SP.CamlQuery();
          const currentUserRole = localStorage.getItem("role");

          if (currentUserRole === "Lab User") {
            camlQuery.set_viewXml(`
              <View>
                <Query>
                  <Where>
                    <And>
                      <Eq>
                        <FieldRef Name='ForecastYear' />
                        <Value Type='Number'>${year}</Value>
                      </Eq>
                      <Eq>
                        <FieldRef Name='Author' LookupId='TRUE' />
                        <Value Type='Integer'>${currentUserId}</Value>
                      </Eq>
                    </And>
                  </Where>
                </Query>
              </View>
            `);
          } else {
            camlQuery.set_viewXml(`
              <View>
                <Query>
                  <Where>
                    <Eq>
                      <FieldRef Name='ForecastYear' />
                      <Value Type='Number'>${year}</Value>
                    </Eq>
                  </Where>
                </Query>
              </View>
            `);
          }

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
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }

  public addMultipleListItems(items: any[]): Promise<any[]> { // Return type is Promise<any[]>
    return new Promise((resolve, reject) => {
      let promises: Promise<any>[] = [];
      items.forEach(item => {
        promises.push(this.addListItem(item));
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
  public addListItem(item: any): Promise<any> {
    console.log(item);
    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.list.addItem(listItemCreateInfo);
      listItem.set_item("Title", item?.code);
      // listItem.set_item("title0", "Booked");
      listItem.set_item("ProductName", item.name);
      listItem.set_item("ForecastQuantity", item.forecastQuantity);
      listItem.set_item("ProductImageURL", item.image);
      listItem.set_item("ForecastYear", new Date().getFullYear());
      listItem.set_item("Reason", item.reason);

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

}
