# Service Weaver

An elegant solution to create standardized CRUD services with minimal code.

## Overview

**Service Weaver** provides a generic structure for implementing services with basic CRUD operations for any entity. It follows a defined pattern of calls, ensuring consistency in requests and eliminating repetitive code.

### Key Features

- Create complete services in just one line of code
- Flexibility to choose any HTTP request library (Axios, Fetch, etc.)
- Easily customize route formats with resolvers
- Extend the base class to add specific methods
- Configure once and reuse throughout your project

🚨 **Important**: `Service Weaver` works best when the backend follows a standardized RESTful endpoints structure.

## Installation

```bash
npm install service-weaver
```

## Initial Configuration

The first step is to configure the `ServiceWeaverBuilder` with your API instance. Here we'll use axios as an example, but as mentioned before, the project is agnostic to the HTTP request library:

```typescript
// serviceConfig.ts
import axios from 'axios';
import { ServiceWeaverBuilder } from 'service-weaver';

// Configure the API
const api = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get the configured Service class
export const ConfiguredService = ServiceWeaverBuilder.build(api);
```

## Basic Usage

After configuration, you can create services for any entity in just one line:

```typescript
// userService.ts
import { ConfiguredService } from './serviceConfig';

export const UserService = new ConfiguredService('/api/users');

// productService.ts
import { ConfiguredService } from './serviceConfig';

export const ProductService = new ConfiguredService('/api/products');
```

Each created service already has the following methods ready to use:

| Method   | Parameters | Description |
|----------|------------|-------------|
| `create` | (data, headers?) | Creates a new resource |
| `get` | (queryParams?, headers?) | Gets a list of resources |
| `getById` | (id, headers?) | Gets a specific resource by ID |
| `update` | (id, data, headers?) | Updates an existing resource |
| `patch` | (id, data, headers?) | Partially updates a resource |
| `delete` | (id, headers?) | Removes a resource |
| `getPage` | (page, data?, headers?) | Gets resources with pagination |

## Standard Methods and Default Routes

When instantiating a `Service`, the base endpoint is passed, and all methods will be applied on that root:

| Method   | Default Route    | HTTP Request |
|----------|-----------------|------------|
| `create` | `/`             | `POST /api/users` |
| `get`    | `/`             | `GET /api/users` |
| `getById`| `/{id}`         | `GET /api/users/123` |
| `update` | `/{id}`         | `PUT /api/users/123` |
| `patch`  | `/{id}`         | `PATCH /api/users/123` |
| `delete` | `/{id}`         | `DELETE /api/users/123` |
| `getPage`| `/page/{page}`  | `POST /api/users/page/0` |

## Advanced Use Cases

### Extending the Service

If you need to add specific methods that don't follow the CRUD pattern:

```typescript
// customUserService.ts
import { ConfiguredService } from './serviceConfig';

class CustomUserService extends ConfiguredService {
  constructor(url: string) {
    super(url);
  }

  getUserMetrics = async (page: number = 0, data: any) => {
    return await this.getApi().post(
      `${this.getURL()}/metrics/page/${page}`,
      data
    );
  };
  
  activateUser = async (id: string | number) => {
    return await this.getApi().put(
      `${this.getURL()}/${id}/activate`,
      {}
    );
  };
}

// Create an instance of the extended service
export const userService = new CustomUserService('/api/users');
```

### Customizing the Resolver

If your API's URL format is different from the standard, you can create a custom resolver:

```typescript
import { ServiceWeaverBuilder, IEndpointResolver } from 'service-weaver';

class CustomResolver implements IEndpointResolver {
  constructor(private baseURL: string) {}

  getRoot(): string {
    return `${this.baseURL}/custom`;
  }

  getById(id: string | number): string {
    return `${this.baseURL}/custom/${id}`;
  }

  update(id: string | number): string {
    return `${this.baseURL}/custom/${id}/edit`;
  }

  delete(id: string | number): string {
    return `${this.baseURL}/custom/${id}/remove`;
  }

  getPage(page: number): string {
    return `${this.baseURL}/custom/page/${page}`;
  }

  patch(id: string | number): string {
    return `${this.baseURL}/custom/${id}/modify`;
  }
}

// Create a factory function for the custom resolver
const customResolverFactory = (url: string) => new CustomResolver(url);

// Create a configured version of the Service with the custom resolver
const CustomConfiguredService = ServiceWeaverBuilder.build(api, customResolverFactory);

// Use the service with the custom resolver
export const UserService = new CustomConfiguredService('/api/users');
```

