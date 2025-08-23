import { IIIFCollection, IIIFManifest } from './iiifTypes';

const BASE_URL = 'https://www.ai4dh.cn/iiif';

export class NewspaperService {
  static async getPublications(): Promise<IIIFCollection> {
    try {
      const response = await fetch(`${BASE_URL}/manifests/collection.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch publications:', error);
      throw error;
    }
  }

  static async getIssues(publicationId: string): Promise<IIIFCollection> {
    try {
      const response = await fetch(`${BASE_URL}/3/manifests/${publicationId}/collection.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  static async getManifest(manifestId: string): Promise<IIIFManifest> {
    try {
      const response = await fetch(`${BASE_URL}/3/manifests/${manifestId}/manifest.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch manifest:', error);
      throw error;
    }
  }

  static extractPublicationId(collectionUrl: string): string {
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }

  static extractIssueId(manifestUrl: string): string {
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }
}