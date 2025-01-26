import {StubHeaderData} from "./stub-header-data";

describe('StubHeaderData', () => {
  it('append should add single header', () => {
    const header = new StubHeaderData()

    header.append('Accept', 'application/json');

    expect(header.get('Accept')).toBe('application/json')
  })

  it('append should add multiple header with the same name', () => {
    const header = new StubHeaderData()

    header.append('Accept', 'text/html');
    header.append('Accept', 'application/xhtml+xml');

    expect(header.get('Accept')).toBe('text/html, application/xhtml+xml')
    expect(header.get('Other')).toBeNull();
  })

  it('should implement has and set properly', () => {
    const header = new StubHeaderData()

    header.set('Accept', 'application/json');

    expect(header.has('Accept')).toBeTruthy();
  })

  it('keys and values should return values', () => {
    const header = new StubHeaderData()

    header.append('Content-Type', 'text/html');
    header.append('Content-Length', '123');

    // @ts-expect-error this is a false positive
    const keys = [...header.keys()];

    // @ts-expect-error this is a false positive
    const values = [...header.values()];

    expect(keys).toEqual(['Content-Type', 'Content-Length']);
    expect(values).toEqual(['text/html', '123']);
  })

  it('delete should remove header value', () => {
    const header = new StubHeaderData()

    header.append('Content-Type', 'text/html');
    header.append('Content-Length', '123');
    header.delete('Content-Type');

    expect(header.get('Content-Type')).toBeNull();
    expect(header.get('Content-Length')).toBe('123')
  })

  it('entries should return values', () => {
    const header = new StubHeaderData()

    header.append('Content-Type', 'text/html');
    header.append('Content-Length', '123');

    // @ts-expect-error this is a false positive
    const entries = [...header.entries()];

    expect(entries).toEqual([['Content-Type', 'text/html'], ['Content-Length', '123']]);
  })
})
