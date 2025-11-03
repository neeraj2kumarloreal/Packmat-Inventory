import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  action: string = ''
  onYes = new EventEmitter();
  currentRequest = {
    remark: '',
  };

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<ConfirmationDialogComponent>) { }

  ngOnInit(): void {
    this.action = this.dialogData?.action;
  }

  takeAction() {
    this.onYes.emit();
  }

  reject() {
    // Access the remark entered by the user
    const userRemark = this.currentRequest.remark;
    console.log('User Remark:', userRemark);

    // You can now use userRemark for further logic, e.g., send to API, validate, etc.
    // Example:
    if (userRemark && userRemark.trim()) {
      this.onYes.emit(userRemark);
    } 
  }
}
