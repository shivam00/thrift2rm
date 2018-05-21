namespace java com.creditkarma.common
#@namespace scala com.creditkarma.common

struct Metadata {
    1: required string appId
    2: required string traceId
}

struct MetaException {
    1: required string message
}

service MetaService {
  Metadata echo() throws (1: MetaException ex)
}
