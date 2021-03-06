import fs from 'fs';
import path from 'path';
import { setInterval } from 'timers';
import { IndexerAdapter } from '../indexer/IndexerAdapter';
import { ISearcher } from './ISearcher';
import { getSearchConfig } from '../../../../shared/utils/search-utils';

const { Index } = require('flexsearch');

class Searcher {
  private index: any;

  constructor() {
    this.index = null;
  }

  public search(params: ISearcher): number[] {
    if (this.index) {
      const results = this.index.search(params.query, params.params ? params.params : null);
      return results;
    }
    return [];
  }

  public loadIndex(pathToDictionary: string) {
    if (!this.index) {
      const index = new Index(getSearchConfig());
      const indexerAdapter = new IndexerAdapter();
      if (fs.existsSync(pathToDictionary)) {
        fs.readdirSync(pathToDictionary).forEach((filename) => {
          const file = path.join(pathToDictionary, filename);
          const indexFile = indexerAdapter.getFileIndex(filename);
          const data: any = fs.readFileSync(file, 'utf8');
          index.import(indexFile, data ?? null);
        });
        this.index = index;
        setInterval(this.closeIndex, 60000); // Close index after 1 minute
      }
    }
  }

  public closeIndex() {
    this.index = null;
  }
}

export const searcher = new Searcher();
