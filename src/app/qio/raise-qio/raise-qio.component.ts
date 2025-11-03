import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { QioService } from 'src/app/services/qio/qio.service';
import { Site, QualityRepresentative, QIO, Location } from 'src/app/types/qio.types';

@Component({
  selector: 'app-raise-qio',
  templateUrl: './raise-qio.component.html',
  styleUrls: ['./raise-qio.component.scss']
})
export class RaiseQioComponent {
  sites: Site[] = [];
  locations: Location[] = [];
  qualityReps: QualityRepresentative[] = [];
  selectedFile: File | null = null;
  imagePreview: string = '';
  isSubmitting = false;
  submitMessage = '';
  submitError = false;
  currentUserEmail: string = '';
  currentUserName: string = '';


  formData: Partial<QIO> = {
    observation: '',
    observationforSite: '',
    observationLocation: '',
    category: undefined,
    criticality: undefined,
    targetDate: '',
    assignedToId: null,
    raisedbyName: this.currentUserName,
    raisedbyEmail: this.currentUserEmail
  };

  constructor(private ngxService: NgxUiLoaderService,
    private qioService: QioService,
    private toastrService: ToastrService,) { }

  async ngOnInit() {
    this.currentUserName = localStorage.getItem("currentUserName") || '';
    this.currentUserEmail = localStorage.getItem("currentUserEmail") || '';
    // try {
    //   // this.sites = await this.supabaseService.getSites();
    // } catch (error) {
    //   console.error('Error loading sites:', error);
    // }
    this.fetchSites();
  }

  fetchSites() {
    this.ngxService.start();
    this.qioService.getAllQIOSites().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        this.sites = items;
        console.log("sites", this.sites)
        this.fetchSiteLocations();
        // this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }
  fetchSiteLocations() {
    // this.ngxService.start();
    this.qioService.getAllQIOObservationLocations().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        this.locations = items;
        console.log("locations", this.locations)
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }

  async onSiteChange() {
    this.formData.observationLocation = '';
    this.formData.assignedTo = '';
    this.locations = [];
    this.qualityReps = [];

    if (this.formData.observationforSite) {
      try {
        const siteObj = data.find(item => item.site === siteName);

        const locations = siteObj ? siteObj.locations : [];
        console.log(locations); // ["Assembly Line", "Packaging Area", ...]

        // this.locations = await this.supabaseService.getLocationsBySite(this.formData.site_id);
        // this.qualityReps = await this.supabaseService.getQualityRepresentativesBySite(this.formData.site_id);

        const defaultRep = this.qualityReps.find(rep => rep.isDefault);
        if (defaultRep) {
          this.formData.assignedToId = defaultRep.id;
        }
      } catch (error) {
        console.error('Error loading site data:', error);
      }
    }
  }

  onCriticalityChange() {
    if (this.formData.criticality) {
      const today = new Date();
      const targetDate = new Date(today);

      if (this.formData.criticality === 'High') {
        targetDate.setDate(today.getDate() + 7);
      } else {
        targetDate.setMonth(today.getMonth() + 1);
      }

      this.formData.targetDate = targetDate.toISOString().split('T')[0];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = '';
  }

  async onSubmit() {
    if (!this.selectedFile) {
      this.submitError = true;
      this.submitMessage = 'Please select an evidence image';
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitError = false;

    try {
      // const imageUrl = await this.supabaseService.uploadImage(this.selectedFile);

      // const qioData: QIO = {
      //   evidenceImageUrl: "",
      //   // evidence_image_url: imageUrl,
      //   observation: this.formData.observation!,
      //   observationforSite: this.formData.observationforSite!,
      //   observationLocation: this.formData.observationLocation!,
      //   category: this.formData.category!,
      //   criticality: this.formData.criticality!,
      //   targetDate: this.formData.targetDate!,
      //   assignedToId: this.formData.assignedToId!,
      //   raisedbyName: this.formData.raisedbyName!,
      //   raisedbyEmail: this.formData.raisedbyEmail!
      // };

      // const createdQIO = await this.supabaseService.createQIO(qioData);

      const assignedRep = this.qualityReps.find(rep => rep.id === this.formData.assignedToId);
      if (assignedRep) {
        try {
          // await this.supabaseService.sendQIONotification(createdQIO, assignedRep);
        } catch (notifError) {
          console.warn('Email notification failed:', notifError);
        }
      }

      this.submitMessage = 'QIO submitted successfully!';
      this.submitError = false;

      setTimeout(() => {
        this.resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error submitting QIO:', error);
      this.submitError = true;
      this.submitMessage = 'Failed to submit QIO. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.formData = {
      observation: '',
      observationforSite: '',
      observationLocation: '',
      category: undefined,
      criticality: undefined,
      targetDate: '',
      assignedToId: null,
      raisedbyName: '',
      raisedbyEmail: ''
    };
    this.selectedFile = null;
    this.imagePreview = '';
    this.locations = [];
    this.qualityReps = [];
    this.submitMessage = '';
  }
}
