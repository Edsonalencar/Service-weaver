// genericServiceBuilder.ts
import { IApiService, IEndpointResolver } from "./interface";
import { GenericService } from "./genericService";
import { DefaultResolver } from "./defaultResolver";

export class GenericServiceBuilder {
  /**
   * Cria uma classe GenericService pré-configurada com uma API e um resolver opcional
   * @param api Instância da API que implementa IApiService
   * @param customResolverFactory Factory function opcional para criar resolvers
   * @returns Uma classe GenericService configurada
   */

  static build(
    api: IApiService,
    customResolverFactory?: (url: string) => IEndpointResolver
  ): typeof GenericService {
    const resolverFactory =
      customResolverFactory || ((url: string) => new DefaultResolver(url));

    return class ConfiguredGenericService extends GenericService {
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
