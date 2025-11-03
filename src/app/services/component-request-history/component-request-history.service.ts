import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var SP: any;
@Injectable({
  providedIn: 'root'
})
export class ComponentRequestHistoryService {

  private context: any;
  private web: any;
  private list: any;
  private sharepointSiteUrl: string = environment.sharePointSiteUrl;
  private componentRequestHistoryList: string = environment.componentRequestHistoryList;

  constructor() {
    this.context = new SP.ClientContext(this.sharepointSiteUrl);
    this.web = this.context.get_web();
    this.list = this.web.get_lists().getByTitle(this.componentRequestHistoryList);
  }

  public addListItem(id: number, status: string, item: any): Promise<any> {
    console.log(item);
    return new Promise((resolve, reject) => {
      const listItemCreateInfo = new SP.ListItemCreationInformation();
      const listItem = this.list.addItem(listItemCreateInfo);
      listItem.set_item("ComponentRequestID", id);
      listItem.set_item("Outcome", status);
      listItem.set_item("Remark", item.approvalRemark);

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

  public getItemByComponentRequestID(id: number): Promise<any[]> {
    console.log("id", id);
    return new Promise((resolve, reject) => {
      const camlQuery = new SP.CamlQuery();

      // Construct the CAML query to filter ONLY by ForecastYear
      camlQuery.set_viewXml(`
      <View>
        <Query>
          <Where>
            <Eq>
              <FieldRef Name='ComponentRequestID' />
              <Value Type='Number'>${id}</Value>
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
          console.log("componentCode-result", result)
          resolve(result);
        },
        (error: any) => {
          reject(error.get_message());
        }
      );
    });
  }
}
