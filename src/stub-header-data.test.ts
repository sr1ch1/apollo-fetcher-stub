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
})
