const ErrInvalidJSON = new Error('invalid JSON')
const ErrInvalidID = new Error('invalid ID')
const ErrDocumentHasError = new Error('document has an error')
const ErrIDRequired = new Error('ID is required')
const ErrFieldsRequired = new Error('fields are required')
const ErrDuplicatedCond = new Error('duplicated condition')
const ErrNotUpdatableObject = new Error('not updatable object')

export {
  ErrInvalidJSON,
  ErrInvalidID,
  ErrDocumentHasError,
  ErrIDRequired,
  ErrFieldsRequired,
  ErrDuplicatedCond,
  ErrNotUpdatableObject
}
