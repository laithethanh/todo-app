import { Tag } from "../types";
import api from "./api";

export const tagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const res = await api.get<Tag[]>("/tags");
    return res.data;
  },
};

export default tagService;
