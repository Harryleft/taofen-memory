export interface IIIFCollection {
  "@context": string;
  id: string;
  type: "Collection";
  label: { [key: string]: string[] };
  items?: IIIFCollectionItem[];
}

export interface IIIFCollectionItem {
  id: string;
  type: "Collection" | "Manifest";
  label: { [key: string]: string[] };
}

export interface IIIFManifest {
  "@context": string;
  id: string;
  type: "Manifest";
  label: { [key: string]: string[] };
  sequences?: IIIFSequence[];
}

export interface IIIFSequence {
  id: string;
  type: "Sequence";
  canvases: IIIFCanvas[];
}

export interface IIIFCanvas {
  id: string;
  type: "Canvas";
  images: IIIFImage[];
}

export interface IIIFImage {
  id: string;
  type: "Image";
  resource: IIIFResource;
}

export interface IIIFResource {
  id: string;
  type: string;
  service?: IIIFService;
}

export interface IIIFService {
  "@context": string;
  id: string;
  profile: string;
}