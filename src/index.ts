// index.ts

// Exporta as classes principais
export { GenericService } from "./genericService";
export { GenericServiceBuilder } from "./genericServiceBuilder";
export { DefaultResolver } from "./defaultResolver";

// Exporta as interfaces como tipos
export type {
  IApiService,
  IEndpointResolver,
  ResponseDTO,
  Page,
} from "./interface";

// Exportação padrão do builder para facilitar a importação
import { GenericServiceBuilder } from "./genericServiceBuilder";
export default GenericServiceBuilder;
