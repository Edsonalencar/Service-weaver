// Exporta as classes principais
export { ServiceWeaver } from "./serviceWeaver";
export { ServiceWeaverBuilder } from "./serviceWeaverBuilder";
export { DefaultResolver } from "./defaultResolver";

// Exporta as interfaces como tipos
export type {
  IApiService,
  IEndpointResolver,
  ResponseDTO,
  Page,
} from "./interface";

// Exportação padrão do builder para facilitar a importação
import { ServiceWeaverBuilder } from "./serviceWeaverBuilder";
export default ServiceWeaverBuilder;
