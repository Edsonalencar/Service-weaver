# GenericService

Uma solução elegante para criar services CRUD completos de forma padronizada e com o mínimo de código.

## Visão Geral

O **GenericService** fornece uma estrutura genérica para implementação de serviços com operações básicas de CRUD para qualquer entidade. Ele segue um padrão de chamadas definido, garantindo consistência nas requisições e eliminando código repetitivo.

### Características Principais

- Crie services completos em apenas uma linha de código
- Flexibilidade para escolher qualquer biblioteca de requisições HTTP (Axios, Fetch, etc.)
- Personalize facilmente o formato das rotas com resolvers
- Estenda a classe base para adicionar métodos específicos
- Configure uma única vez e reutilize em todo o projeto

🚨 **Importante**: O `GenericService` funciona melhor quando o backend segue uma estrutura padronizada de endpoints RESTful.

## Instalação

```bash
npm install @edsonalencar/generic-service
```

## Configuração Inicial

O primeiro passo é configurar o `GenericServiceBuilder` com a sua instância de API:

```typescript
// serviceConfig.ts
import axios from 'axios';
import { GenericServiceBuilder } from '@edsonalencar/generic-service';

// Configurar a API
const api = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Obter a classe GenericService configurada
export const ConfiguredGenericService = GenericServiceBuilder.build(api);
```

## Uso Básico

Depois de configurar, você pode criar services para qualquer entidade em apenas uma linha:

```typescript
// userService.ts
import { ConfiguredGenericService } from './serviceConfig';

export const UserService = new ConfiguredGenericService('/api/users');

// productService.ts
import { ConfiguredGenericService } from './serviceConfig';

export const ProductService = new ConfiguredGenericService('/api/products');
```

Cada service criado já possui os seguintes métodos prontos para uso:

| Método   | Parâmetros | Descrição |
|----------|------------|-----------|
| `create` | (data, headers?) | Cria um novo recurso |
| `get` | (queryParams?, headers?) | Obtém uma lista de recursos |
| `getById` | (id, headers?) | Obtém um recurso específico pelo ID |
| `update` | (id, data, headers?) | Atualiza um recurso existente |
| `patch` | (id, data, headers?) | Atualiza parcialmente um recurso |
| `delete` | (id, headers?) | Remove um recurso |
| `getPage` | (page, data?, headers?) | Obtém recursos com paginação |

## Métodos Padrões e Rotas Default

Ao instanciar um `GenericService`, é passado o endpoint base, e todos os métodos serão aplicados sobre essa raiz:

| Método   | Rota Padrão      | Requisição HTTP |
|----------|-----------------|------------|
| `create` | `/`             | `POST /api/users` |
| `get`    | `/`             | `GET /api/users` |
| `getById`| `/{id}`         | `GET /api/users/123` |
| `update` | `/{id}`         | `PUT /api/users/123` |
| `patch`  | `/{id}`         | `PATCH /api/users/123` |
| `delete` | `/{id}`         | `DELETE /api/users/123` |
| `getPage`| `/page/{page}`  | `POST /api/users/page/0` |

## Casos de Uso Avançados

### Estendendo o GenericService

Se você precisar adicionar métodos específicos que não seguem o padrão CRUD:

```typescript
// customUserService.ts
import { ConfiguredGenericService } from './serviceConfig';

class CustomUserService extends ConfiguredGenericService {
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

// Criar uma instância do service estendido
export const userService = new CustomUserService('/api/users');
```

### Personalizando o Resolver

Se o formato das URLs da sua API for diferente do padrão, você pode criar um resolver personalizado:

```typescript
import { GenericServiceBuilder, IEndpointResolver } from '@edsonalencar/generic-service';

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

// Criar factory function para o resolver personalizado
const customResolverFactory = (url: string) => new CustomResolver(url);

// Criar uma versão configurada do GenericService com o resolver personalizado
const CustomConfiguredGenericService = GenericServiceBuilder.build(api, customResolverFactory);

// Usar o serviço com o resolver personalizado
export const UserService = new CustomConfiguredGenericService('/api/users');
```

Alternativamente, você pode passar um resolver específico para um service individual:

```typescript
import { ConfiguredGenericService } from './serviceConfig';

const customResolver = new CustomResolver('/api/users');
export const UserService = new ConfiguredGenericService('/api/users', undefined, customResolver);
```

### Utilizando uma API específica para um service

Se você precisar usar uma instância de API diferente para um service específico:

```typescript
import { ConfiguredGenericService } from './serviceConfig';
import axios from 'axios';

const specialApi = axios.create({
  baseURL: 'https://special-api.example.com',
  headers: {
    'Authorization': 'Bearer special-token'
  }
});

export const SpecialService = new ConfiguredGenericService('/special-resource', specialApi);
```

## Arquitetura e Componentes

### GenericServiceBuilder

O `GenericServiceBuilder` permite configurar uma versão personalizada do `GenericService` com seus próprios padrões:

```typescript
export class GenericServiceBuilder {
  static build(
    api: IApiService,
    customResolverFactory?: (url: string) => IEndpointResolver
  ): typeof GenericService {
    // Retorna uma classe configurada
  }
}
```

### GenericService

A classe principal que implementa os métodos CRUD padrão:

```typescript
export class GenericService {
  constructor(
    private url: string,
    api: IApiService,
    resolver?: IEndpointResolver
  ) {
    // Inicialização
  }

  // Métodos CRUD
  create = async <T, U = unknown>(data: U, headers?: Record<string, string>) => {...}
  get = async <T>(queryParams?: Record<string, string | number>, headers?: Record<string, string>) => {...}
  getById = async <T>(id: number | string, headers?: Record<string, string>) => {...}
  update = async <T, U = unknown>(id: number | string, data: U, headers?: Record<string, string>) => {...}
  patch = async <T, U = unknown>(id: number | string, data: U, headers?: Record<string, string>) => {...}
  delete = async <T>(id: number | string, headers?: Record<string, string>) => {...}
  getPage = async <T, U = unknown>(page: number, data?: U, headers?: Record<string, string>) => {...}

  // Métodos de utilidade
  getApi = () => this.api;
  getURL = () => this.resolver.getRoot();
}
```

### Interfaces

#### IApiService

Abstrai o cliente HTTP permitindo flexibilidade na escolha da biblioteca:

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

Define como as URLs são construídas:

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

Interface para padronização das respostas:

```typescript
export interface ResponseDTO<T> {
  data?: T | any;
  time: string;
}
```

#### Page

Interface para padronização de respostas paginadas:

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

## Benefícios do GenericService

✅ **Padronização**: Todas as entidades seguem um modelo consistente de chamadas à API.  
✅ **Reutilização**: Reduz significativamente a duplicação de código.  
✅ **Extensibilidade**: Permite adicionar novos métodos específicos conforme necessário.  
✅ **Baixo Acoplamento**: Facilita a troca de implementação da API sem impacto nos services.  
✅ **Flexibilidade**: Compatível com qualquer biblioteca de requisições HTTP.  
✅ **Personalização**: Adapta-se a diferentes estruturas de API através de resolvers.  
✅ **Produtividade**: Crie services completos em segundos em vez de minutos.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

MIT

---

Desenvolvido por [Edson Alencar](https://github.com/Edsonalencar)