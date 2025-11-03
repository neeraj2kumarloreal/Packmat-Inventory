import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';

@Component({
  selector: 'app-create-gatepass',
  templateUrl: './create-gatepass.component.html',
  styleUrls: ['./create-gatepass.component.scss']
})
export class CreateGatepassComponent {
url: any;
onComponentAdd = new EventEmitter();
gatepassRequestDetailForm: FormGroup;

constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<CreateGatepassComponent>,
  private gatepassService: GatepassService, private ngxService: NgxUiLoaderService,
  private formBuilder: FormBuilder, private toastrService: ToastrService, private router: Router,) {
  this.gatepassRequestDetailForm = this.formBuilder.group({
    metier: ['', [Validators.required]],
    rmCode: ['', [Validators.required]],
    quantityInKg: ['', [Validators.required]],
    rate: ['', [Validators.required]],
    noOfPacks: ['', [Validators.required]],
    amountInINR: ['', [Validators.required]],
  });

}
ngOnInit(): void {
}

handleSubmit() {
  // this.ngxService.start();
  // this.catalogService.uploadFileToDocumentLibrary(this.selectedFile, this.gatepassRequestDetailForm.value).then((res) => {
  //   console.log("res", res);
  //   this.onComponentAdd.emit();
  //   this.ngxService.stop();
  // }
  // )
  //   .catch((error) => {
  //     this.ngxService.stop();
  //     this.toastrService.error("Something went wrong , please try after some time",)
  //     console.log("Error retrieving items: ", error);
  //   });
}

getErrorMessage(): string {
  return "This field is required";
}

}
