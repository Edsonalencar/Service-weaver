// serviceWeaverBuilder.ts
import { IApiService, IEndpointResolver } from "./interface";
import { ServiceWeaver } from "./serviceWeaver";
import { DefaultResolver } from "./defaultResolver";

export class ServiceWeaverBuilder {
  /**
   * Cria uma classe ServiceWeaver pré-configurada com uma API e um resolver opcional
   * @param api Instância da API que implementa IApiService
   * @param customResolverFactory Factory function opcional para criar resolvers
   * @returns Uma classe ServiceWeaver configurada
   */

  static build(
    api: IApiService,
    customResolverFactory?: (url: string) => IEndpointResolver
  ): typeof ServiceWeaver {
    const resolverFactory =
      customResolverFactory || ((url: string) => new DefaultResolver(url));

    return class ConfiguredGenericService extends ServiceWeaver {
      constructor(
        url: string,
        customApi?: IApiService,
        customResolver?: IEndpointResolver
      ) {
        const finalApi = customApi || api;

        const finalResolver = customResolver || resolverFactory(url);

        super(url, finalApi, finalResolver);
      }
    };
  }
}
