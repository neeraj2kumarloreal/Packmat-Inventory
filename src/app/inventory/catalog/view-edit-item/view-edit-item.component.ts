import { AfterViewInit, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CatalogService } from 'src/app/services/catalog/catalog.service';

@Component({
  selector: 'app-view-edit-item',
  templateUrl: './view-edit-item.component.html',
  styleUrls: ['./view-edit-item.component.scss']
})
export class ViewEditItemComponent implements OnInit, AfterViewInit {
  // catalogItemForm: any = FormGroup;
  selectedImageName: any = '';
  base64File: any;
  categoryList: any = [];
  isViewMode: boolean = false;
  isEditMode: boolean = false;
  url: any;
  onComponentEditOrView = new EventEmitter();
  componentForm: FormGroup;
  selectedFile: any = null;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<ViewEditItemComponent>,
    private catalogService: CatalogService, private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder, private toastrService: ToastrService, private router: Router,) {
    this.componentForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      componentName: ['', [Validators.required]],
      category: ['', [Validators.required]],
      availableQuantity: ['', [Validators.required]],
      imageName: ['', [Validators.required]],
    });

  }

  ngOnInit(): void {
    this.isEditMode = this.dialogData?.action === 'Edit';
    this.isViewMode = this.dialogData?.action === 'View';
    this.fetchCategoryList();
  }

  ngAfterViewInit(): void {
    console.log("this.dialogData", this.dialogData);
    const formData = this.dialogData?.formData
    console.log("formData", formData);
    // this.componentForm.patchValue(this.dialogData?.fromData);
    this.componentForm.get('code')?.setValue(formData?.Code);
    this.componentForm.get('componentName')?.setValue(formData?.ProductName);
    this.componentForm.get('category')?.setValue(formData?.Category);
    this.componentForm.get('availableQuantity')?.setValue(formData?.Quantity);
    const imageName = formData?.Image.substring(formData?.Image.lastIndexOf('/') + 1);
    this.componentForm.get('imageName')?.setValue(imageName);
    this.url = formData?.Image;
    // this.catalogService.updateCatalogItem(formData?.ID);
  }

  fetchCategoryList() {
    this.ngxService.start();

    this.catalogService.getAllCategoryItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {

        this.categoryList = items.map((item) => {
          console.log("item.Author", item);
          return {
            id: item.ID,
            title: item.Title,
          };
        });
        console.log("categoryList", this.categoryList)
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }
  onFileSelect(event: any) {
    this.componentForm.markAsDirty();
    try {
      const file = event.target.files[0] as File;
      this.selectedFile = file;
      // this.fileContentAsArrayBuffer = file.arrayBuffer();

      const fReader = new FileReader();
      fReader.readAsDataURL(file);
      var fileType = event.target.files[0].type;
      if (fileType.match(/image\/*/) == null) {
        this.toastrService.warning("Only images are supported");
        return;
      }

      // Extract file extension
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      fReader.onloadend = (_event: any) => {
        this.selectedImageName = file.name;
        this.componentForm.get("imageName")?.setValue(this.selectedImageName)
        this.base64File = _event.target.result.split("base64,")[1];

      };
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.url = reader?.result ?? "";
      };
      console.log("file name", this.selectedImageName);
      console.log("this.url", this.url);
      // console.log("this.fileContentAsArrayBuffer", this.fileContentAsArrayBuffer)
    } catch (error) {
      this.selectedImageName = "";
      this.base64File = "";
    }
  }
  // onFileSelect(event: any) {
  //   console.log("event",event)
  //   this.tempFile = event?.target?.files[0];
  //   console.log("tempFile",this.tempFile)
  //   // if (file) {
  //   //   this.uploadImageToDocumentLibrary(file);
  //   // }
  // }

  // async handleSubmit() {
  //   this.ngxService.start();
  //   const fileContentAsArrayBuffer = this.selectedFile.arrayBuffer();
  //   console.log("this.componentForm.value", this.componentForm.value);
  //   this.catalogService.addFileToLibrary("/sites/RI-IT-India/PuneDGCatalog", this.componentForm.value, await fileContentAsArrayBuffer).then((res) => {
  //     console.log("allItems", res);
  //     this.onComponentAdd.emit();
  //     this.ngxService.stop();

  //   })
  //     .catch((error) => {
  //       this.ngxService.stop();
  //       this.toastrService.error("Something went wrong , please try after some time")
  //       console.log("Error retrieving items: ", error);
  //     });

  // }
  handleUpdate() {
    this.ngxService.start();
    this.catalogService.updateCatalogItem(this.selectedFile, this.dialogData?.formData?.ID,this.componentForm.value,this.dialogData?.formData).then((res) => {
      console.log("res", res);
      this.toastrService.success("Component details updated successfully.");
      this.onComponentEditOrView.emit();
      this.ngxService.stop();
    }
    )
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time",)
        console.log("Error retrieving items: ", error);
      });
  }
  getErrorMessage(): string {
    return "This field is required";
  }

  onClear() {
    this.base64File = null;
    this.selectedFile = null;
    this.selectedImageName = null;
    this.url = null
    this.componentForm.get("imageName")?.setValue('');
  }
}
