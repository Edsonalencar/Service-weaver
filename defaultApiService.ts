import { BaseApi } from "../baseApi/baseAPI";
import { IApiService } from "./interface";

export const defaultApiService: IApiService = new BaseApi();
