package jsonapi

type Query struct {
	Collection string `json:"collection"`
	FieldPath string `json:"fieldPath"`
	Operation string `json:"operation"`
	Value string `json:"value"` //,omitempty
}