Alternatively, you can pass a specific resolver for an individual service:

```typescript
import { ConfiguredService } from './serviceConfig';

const customResolver = new CustomResolver('/api/users');
export const UserService = new ConfiguredService('/api/users', undefined, customResolver);
```

### Using a Specific API for a Service

If you need to use a different API instance for a specific service:

```typescript
import { ConfiguredService } from './serviceConfig';
import axios from 'axios';

const specialApi = axios.create({
  baseURL: 'https://special-api.example.com',
  headers: {
    'Authorization': 'Bearer special-token'
  }
});

export const SpecialService = new ConfiguredService('/special-resource', specialApi);
```

## Architecture and Components

### ServiceWeaverBuilder

The `ServiceWeaverBuilder` allows you to configure a customized version of the `Service` with your own standards:

```typescript
export class ServiceWeaverBuilder {
  static build(
    api: IApiService,
    customResolverFactory?: (url: string) => IEndpointResolver
  ): typeof Service {
    // Returns a configured class
  }
}
```

### Service

The main class that implements the standard CRUD methods:

```typescript
export class Service {
  constructor(
    private url: string,
    api: IApiService,
    resolver?: IEndpointResolver
  ) {
    // Initialization
  }

  // CRUD methods
  create = async <T, U = unknown>(data: U, headers?: Record<string, string>) => {...}
  get = async <T>(queryParams?: Record<string, string | number>, headers?: Record<string, string>) => {...}
  getById = async <T>(id: number | string, headers?: Record<string, string>) => {...}
  update = async <T, U = unknown>(id: number | string, data: U, headers?: Record<string, string>) => {...}
  patch = async <T, U = unknown>(id: number | string, data: U, headers?: Record<string, string>) => {...}
  delete = async <T>(id: number | string, headers?: Record<string, string>) => {...}
  getPage = async <T, U = unknown>(page: number, data?: U, headers?: Record<string, string>) => {...}

  // Utility methods
  getApi = () => this.api;
  getURL = () => this.resolver.getRoot();
}
```

### Interfaces

#### IApiService

Abstracts the HTTP client allowing flexibility in the choice of library:

```typescript
export interface IApiService {
  post<T, U = unknown>(url: string, data?: U, headers?: Record<string, string>): Promise<T | undefined>;
  put<T, U = unknown>(url: string, data: U, headers?: Record<string, string>): Promise<T | undefined>;
  patch<T, U = unknown>(url: string, data: U, headers?: Record<string, string>): Promise<T | undefined>;
  delete<T>(url: string, headers?: Record<string, string>): Promise<T | undefined>;
  get<T>(url: string, queryParams?: Record<string, string | number>, headers?: Record<string, string>): Promise<T | undefined>;
}
```

#### IEndpointResolver

Defines how URLs are constructed:

```typescript
export interface IEndpointResolver {
  getRoot(): string;
  getById(id: string | number): string;
  update(id: string | number): string;
  delete(id: string | number): string;
  getPage(page: number): string;
  patch(id: string | number): string;
}
```

#### ResponseDTO

Interface for standardizing responses:

```typescript
export interface ResponseDTO<T> {
  data?: T | any;
  time: string;
}
```

#### Page

Interface for standardizing paginated responses:

```typescript
export interface Page<T> {
  totalElements: number;
  totalPages: number;
  pageable: any;
  number: number;
  content: Array<T>;
  numberOfElements: number;
  hasContent: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
  size: number;
}
```

## Benefits of Service Weaver

✅ **Standardization**: All entities follow a consistent model of API calls.  
✅ **Reuse**: Significantly reduces code duplication.  
✅ **Extensibility**: Allows adding new specific methods as needed.  
✅ **Low Coupling**: Makes it easy to change the API implementation without impacting services.  
✅ **Flexibility**: Compatible with any HTTP request library.  
✅ **Customization**: Adapts to different API structures through resolvers.  
✅ **Productivity**: Create complete services in seconds instead of minutes.

## Contribution

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT

---

Developed by [Edson Alencar](https://github.com/Edsonalencar)