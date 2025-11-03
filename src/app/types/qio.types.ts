export interface Site {
  id: string;
  title: string;
}

export interface Location {
  id: number,
  site: string,
  locations: string[]
}

export interface QualityRepresentative {
  id: number;
  site: string;
  representativeId:number;
  representativeName: string;
  representativeEmail: string;
  isDefault: boolean;
}

export interface QIO {
  id?: number;
  caseID?:number;
  evidenceImageUrl?: string;
  observation: string;
  observationforSite: string;
  observationLocation: string;
  category: string;
  criticality: string;
  targetDate: string;
  assignedTo: string;
  assignedToEmail:string;
  assignedToId?: number | null
  createdDate: Date
  raisedbyName: string;
  raisedbyEmail: string;
  status?: string;
  evidenceImages?:File;
  resolutionImages?:File;
}

export interface QIOWithDetails extends QIO {
  site?: Site;
  location?: Location;
  assigned_to?: QualityRepresentative;
}
