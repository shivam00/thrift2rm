# tutorial

> tutorial

> tutorial

> tutorial

> tutorial

> tutorial

> tutorial

> tutorial

> tutorial

## Types

### MyInteger

> i32 MyInteger

## Data Structures

### Work

Key | Field | Type | Description | Required | Default value
--- | --- | --- | --- | --- | ---
1 | num1 | i32 |  |  | 0
2 | num2 | i32 |  |  | 
3 | op | [Operation](#Operation) |  |  | 
4 | comment | string |  | optional | 

## Services

### Calculator

#### Function: ping

> void ping() 

#### Function: add

> i32 add(i32 num1, i32 num2) 

#### Function: calculate

> i32 calculate(i32 logid, [Work](#Work) w) throws [InvalidOperation](#InvalidOperation) ouch

#### Function: zip

> void zip() 
