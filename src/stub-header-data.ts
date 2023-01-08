import type {FetcherHeaders} from "@apollo/utils.fetcher";

export class StubHeaderData implements FetcherHeaders {

  private _data: Map<string, string> = new Map<string, string>();

  append(name: string, value: string): void {
    if (this._data.has(name)) {
      this._data.set(name, this._data.get(name) + ', ' + value);
    } else {
      this._data.set(name, value);
    }
  }

  delete = (name: string) => { this._data.delete(name); };
  get = (name: string): string | null => this._data.get(name) ?? null;
  has = (name: string): boolean => this._data.has(name);
  set = (name: string, value: string) => { this._data.set(name, value); };
  entries = (): Iterator<[string, string]> => this._data.entries();
  keys = (): Iterator<string> => this._data.keys();
  values = (): Iterator<string> => this._data.values();
  [Symbol.iterator](): Iterator<[string, string]> { return this._data.entries(); }
}
