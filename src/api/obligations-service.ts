import { BaseService } from './base-service';

const BASE_URL = 'https://osskb.org/api';

class ObligationsService extends BaseService {
  private cache: Map<string, any> = new Map();

  public async getObligations(spdxIds: string[]): Promise<any[]> {
    const p = spdxIds.map((spdxId) => this.getObligation(spdxId));
    return await Promise.all(p);
  }

  public async getObligation(spdxId: string): Promise<any> {
    try {
      if (this.cache.has(spdxId)) {
        return this.cache.get(spdxId);
      }

      const response = await fetch(`${BASE_URL}/license/obligations/${spdxId}`);
      if (response.ok) {
        const obligations = this.mapper(await response.json());
        this.cache.set(spdxId, obligations);
        return obligations;
      }
      throw new Error(response.statusText);
    } catch (error: any) {
      console.log(error);
      return { label: spdxId };
    }
  }

  private mapper(obligations) {
    return Object.keys(obligations).map((key) => ({
      label: key,
      ...obligations[key][0],
      incompatibles: obligations[key][0].incompatible_with?.split(','),
    }))[0];
  }
}

export default new ObligationsService();
