# PetsApi

All URIs are relative to *http://petstore.swagger.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPets**](#createpets) | **POST** /pets | Create a pet|
|[**listPets**](#listpets) | **GET** /pets | List all pets|
|[**showPetById**](#showpetbyid) | **GET** /pets/{petId} | Info for a specific pet|

# **createPets**
> createPets()


### Example

```typescript
import {
    PetsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PetsApi(configuration);

const { status, data } = await apiInstance.createPets();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Null response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPets**
> listPets()


### Example

```typescript
import {
    PetsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PetsApi(configuration);

let limit: number; //How many items to return at one time (max 100) (optional) (default to undefined)

const { status, data } = await apiInstance.listPets(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | How many items to return at one time (max 100) | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A paged array of pets |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **showPetById**
> showPetById()


### Example

```typescript
import {
    PetsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PetsApi(configuration);

let petId: string; //The id of the pet to retrieve (default to undefined)

const { status, data } = await apiInstance.showPetById(
    petId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **petId** | [**string**] | The id of the pet to retrieve | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Expected response to a valid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

