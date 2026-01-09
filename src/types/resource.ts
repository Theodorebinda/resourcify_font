export type ResourceCategory =
  | "All categories"
  | "Category1"
  | "Category2"
  | "Category3"
  | "Category4";

export type DocumentAsset = {
  id: string;
  category: ResourceCategory;
  title: string;
  thumbnail: string;
};

