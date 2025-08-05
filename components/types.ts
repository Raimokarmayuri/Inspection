// export type RootStackParamList = {
//     Dashboard: { propertyMasterId: number };
//     PropertyDetails: { propertyId: number };
//     PropertyForm: undefined;
//     Login: undefined;
//   };
  
// export interface BasicFormData {
//     buildingName: string;
//     uniqueRef: string;
//     date: string;
//     location: string;
//     floor: string;
//     floorPlan: string[];
//   }
  
//   export interface FormData {
//     doorNumber: string;
//     doorType: string;
//     doorOther: string;
//     doorPhotos: string[];
//     fireResistance: string;
//     head: string;
//     hinge: string;
//     hingeLocation: string;
//     closing: string;
//     threshold: string;
//     doorThickness: string;
//     frameDepth: string;
//     doorSize: string;
//     fullDoorsetSize: string;
//     comments: string;
//   }
  
//   export interface ComplianceCheck {
//     intumescentStrips: boolean;
//     coldSmokeSeals: boolean;
//     selfClosingDevice: boolean;
//     fireLockedSign: boolean;
//     fireShutSign: boolean;
//     holdOpenDevice: boolean;
//     visibleCertification: boolean;
//     doorGlazing: boolean;
//     pyroGlazing: boolean;
//   }
  
//   export interface ActionMenuFlag {
//     head: boolean;
//     hinge: boolean;
//     closing: boolean;
//     threshold: boolean;
//   }
  
//   export interface ActionImages {
//     head: string[];
//     hinge: string[];
//     closing: string[];
//     threshold: string[];
//   }
  export interface BasicFormData {
  buildingName: string;
  uniqueRef: string;
  date: string;
  location: string;
  floor: string;
  floorPlan: string[];
  additionalPhotos: string[];
}

export interface FormData {
  doorNumber: string;
  doorType: string;
  doorOther: string;
  doorPhoto: string[];
  fireResistance: string;
  head: string;
  hinge: string;
  hingeLocation: string;
  closing: string;
  threshold: string;
  doorThickness: string;
  frameDepth: string;
  doorSize: string;
  fullDoorsetSize: string;
  comments: string;

  [key: string]: string | string[] | undefined;
}

export interface ComplianceCheck {
  intumescentStrips: boolean;
  coldSmokeSeals: boolean;
  selfClosingDevice: boolean;
  fireLockedSign: boolean;
  fireShutSign: boolean;
  holdOpenDevice: boolean;
  visibleCertification: boolean;
  doorGlazing: boolean;
  pyroGlazing: boolean;

  [key: string]: boolean | string | undefined;
}

export interface ActionMenuFlag {
  head: boolean;
  hinge: boolean;
  closing: boolean;
  threshold: boolean;
  intumescentStrips?: boolean;
  coldSmokeSeals?: boolean;
  selfClosingDevice?: boolean;
  fireLockedSign?: boolean;
  fireShutSign?: boolean;
  pyroGlazing?: boolean;
    [key: string]: boolean | undefined; // 👈 add this line

}

export interface ActionImages {
  [key: string]: string[] | undefined;
}
